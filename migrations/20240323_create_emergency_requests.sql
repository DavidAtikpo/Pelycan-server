-- Créer la table emergency_requests si elle n'existe pas
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

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_emergency_requests_user_id ON emergency_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_professional_id ON emergency_requests(professional_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_created_at ON emergency_requests(created_at);

-- Ajouter le trigger pour updated_at
CREATE TRIGGER update_emergency_requests_updated_at
    BEFORE UPDATE ON emergency_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 