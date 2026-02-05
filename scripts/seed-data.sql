-- This script seeds sample data into the database
-- Run this after setting up the database schema

-- Note: In a real application, you would use the auth system to create users
-- This is just for demonstration purposes with sample data

-- Sample metrics for testing
INSERT INTO metrics (team_id, name, value, unit, category, timestamp) VALUES
  -- Performance metrics
  ('00000000-0000-0000-0000-000000000001', 'API Response Time', 145, 'ms', 'performance', now() - interval '30 days'),
  ('00000000-0000-0000-0000-000000000001', 'API Response Time', 138, 'ms', 'performance', now() - interval '25 days'),
  ('00000000-0000-0000-0000-000000000001', 'API Response Time', 142, 'ms', 'performance', now() - interval '20 days'),
  ('00000000-0000-0000-0000-000000000001', 'API Response Time', 135, 'ms', 'performance', now() - interval '15 days'),
  ('00000000-0000-0000-0000-000000000001', 'API Response Time', 130, 'ms', 'performance', now() - interval '10 days'),
  ('00000000-0000-0000-0000-000000000001', 'API Response Time', 125, 'ms', 'performance', now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000001', 'API Response Time', 120, 'ms', 'performance', now()),

  -- Revenue metrics
  ('00000000-0000-0000-0000-000000000001', 'Daily Revenue', 12500, 'USD', 'revenue', now() - interval '30 days'),
  ('00000000-0000-0000-0000-000000000001', 'Daily Revenue', 13200, 'USD', 'revenue', now() - interval '25 days'),
  ('00000000-0000-0000-0000-000000000001', 'Daily Revenue', 14100, 'USD', 'revenue', now() - interval '20 days'),
  ('00000000-0000-0000-0000-000000000001', 'Daily Revenue', 15400, 'USD', 'revenue', now() - interval '15 days'),
  ('00000000-0000-0000-0000-000000000001', 'Daily Revenue', 16800, 'USD', 'revenue', now() - interval '10 days'),
  ('00000000-0000-0000-0000-000000000001', 'Daily Revenue', 18200, 'USD', 'revenue', now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000001', 'Daily Revenue', 19500, 'USD', 'revenue', now()),

  -- Engagement metrics
  ('00000000-0000-0000-0000-000000000001', 'Active Users', 2450, 'count', 'engagement', now() - interval '30 days'),
  ('00000000-0000-0000-0000-000000000001', 'Active Users', 2680, 'count', 'engagement', now() - interval '25 days'),
  ('00000000-0000-0000-0000-000000000001', 'Active Users', 2920, 'count', 'engagement', now() - interval '20 days'),
  ('00000000-0000-0000-0000-000000000001', 'Active Users', 3150, 'count', 'engagement', now() - interval '15 days'),
  ('00000000-0000-0000-0000-000000000001', 'Active Users', 3420, 'count', 'engagement', now() - interval '10 days'),
  ('00000000-0000-0000-0000-000000000001', 'Active Users', 3680, 'count', 'engagement', now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000001', 'Active Users', 3950, 'count', 'engagement', now());

-- Sample alerts
INSERT INTO alerts (team_id, title, description, severity, is_read, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'High API Response Time', 'Response time exceeded 150ms threshold', 'warning', true, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000001', 'Revenue Target Met', 'Daily revenue exceeded $18,000 target', 'info', true, now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000001', 'Critical: System Down', 'Service unavailable for 5 minutes', 'critical', false, now() - interval '6 hours');
