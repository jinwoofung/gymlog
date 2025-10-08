import { Pool } from 'pg';
import fs from 'fs';

const INIT_DB_PATH = 'init.sql'; 

// db initialization
const pool = new Pool();

export const query = (text, params) => {
    return pool.query(text, params)
}

export const initDb = async () => {
    const initString = fs.readFileSync(INIT_DB_PATH); 
    try {
        const result = await query(initString); 
    } catch (error) {
        console.log(error);
    } 
}

export const addWorkout = async (date, split, exercises) => {
    try {
        const result = await query('INSERT INTO gymlog(date, split, exercises) VALUES($1, $2, $3) RETURNING *',
        [date, split, exercises]); 
        console.log(result.rows[0]);
    } catch (error) {
        console.log(error); 
    }
}

export const deleteWorkout = async (workout_id) => {
    try {
        const result = await query('DELETE FROM gymlog(workout_id, date, split, exercises) WHERE workout_id = $1', workout_id);
        console.log(result.rows[0]);
    } catch (error) {
        console.log(error);
    }
}

export const editWorkout = async (workout_id, date, split, exercises) => {
    try {
        const result = await query('UPDATE gymlog(workout_id, user_id, date, split, exercises) SET date = $1, split = $2, exercises = $3 WHERE workout_id = $4',
                    [date, split, exercises, workout_id]);
        console.log(result.rows[0]);
    } catch (error) {
        console.log(error); 
    }
}

export const getPrevWorkouts = async (user_id, quantity) => {}

// caller must release the Client
export const getClient = () => {
    return pool.connect();
}

