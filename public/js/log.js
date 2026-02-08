const renderWorkout = (workoutId, date, split, workout) => {
    const workoutSect = document.createElement('section');
    workoutSect.workoutId = workoutId;
    document.getElementById('prev-workouts-section').append(workoutSect); 

    const dateSplitDiv = document.createElement('div');
    workoutSect.append(dateSplitDiv);

    const dateSplitHeader = document.createElement('h2');
    dateSplitDiv.append(dateSplitHeader); 
    dateSplitHeader.textContent = `${date}: ${split}`; 

    const deleteButton = document.createElement('button'); 
    deleteButton.className = 'delete-workout-button';
    deleteButton.textContent = 'delete this workout'
    workoutSect.append(deleteButton); 

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
    const response = await fetch('/workouts/load-workouts', {
        method: "GET",
        credentials: 'include'
    }); 
    if (!response.ok) {
        throw new Error(`Response status ${response.status}`);
    } 

    const temp = await response.json(); 
    const result = temp.result;
    console.log(result);
    for (var i = 0; i < result.rowCount; ++i) {
        const curWorkout = result.rows[i];
        // first param for renderWorkout is blank because id system is not implemented
        renderWorkout(curWorkout.workout_id, curWorkout.date, curWorkout.split, curWorkout.workout); 
        console.log(`Displayed ${i} out of ${result.rowCount} rows`);
    }
}


const deleteWorkout = async (workoutId) => {
    const url = `/workouts/${workoutId}`;
    const response = await fetch(url, {
        method: 'DELETE',   
        credentials: 'include'
    }); 

    if (!response.ok) {
        throw new Error(`Response status ${response.status}`); 
    }
    return response;
}

const editWorkout = async (workoutId, patchData) => {
    const url = `/workouts/${workoutId}`;
    const response = await fetch(url, {
            method: 'PATCH',
            credentials: 'include',
            // body should contain updated data
            body: patchData
        });

    if (!response.ok) {
        throw new Error(`Response status ${response.status}`)
    }
}; 

document.getElementById('prev-workouts-section').addEventListener("click", async (e) => {
    if (e.target.className === 'delete-workout-button') {
        const workoutId = e.target.parentElement.workoutId; 
        const result = await deleteWorkout(workoutId); 
        // remove rendered workout section 
        e.target.parentElement.remove();
    } else if (e.target.className === 'edit-workout-button') {
        const workout_id = e.target.parentElement.workout_id; 
        const result = await editWorkout(workout_id); 
    }
});


document.addEventListener("DOMContentLoaded", (event) => {
    // todo: display "<h2> Welcome {req.session.userId} </h2>" + /public/index.html
    renderWorkouts(); 
});
