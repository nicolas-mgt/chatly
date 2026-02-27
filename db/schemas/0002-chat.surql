-- =============================================
-- Conversation table
-- =============================================
DEFINE TABLE IF NOT EXISTS conversation SCHEMAFULL
    PERMISSIONS
        FOR select WHERE $auth IN participants
        FOR create WHERE $auth IN participants
        FOR update WHERE $auth IN participants
        FOR delete NONE;

DEFINE FIELD IF NOT EXISTS participants  ON TABLE conversation TYPE array<record<user>>
    ASSERT array::len($value) = 2;
DEFINE FIELD IF NOT EXISTS last_message  ON TABLE conversation TYPE option<object> FLEXIBLE;
DEFINE FIELD IF NOT EXISTS created_at    ON TABLE conversation TYPE datetime DEFAULT time::now() READONLY;
DEFINE FIELD IF NOT EXISTS updated_at    ON TABLE conversation TYPE datetime DEFAULT time::now();

DEFINE INDEX IF NOT EXISTS idx_conversation_participants
    ON TABLE conversation COLUMNS participants;

-- =============================================
-- Message table
-- =============================================
DEFINE TABLE IF NOT EXISTS message SCHEMAFULL
    PERMISSIONS
        FOR select WHERE conversation_id.participants CONTAINS $auth
        FOR create WHERE sender_id = $auth
            AND conversation_id.participants CONTAINS $auth
        FOR update WHERE conversation_id.participants CONTAINS $auth
        FOR delete NONE;

DEFINE FIELD IF NOT EXISTS conversation_id ON TABLE message TYPE record<conversation>;
DEFINE FIELD IF NOT EXISTS sender_id       ON TABLE message TYPE record<user>;
DEFINE FIELD IF NOT EXISTS text            ON TABLE message TYPE option<string>;
DEFINE FIELD IF NOT EXISTS image_url       ON TABLE message TYPE option<string>;
DEFINE FIELD IF NOT EXISTS reactions          ON TABLE message TYPE array<object> FLEXIBLE DEFAULT [];
DEFINE FIELD IF NOT EXISTS reactions[*].emoji    ON TABLE message TYPE string;
DEFINE FIELD IF NOT EXISTS reactions[*].user_ids ON TABLE message TYPE array<record<user>>;
DEFINE FIELD IF NOT EXISTS seen_by         ON TABLE message TYPE array<record<user>> DEFAULT [];
DEFINE FIELD IF NOT EXISTS created_at      ON TABLE message TYPE datetime DEFAULT time::now() READONLY;

DEFINE INDEX IF NOT EXISTS idx_message_conversation
    ON TABLE message COLUMNS conversation_id;
DEFINE INDEX IF NOT EXISTS idx_message_conv_created
    ON TABLE message COLUMNS conversation_id, created_at;

-- =============================================
-- Event: auto-update conversation.last_message
-- =============================================
DEFINE EVENT IF NOT EXISTS update_last_message ON TABLE message
    WHEN $event = "CREATE"
    THEN {
        UPDATE $after.conversation_id SET
            last_message = {
                text: $after.text ?? 'Sent an image',
                sender_id: $after.sender_id,
                created_at: $after.created_at
            },
            updated_at = time::now();
    };
