function renderSets(exerciseSection, setArray) {
    for (let j = 0; j < setArray.length; ++j) {
        let set = document.createElement("p");
        set.textContent = `Set ${j+1}: ${setArray[j].weight} for ${setArray[j].reps} reps`;
        exerciseSection.appendChild(set);
    }
}

function renderDateAndSplit(workoutSection, date, split) {
    let workoutHeader = document.createElement("h2");
    workoutHeader.textContent = date + ": " + split;
    workoutSection.appendChild(workoutHeader);
}

function renderExercises(workoutSection, exerciseArray) {
    for (let i = 0; i < exerciseArray.length; ++i) {
        let exerciseSection = document.createElement("section");
        workoutSection.appendChild(exerciseSection);

        const exerciseObject = exerciseArray[i];
        const setArray = exerciseObject.sets;

        let exerciseHeader = document.createElement("h3");
        exerciseHeader.textContent = exerciseObject.name;
        exerciseSection.appendChild(exerciseHeader);
        
        renderSets(exerciseSection, setArray);
    }
}

export function renderWorkout(workoutObject) {
    let workoutsSection = document.getElementById("prev-workouts-section");
    let workoutSection = document.createElement("section");
    workoutsSection.appendChild(workoutSection);

    renderDateAndSplit(workoutSection, workoutObject.date, workoutObject.split);
    renderExercises(workoutSection, workoutObject.exercises); 
}