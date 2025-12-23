-- Insert space events from spaceindustrydatabase.com
-- Owner: spacedaoist@gmail.com (ddb9fe22-0b00-4a70-9388-4a2959dc6c65)

-- January 2026 Events
INSERT INTO events (title, slug, description, owner_id, category_id, location_type, address, meeting_url, start_datetime, end_datetime, timezone, registration_instructions, status)
VALUES
(
  'Astrobee Free Flying Robotic ISAM Testbed: Opportunities to Accelerate V&V in Space',
  'astrobee-free-flying-robotic-isam-testbed-opportunities-to-accelerate-vv-in-space',
  'Technical webinar on Astrobee free flying robotic testing in space',
  'ddb9fe22-0b00-4a70-9388-4a2959dc6c65',
  2, -- Workshop
  'virtual',
  NULL,
  'zoom.us/webinar/register/WN_YPTqujUlQx-6q-ROo7eBbg',
  '2026-01-07 09:00:00+00',
  '2026-01-07 17:00:00+00',
  'UTC',
  'Register at: zoom.us/webinar/register/WN_YPTqujUlQx-6q-ROo7eBbg',
  'published'
),
(
  'PTC''26',
  'ptc26',
  'Conference running from January 18-21, 2026',
  'ddb9fe22-0b00-4a70-9388-4a2959dc6c65',
  1, -- Conference
  'physical',
  'Hilton Hawaiian Village Waikiki Beach Resort, Honolulu, Hawaii, USA',
  NULL,
  '2026-01-18 09:00:00+00',
  '2026-01-21 17:00:00+00',
  'UTC',
  NULL,
  'published'
),
(
  'Middle East Space Conference',
  'middle-east-space-conference',
  'Regional space conference for the Middle East, January 26-28, 2026',
  'ddb9fe22-0b00-4a70-9388-4a2959dc6c65',
  1, -- Conference
  'physical',
  'Oman Convention and Exhibition Centre, Muscat, Oman',
  NULL,
  '2026-01-26 09:00:00+00',
  '2026-01-28 17:00:00+00',
  'UTC',
  NULL,
  'published'
);
