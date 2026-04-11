/*
  # Create Email Subscribers Table

  ## Purpose
  Stores email addresses from users who sign up for the CargeWay newsletter on the coming soon page.

  ## New Tables
  - `email_subscribers`
    - `id` (uuid, primary key) - Unique identifier
    - `email` (text, unique, not null) - Subscriber email address
    - `subscribed_at` (timestamptz) - When the user subscribed
    - `source` (text) - Where the subscription came from (default: 'coming_soon')

  ## Security
  - RLS enabled on `email_subscribers` table
  - Public INSERT policy: anyone can subscribe (no auth required)
  - No SELECT policy for public: emails are private
*/

CREATE TABLE IF NOT EXISTS email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  source text DEFAULT 'coming_soon'
);

ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON email_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (email IS NOT NULL AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
