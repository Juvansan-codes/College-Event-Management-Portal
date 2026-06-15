-- Migration: 008_add_ticket_type_to_registrations.sql
-- Add ticket_type to registrations

ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS ticket_type TEXT DEFAULT 'General Admission';
