CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- schema v0 
CREATE TABLE IF NOT EXISTS users (
    user_id UUID DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL,
    PRIMARY KEY(user_id)
);

CREATE TABLE IF NOT EXISTS sessions

CREATE TABLE IF NOT EXISTS workouts (
    workout_id UUID DEFAULT gen_random_uuid(), 
	user_id UUID, 
	date DATE NOT NULL,
	split VARCHAR(25) NOT NULL,
	workout JSON NOT NULL,
    PRIMARY KEY(workout_id),
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
            REFERENCES users(user_id)
); 

CREATE INDEX index_user_id_date ON workouts(user_id, date); 
