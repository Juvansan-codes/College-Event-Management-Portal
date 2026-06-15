import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { mockDb } from './mockDb'
import type { ApiResult, Poll, PollOption } from '../types'

export const pollService = {
  isConfigured(): boolean {
    return isSupabaseConfigured
  },

  /** Fetch all polls with aggregated option votes and indicate if a user voted */
  async getPolls(userId?: string): Promise<ApiResult<Poll[]>> {
    if (!isSupabaseConfigured || !supabase) {
      return { data: mockDb.getPolls(userId), error: null }
    }

    try {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          id,
          question,
          is_live,
          created_at,
          poll_options (
            id,
            text,
            poll_votes (count)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Supabase polls error, falling back to mockDb:', error.message)
        return { data: mockDb.getPolls(userId), error: null }
      }

      // Fetch user's votes to see if they voted on any of the polls
      let userVotes: any[] = []
      if (userId) {
        const { data: uvData, error: uvErr } = await supabase
          .from('poll_votes')
          .select('*')
          .eq('user_id', userId)
        if (!uvErr && uvData) {
          userVotes = uvData
        }
      }

      const polls: Poll[] = (data || []).map((p: any) => {
        const userVote = userVotes.find((v: any) => v.poll_id === p.id)
        const options: PollOption[] = (p.poll_options || []).map((o: any) => {
          const votesCount = o.poll_votes && o.poll_votes[0] ? o.poll_votes[0].count : 0
          return {
            id: o.id,
            text: o.text,
            votes: votesCount,
          }
        })
        
        const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0)
        
        return {
          id: p.id,
          question: p.question,
          options,
          isLive: p.is_live,
          totalVotes,
          createdAt: p.created_at ? new Date(p.created_at).toLocaleString() : 'Live Just Now',
          userVotedOptionId: userVote ? userVote.option_id : undefined,
        }
      })

      return { data: polls, error: null }
    } catch (err) {
      console.warn('Supabase polls catch error, falling back to mockDb:', err)
      return { data: mockDb.getPolls(userId), error: null }
    }
  },

  /** Check if a user has already voted in a specific poll */
  async hasUserVoted(pollId: string, userId: string): Promise<ApiResult<boolean>> {
    if (!isSupabaseConfigured || !supabase) {
      const votes = mockDb.getVotes?.() || []
      const hasVoted = votes.some((v: any) => v.poll_id === pollId && v.user_id === userId)
      return { data: hasVoted, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        return { data: false, error: null }
      }

      return { data: !!data, error: null }
    } catch (err) {
      return { data: false, error: err instanceof Error ? err.message : 'Failed to check vote status' }
    }
  },

  /** Cast a vote in a live poll (with constraint check) */
  async vote(pollId: string, optionId: string, userId: string): Promise<ApiResult<any>> {
    if (!isSupabaseConfigured || !supabase) {
      try {
        const vote = mockDb.voteInPoll(pollId, optionId, userId)
        return { data: vote, error: null }
      } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Failed to cast vote' }
      }
    }

    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          option_id: optionId,
          user_id: userId,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // PostgreSQL unique constraint violation
          return { data: null, error: 'You have already voted in this poll. One person, one vote!' }
        }
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to cast vote' }
    }
  },

  /** Create a new live poll with custom options */
  async createPoll(question: string, options: string[], organizerId: string): Promise<ApiResult<Poll>> {
    if (!isSupabaseConfigured || !supabase) {
      try {
        const poll = mockDb.createPoll(question, options, organizerId)
        return { data: poll, error: null }
      } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Failed to create poll' }
      }
    }

    try {
      // Create poll
      const { data: pollData, error: pollErr } = await supabase
        .from('polls')
        .insert({
          question,
          is_live: true,
        })
        .select()
        .single()

      if (pollErr) return { data: null, error: pollErr.message }

      // Create options
      const optionsPayload = options.map((text) => ({
        poll_id: pollData.id,
        text,
      }))

      const { data: optData, error: optErr } = await supabase
        .from('poll_options')
        .insert(optionsPayload)
        .select()

      if (optErr) return { data: null, error: optErr.message }

      const formattedPoll: Poll = {
        id: pollData.id,
        question: pollData.question,
        options: (optData || []).map((o: any) => ({ id: o.id, text: o.text, votes: 0 })),
        isLive: pollData.is_live,
        totalVotes: 0,
        createdAt: new Date(pollData.created_at).toLocaleString(),
      }

      return { data: formattedPoll, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create poll' }
    }
  },

  /** Close a poll to archiving it */
  async closePoll(pollId: string): Promise<ApiResult<Poll>> {
    if (!isSupabaseConfigured || !supabase) {
      try {
        const poll = mockDb.closePoll(pollId)
        return { data: poll, error: null }
      } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Failed to close poll' }
      }
    }

    try {
      const { data, error } = await supabase
        .from('polls')
        .update({ is_live: false })
        .eq('id', pollId)
        .select()
        .single()

      if (error) return { data: null, error: error.message }
      
      return {
        data: {
          id: data.id,
          question: data.question,
          isLive: data.is_live,
          options: [],
          totalVotes: 0,
          createdAt: new Date(data.created_at).toLocaleString(),
        },
        error: null,
      }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to close poll' }
    }
  },
}
