-- Créer le type enum si nécessaire
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'emergency_status_enum') THEN
        CREATE TYPE emergency_status_enum AS ENUM ('pending', 'assigned', 'in_progress', 'completed');
    END IF;
END $$;

-- Créer la table emergency_requests
CREATE TABLE IF NOT EXISTS emergency_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    professional_id UUID REFERENCES users(id),
    request_type VARCHAR(50) NOT NULL,
    status emergency_status_enum DEFAULT 'pending'::emergency_status_enum,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    assignment_note TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Créer les index pour emergency_requests
CREATE INDEX IF NOT EXISTS idx_emergency_requests_user_id ON emergency_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_professional_id ON emergency_requests(professional_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_created_at ON emergency_requests(created_at);

-- Créer la table emergency_logs
CREATE TABLE IF NOT EXISTS emergency_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emergency_id UUID NOT NULL REFERENCES emergency_requests(id),
    action VARCHAR(50) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    performed_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Créer les index pour emergency_logs
CREATE INDEX IF NOT EXISTS idx_emergency_logs_emergency_id ON emergency_logs(emergency_id);
CREATE INDEX IF NOT EXISTS idx_emergency_logs_performed_by ON emergency_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_emergency_logs_created_at ON emergency_logs(created_at);

-- Créer les triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_emergency_requests_updated_at
    BEFORE UPDATE ON emergency_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_logs_updated_at
    BEFORE UPDATE ON emergency_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 