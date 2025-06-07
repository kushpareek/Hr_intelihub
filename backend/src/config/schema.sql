-- backend/src/config/schema.sql

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'Trial', -- Basic, Pro, Enterprise, Trial
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    platform VARCHAR(100), -- e.g., "LinkedIn", "Internal Referral"
    role VARCHAR(255),
    status VARCHAR(50) NOT NULL, -- Sourced, Screening, Interviewing, Offered, Hired, Rejected
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Link to the user who sourced/owns this candidate
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    description TEXT,
    status VARCHAR(50) NOT NULL, -- Draft, Open, Closed
    posted_at TIMESTAMPTZ,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- User who created it, SET NULL if user deleted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    content_snippet TEXT,
    full_content TEXT, -- Store full policy content here
    -- user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Optional: if policies are tied to a user/creator
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(100), -- e.g., "Email Automation Bot"
    status VARCHAR(50) NOT NULL, -- Pending, In Progress, Completed, Failed
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Task belongs to a user
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS onboarding_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- Pending, In Progress, Completed, Requires Attention
    assignee VARCHAR(255), -- e.g. New Hire, HR Manager
    due_date DATE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Onboarding process initiated by this user
    related_candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL, -- Optional: link to the hired candidate
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offboarding_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(100), -- Can be company's internal ID
    type VARCHAR(50) NOT NULL, -- Resignation, Termination, PIP
    status VARCHAR(50) NOT NULL, -- Initiated, Pending Exit Interview, etc.
    initiated_date DATE NOT NULL,
    last_working_day DATE,
    pip_review_date DATE,
    reason TEXT,
    manager VARCHAR(255),
    next_step TEXT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Case managed by this user
    related_candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL, -- Optional: if employee was a candidate
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- For Admin Dashboard
CREATE TABLE IF NOT EXISTS client_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL, -- Basic, Pro, Enterprise, Trial
    status VARCHAR(50) NOT NULL, -- Active, Trialing, Past Due, Canceled
    joined_date DATE NOT NULL,
    renewal_date DATE,
    -- This could link to a user ID if clients are also users in the system
    -- user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES client_subscriptions(id) ON DELETE SET NULL, -- Link to a client subscription
    -- Or if queries can come from non-subscribed users, client_id might not be strictly enforced or could be text
    client_name VARCHAR(255), -- Denormalized for easy display if client_id is not set/used
    client_email VARCHAR(255), -- Email of the person who submitted the query
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    submitted_date TIMESTAMPTZ DEFAULT NOW(),
    last_updated_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) NOT NULL, -- Open, In Progress, Resolved, Closed
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin user handling the query
    priority VARCHAR(50) DEFAULT 'Medium', -- Low, Medium, High
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add a trigger function to update 'updated_at' columns
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables that have an 'updated_at' column
DO $$
DECLARE
  t_name TEXT;
BEGIN
  FOR t_name IN
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name = 'updated_at' AND table_schema = 'public' -- or your specific schema
  LOOP
    EXECUTE format('CREATE TRIGGER set_timestamp
                    BEFORE UPDATE ON %I
                    FOR EACH ROW
                    EXECUTE PROCEDURE trigger_set_timestamp();', t_name);
  END LOOP;
END $$;

-- Enable gen_random_uuid() if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
