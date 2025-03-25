-- Créer la table emergency_logs si elle n'existe pas
CREATE TABLE IF NOT EXISTS emergency_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emergency_id UUID NOT NULL REFERENCES emergency_requests(id),
    action VARCHAR(50) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    performed_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_emergency_logs_emergency_id ON emergency_logs(emergency_id);
CREATE INDEX IF NOT EXISTS idx_emergency_logs_performed_by ON emergency_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_emergency_logs_created_at ON emergency_logs(created_at);

-- Ajouter le trigger pour updated_at
CREATE TRIGGER update_emergency_logs_updated_at
    BEFORE UPDATE ON emergency_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 