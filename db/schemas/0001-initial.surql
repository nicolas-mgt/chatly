-- User table (doubles as profile — field-level permissions protect sensitive data)
DEFINE TABLE IF NOT EXISTS user SCHEMAFULL
    PERMISSIONS
        FOR select WHERE $auth IS NOT NONE
        FOR update WHERE id = $auth
        FOR create, delete NONE;

DEFINE FIELD IF NOT EXISTS email      ON TABLE user TYPE string
    ASSERT string::is_email($value)
    PERMISSIONS
        FOR select WHERE id = $auth
        FOR update WHERE id = $auth;

DEFINE FIELD IF NOT EXISTS pass       ON TABLE user TYPE string
    PERMISSIONS FOR select NONE FOR update WHERE id = $auth;

DEFINE FIELD IF NOT EXISTS name       ON TABLE user TYPE string;
DEFINE FIELD IF NOT EXISTS avatar_url ON TABLE user TYPE option<string>;
DEFINE FIELD IF NOT EXISTS online     ON TABLE user TYPE bool DEFAULT false;
DEFINE FIELD IF NOT EXISTS created_at ON TABLE user TYPE datetime DEFAULT time::now() READONLY;

DEFINE INDEX IF NOT EXISTS idx_user_email ON TABLE user COLUMNS email UNIQUE;

-- Record-level access for signup and signin
DEFINE ACCESS IF NOT EXISTS account ON DATABASE TYPE RECORD
    SIGNUP (
        CREATE user SET
            email = string::lowercase($email),
            pass  = crypto::argon2::generate($pass),
            name  = $name,
            created_at = time::now()
    )
    SIGNIN (
        SELECT * FROM user
        WHERE email = string::lowercase($email)
          AND crypto::argon2::compare(pass, $pass)
    )
    DURATION FOR TOKEN 15m, FOR SESSION 12h;
