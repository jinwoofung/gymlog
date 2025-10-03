function createNestedLabelInput(name, textContent, isRequired) {
    let label = document.createElement('label');
    label.textContent = textContent;

    let input = document.createElement('input');
    input.name = name;
    input.required = isRequired;
    label.appendChild(input); 
    return label;
}

function createExerciseSection(exerciseNumber) {
    const workoutForm = document.getElementById("workout-form");
    const exerciseSection = document.createElement("section");

    exerciseSection.id = "exercise-section-" + exerciseNumber;
    exerciseSection.exerciseNumber = exerciseNumber;
    exerciseSection.className = "exerciseSection";
    exerciseSection.setCount = 0;

    exerciseSection.append(
        createNestedLabelInput(`exercise[${exerciseNumber}]`, "Exercise: ", true),
        createButton("confirm exercise", "exercise-confirm-button"),
        createButton("remove this exercise", "exercise-remove-button"),
        createButton("add a set", "set-create-button")
    );

    workoutForm.appendChild(exerciseSection);

    document.getElementById(exerciseSection.id).addEventListener("click", function(e) {
        if (e.target.className === "set-create-button") {
            const currentExerciseNumber = e.target.parentNode.exerciseNumber;
            createSetSection(currentExerciseNumber);
        } else if (e.target.className === "set-remove-button") {
            let curExerciseObj = e.target.parentNode.parentNode;
            if (curExerciseObj.querySelectorAll('section').length === 1) {
                curExerciseObj.remove();
            } else {
                e.target.parentNode.remove();
            }
        } else if (e.target.className === "exercise-confirm-button") {
            const currentExerciseNumber = e.target.parentNode.exerciseNumber
            createSetSection(currentExerciseNumber); // decouple
            e.target.hidden = true;
            document.getElementById("submit-workout-button").style.visibility = "visible";
        } 
    })
}

function createSetSection(exerciseNumber) {
    const exerciseSect = document.getElementById(`exercise-section-${exerciseNumber}`);
        
    const setSect = document.createElement("section");
    setSect.className = 'setSection';

    setSect.append(
        createNestedLabelInput(`exercise[${exerciseNumber}]set[${exerciseSect.setCount}][weight]`, "Weight: ", true),
        createNestedLabelInput(`exercise[${exerciseNumber}]set[${exerciseSect.setCount}][reps]`, "Reps: ", true),
        createButton("remove this set", "set-remove-button")
    );

    exerciseSect.setCount = exerciseSect.setCount + 1;
    exerciseSect.appendChild(setSect);
}