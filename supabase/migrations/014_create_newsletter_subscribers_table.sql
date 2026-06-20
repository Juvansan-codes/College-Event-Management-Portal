CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (subscribe)
CREATE POLICY "Allow public inserts" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);

-- Only authenticated users can view subscribers
CREATE POLICY "Allow authenticated selects" ON public.newsletter_subscribers
    FOR SELECT USING (auth.role() = 'authenticated');
