const renderWorkout = (date, split, workout) => {
    const workoutSect = document.createElement('section').appendChild('.prev-workouts-section');

    const dateSplitDiv = document.createElement('div').appendChild(workoutSect);  
    const dateSplitHeader = document.createElement('h2').appendChild(dateSplitDiv);
    dateSplitHeader.textContent = `${date}: ${split}`; 

    const workoutDiv = document.createElement('div').appendChild(workoutSect); 
    for (var i = 0; i < workout.exercises.length; ++i) {
        const exerciseDiv = document.createElement('div'); 
        document.createElement('h3').appendChild(exerciseDiv).textContent = `${workout.exercises[i].name}`;
        for (var j = 0; i < workout.exercises[i].sets.length; ++j) {
            const setObj = workout.exercises[i].sets[j]; 
            const setDiv = document.createElement('div').appendChild(exerciseDiv);
            const setP = document.createElement('p').appendChild(setDiv); 
            setP.textContent = `Set ${j}: ${setObj.weight}lbs for ${setObj.reps} repetitions`;
        }
    }
    console.log("SUCCESS: loaded a stored workout")
}

// Must be given results.rowCount and results.rows
// Parses rows returned by calling result.rows on the workout db. 
const renderWorkouts = async (len, workoutRows) => {
    // GET request to fetch previous workout
    const url = '/api/workouts'; 
    try {
        const response = await fetch(url); 
        if (!response.ok) {
            throw new Error(`Response status ${response.status}`);
        } 
        const result = await response.json();
        console.log(result); 
    } catch (e) {
        console.error(e.message); 
    }

    for (i = 0; i < len; ++i) {
        const curWorkoutObj = workoutRows[i];
        renderWorkout(curWorkoutObj.date, curWorkoutObj.split, curWorkoutObj.workout); 
    }
    console.log(`SUCCESS: loaded ${len} stored workouts`)
}

const result = getPrevWorkouts(null, -1);
console.log(`${result.rowCount}`); 

// load previous workouts
renderWorkouts(result.rowCount, result.rows); 