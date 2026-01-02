import { Pool } from 'pg';
import fs from 'fs';

const INIT_DB_PATH = './init.sql'; 

// db initialization
const pool = new Pool({
    user: 'gymlog_admin',
    password: 'gymlog_admin',
    host: 'localhost',
    port: 5432,
    database: 'gymlog',
});

export const query = (text, params) => {
    return pool.query(text, params)
}

export const initDb = async () => {
    const initString = fs.readFileSync(INIT_DB_PATH); 
    try {
        const result = await query(initString); 
    } catch (e) {
        console.log(e);
    } 
}

export const addWorkout = async (user_id, date, split, exercises) => {
    try {
        const result = await query('INSERT INTO workouts(date, split, workout) VALUES($1, $2, $3) RETURNING *',
        [date, split, exercises]); 

        console.log(`row added:\n ${result.rows[0]}`);
        return result.rows[0];
    } catch (e) {
        console.log(e); 
    }
}

export const deleteWorkout = async (workout_id) => {
    try {
        const result = await query('DELETE FROM workouts(workout_id, date, split, workout) WHERE workout_id = $1', workout_id);
        console.log(result.rows[0]);
    } catch (e) {
        console.log(e);
    }
}

export const editWorkout = async (workout_id, date, split, exercises) => {
    try {
        const result = await query('UPDATE workouts(workout_id, user_id, date, split, workout) SET date = $1, split = $2, exercises = $3 WHERE workout_id = $4',
                    [date, split, exercises, workout_id]);
        console.log(result.rows[0]);
    } catch (e) {
        console.log(e); 
    }
}

// Returns a result object as described by the 'pg' module. 
// !! param 'user_id' is obsolete as the user feature is not implemented.
export const getPrevWorkouts = async (user_id, quantity) => {
    try {
        // return every workout entry in the db
        if (quantity === -1) {
            const result = await query('SELECT * FROM workouts WHERE user_id = $1 ORDER BY date DESC', [user_id]);         
            return result; 
        // debugging option
        } else if (quantity === -2) { 
            const result = await query('SELECT * FROM workouts ORDER BY date DESC');
            return result;
        } else {
            // param 'quantity' determines how many workout entries are returned
            const result = await query('SELECT * FROM workouts WHERE user_id = $1 ORDER BY date LIMIT $2 DESC', [user_id, quantity]);
            return result;
        }
    } catch (e) {
        console.log(e); 
    }
}

// caller must release the Client
export const getClient = () => {
    return pool.connect();
}

