import { Pool } from 'pg';
import fs from 'fs';

// db initialization
const pool = new Pool();

export const query = (text, params) => {
    return pool.query(text, params)
}

export const initDb = async () => {
    const initString = fs.readFileSync('init_db.sql'); 
    try {
        await query(initString); 
    } catch (error) {
        console.log(error);
    } 
}

export const addWorkout = async (date, split, exercises) => {
    try {
        await query('INSERT INTO gymlog(workout_id, user_id, date, split, exercises) VALUES($1, $2, $3) RETURNING *',
        [date, split, exercises]); 
    } catch (error) {
        console.log(error); 
    }
}

export const deleteWorkout = async (workout_id) => {
    try {
        await query('DELETE FROM gymlog(workout_id, user_id, date, split, exercises) WHERE workout_id = $1', workout_id);
    } catch (error) {
        console.log(error);
    }
}

export const editWorkout = async (workout_id, date, split, exercises) => {
    try {
        await query('UPDATE gymlog(workout_id, user_id, date, split, exercises) SET date = $1, split = $2, exercises = $3 WHERE workout_id = $4',
                    [date, split, exercises, workout_id]);
    } catch (error) {
        
    }
}

// caller must release the Client
export const getClient = () => {
    return pool.connect();
}

