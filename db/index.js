import { Pool } from 'pg';

// db initialization
const pool = new Pool();

const initDb = fs.readFileSync('init_db.sql'); 
const client = await pool.connect(); 
console.log("connected to db");
const res = client.query(initDb); 
console.log("db init complete"); 

// db operation functions
function insertWorkout(user_id, date, split, workout_detail) {
    pool.query('INSERT INTO workouts (user_id, date, split, workout_details) VALUES ($1, $2, $3, $4)', 
        [user_id, date, split, workout_detail]); 
}

function editWorkout(workout_id, date, split, workout_detail) {}

function deleteWorkout(workout_id) {}
