const renderWorkout = (workout_id, date, split, workout) => {
    const workoutSect = document.createElement('section');
    // workoutSect.workout_id = workout_id;
    document.getElementById('prev-workouts-section').append(workoutSect); 
    

    /* 
    const deleteButton = document.createElement('button'); 
    deleteButton.className = 'delete-workout-button';
    workoutSect.append(deleteButton); 
    */ 

    const dateSplitDiv = document.createElement('div');
    workoutSect.append(dateSplitDiv);

    const dateSplitHeader = document.createElement('h2');
    dateSplitDiv.append(dateSplitHeader); 
    dateSplitHeader.textContent = `${date}: ${split}`; 

    const workoutDiv = document.createElement('div')
    workoutSect.append(workoutDiv); 

    for (var i = 0; i < workout.exercises.length; ++i) {
        const exerciseDiv = document.createElement('div'); 
        workoutDiv.append(exerciseDiv);
        const h3 = document.createElement('h3');
        h3.textContent = `${workout.exercises[i].name}`;
        exerciseDiv.append(h3);

        for (var j = 0; j < workout.exercises[i].sets.length; ++j) {
            const setObj = workout.exercises[i].sets[j]; 
            const setDiv = document.createElement('div');
            exerciseDiv.append(setDiv);

            const p = document.createElement('p');
            p.textContent = `Set ${j}: ${setObj.weight}lbs for ${setObj.reps} repetitions`;
            setDiv.append(p);
        }
    }
}

// renderWorkouts() parses and displays pre-existing workout data from the workout db. 
// Must be given results.rowCount and results.rows
const renderWorkouts = async () => {
    // GET request to fetch previous workout
    try {
        const response = await fetch('/api/load-workouts'); 
        if (!response.ok) {
            throw new Error(`Response status ${response.status}`);
        } 
        const temp = await response.json(); 
        const result = temp.result;
        for (var i = 0; i < result.rowCount; ++i) {
            const curWorkout = result.rows[i];
            // first param for renderWorkout is blank because id system is not implemented
            renderWorkout('', curWorkout.date, curWorkout.split, curWorkout.workout); 
            console.log(`Displayed ${i} out of ${result.rowCount} rows`);
        }
    } catch (e) {
        console.error(e.message); 
    }
}

const deleteWorkout = async (workout_id) => {
    const url = '/api/delete-workout?';
    const params = new URLSearchParams(url.search);
    params.append("workout_id", workout_id);

    try {
        const response = await fetch(url, {
            method: 'DELETE', 
        });
    } catch (e) {
        console.log(e); 
    }
}

const editWorkout = async (workout_id) => {
    const url = 'api/edit-workout?';
    const params = new URLSearchParams(url.search);
    params.append("workout_id", workout_id); 

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            // body should contain updated data
        });
    } catch (e) {
        console.log(e); 
    }
}; 
/*
document.getElementById('prev-workouts-section').addEventListener("click", (e) => {
    if (e.target.className === 'delete-workout-button') {
        const workout_id = e.target.parentElement.workout_id; 
        const result = deleteWorkout(workout_id); 
    } else if (e.target.className === 'edit-workout-button') {
        const workout_id = e.target.parentElement.workout_id; 
        const result = editWorkout(workout_id); 
    }
});
*/

document.addEventListener("DOMContentLoaded", (event) => {
    renderWorkouts(); 
});
