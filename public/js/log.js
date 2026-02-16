const renderWorkout = (workoutId, date, split, workout) => {
    const workoutSect = document.createElement('section');
    workoutSect.dataset.workoutId = workoutId; // HTMLDataset: Exists in attributes as data-workoutId 
    document.getElementById('prev-workouts-section').append(workoutSect); 

    const dateSplitDiv = document.createElement('div');
    workoutSect.append(dateSplitDiv);

    const dateSplitHeader = document.createElement('h2');
    dateSplitDiv.append(dateSplitHeader); 
    dateSplitHeader.textContent = `${date} ${split}`; 

    // Redirects to a form that changes selected workout data upon submission
    const editAnchor = document.createElement('a');
    editAnchor.href = '/workouts/edit/' + workoutId;
    workoutSect.append(editAnchor);

    const editButton = document.createElement('button'); 
    editButton.className = 'edit-workout-button';
    editButton.textContent = 'edit this workout'
    editAnchor.append(editButton); 

    // Deletes a workout
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
const renderWorkouts = async () => {
    // GET request to fetch previous workout
    const response = await fetch('/workouts/load-workouts', {
        method: "GET",
        credentials: 'include' // Required for session data to be passed to route handler
    }); 

    const temp = await response.json(); 
    const result = temp.result;
    
    for (var i = 0; i < result.rowCount; ++i) {
        const curWorkout = result.rows[i];
        var date = new Date(curWorkout.date); // Formats date to 'yyyy-MM-dd'
        date = date.toISOString().split("T")[0]; // Splits 2007-03-01T13:00:00Z into an array containing [2007-03-01][13:00:00Z]

        renderWorkout(curWorkout.workout_id, date, curWorkout.split, curWorkout.workout); 
    }
}

const deleteWorkout = async (workoutId) => {
    const url = `/workouts/${workoutId}`;
    const response = await fetch(url, {
        method: 'DELETE',   
        credentials: 'include'
    }); 

    return response;
}

document.getElementById('prev-workouts-section').addEventListener("click", async (e) => {
    if (e.target.className === 'delete-workout-button') {
        const workoutId = e.target.parentElement.dataset.workoutId; 
        const result = await deleteWorkout(workoutId); 
        e.target.parentElement.remove();
    } 
});

document.addEventListener("DOMContentLoaded", (event) => {
    renderWorkouts(); 
});
