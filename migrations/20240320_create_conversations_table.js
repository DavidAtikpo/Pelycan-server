const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function up() {
    try {
        // Supprimer l'ancienne table si elle existe
        await pool.query(`
            DROP TABLE IF EXISTS messages CASCADE;
            DROP TABLE IF EXISTS conversations CASCADE;
        `);

        // Créer la nouvelle table conversations
        await pool.query(`
            CREATE TABLE conversations (
                id SERIAL PRIMARY KEY,
                user1_id INTEGER NOT NULL REFERENCES users(id),
                user2_id INTEGER NOT NULL REFERENCES users(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id)
            );

            CREATE TABLE messages (
                id SERIAL PRIMARY KEY,
                conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                sender_id INTEGER NOT NULL REFERENCES users(id),
                receiver_id INTEGER NOT NULL REFERENCES users(id),
                content TEXT NOT NULL,
                read BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT valid_participants CHECK (
                    (sender_id = user1_id AND receiver_id = user2_id) OR
                    (sender_id = user2_id AND receiver_id = user1_id)
                )
            );

            -- Créer un index pour améliorer les performances
            CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
            CREATE INDEX idx_messages_sender_id ON messages(sender_id);
            CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
            CREATE INDEX idx_conversations_user1_id ON conversations(user1_id);
            CREATE INDEX idx_conversations_user2_id ON conversations(user2_id);

            -- Créer un trigger pour mettre à jour updated_at
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            CREATE TRIGGER update_conversations_updated_at
                BEFORE UPDATE ON conversations
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);

        console.log('Migration réussie : Tables conversations et messages créées');
    } catch (error) {
        console.error('Erreur lors de la migration:', error);
        throw error;
    }
}

async function down() {
    try {
        await pool.query(`
            DROP TABLE IF EXISTS messages CASCADE;
            DROP TABLE IF EXISTS conversations CASCADE;
            DROP FUNCTION IF EXISTS update_updated_at_column();
        `);
        console.log('Migration annulée : Tables conversations et messages supprimées');
    } catch (error) {
        console.error('Erreur lors de l\'annulation de la migration:', error);
        throw error;
    }
}

module.exports = {
    up,
    down
}; 