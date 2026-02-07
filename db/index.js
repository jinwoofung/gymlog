import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
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

// users
export const addUser = async (username, password) => {
    const result = await query(`SELECT * FROM users WHERE username = $1`, [username]);

    /* 
    types of errors requiring handlers
    1. duplicate username 
    
    2. username uses characters that are not allowed (non-english language, special characters)
    3. username is too long (exceeds 255)

    but 2, 3 are handled by express-validator inside the route handler
    */

    if (result.rowCount != 0) { 
        // handled by signup post route handler
        const err = new Error(`Username: ${username} is already in use.`);
        err.name = "ExistingUserError"; // allows specific (custom) error recognition by caller 
        throw err; 
    } else {
        // assume password secure-ness to be verified
        const newUser = await query('INSERT INTO users(username, password) VALUES($1, $2) RETURNING *', [username, password]);
    }
}

export const verifyUser = async (username, password) => {
    const result = await query(`SELECT * FROM users WHERE username = $1`, [username]);
    // user_id is assumed to be unique 
    if (result.rowCount == 0){ // edge case: when no such username exists
        return false;
    }
    else if (result.rows[0].password == password) {
        return true;
        // server should provide a sessionId to the validated user
    } 
    return false;
}

// sessions
export const getUserId = (username, password) => {
    return query(`SELECT user_id FROM users WHERE username = $1`, [username]);
}

// workouts
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

export const addWorkout = async (userId, date, split, exercises) => {
    try {
        const result = await query('INSERT INTO workouts(user_id, date, split, workout) VALUES($1, $2, $3, $4) RETURNING *',
        [userId, date, split, exercises]); 

        console.log(`row added:\n ${result.rows[0]}`);
        return result.rows[0];
    } catch (e) {
        console.log(e); 
    }
}

export const deleteWorkout = async (workout_id) => {
    console.log('Entered db.deleteWorkout');
    const result = await query('DELETE FROM workouts WHERE workout_id = $1', [workout_id]);
    console.log('Completed query inside db.deleteWorkout');
    return result;
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
export const getPrevWorkouts = async (userId, quantity) => {
    try {
        // return every workout entry in the db
        if (quantity === -1) {
            const result = await query('SELECT * FROM workouts WHERE user_id = $1 ORDER BY date DESC', [userId]);         
            return result; 
        // debugging option
        } else if (quantity === -2) { 
            const result = await query('SELECT * FROM workouts ORDER BY date DESC');
            return result;
        } else {
            // param 'quantity' determines how many workout entries are returned
            const result = await query('SELECT * FROM workouts WHERE user_id = $1 ORDER BY date LIMIT $2 DESC', [userId, quantity]);
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

