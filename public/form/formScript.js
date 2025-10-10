document.getElementById("submit-workout-button").style.visibility = "hidden";

let exerciseCount = 0;

function createButton(textContent, className) {
    let button = document.createElement('button'); 
    button.type = 'button'; 
    button.textContent = textContent;
    button.className = className;

    return button;
}

function validateForm() {
    const form = document.getElementById("workout-form");
    if (form.date.value === '') {
        alert("Please enter a date.");
        return false;
    }

    const exerciseSections = form.querySelectorAll('.exerciseSection');
    if (exerciseSections.length === 0) {
        alert("Add exercises to submit the workout.");
        return false;
    }

    for (const exerciseSection of exerciseSections) {
        const setSections = exerciseSection.querySelectorAll('.setSection');
        
        if (exerciseSection.querySelector('input').value === '') return false; 
        if (setSections.length === 0) {
            alert("Add at least one set per exercise.");
            return false;
        }

        for (const setSection of setSections) {
            if (setSection.children[0].children[0].value === '') return false;
            if (setSection.children[1].children[0].value === '') return false;
        }
    }
    return true;
}

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
        createNestedLabelInput(`exercises[${exerciseNumber}][name]`, "Exercise: ", true),
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
        createNestedLabelInput(`exercises[${exerciseNumber}][sets][${exerciseSect.setCount}][weight]`, "Weight: ", true),
        createNestedLabelInput(`exercises[${exerciseNumber}][sets][${exerciseSect.setCount}][reps]`, "Reps: ", true),
        createButton("remove this set", "set-remove-button")
    );

    exerciseSect.setCount = exerciseSect.setCount + 1;
    exerciseSect.appendChild(setSect);
}

document.getElementById("workout-form").addEventListener("click", function(e) {
    const workoutForm = document.getElementById("workout-form");
    if (e.target.id === "confirm-date-split-button") {
        let addExerciseBtn = document.createElement("button");
        addExerciseBtn.id = "add-exercise-button";
        addExerciseBtn.type = "button";
        addExerciseBtn.innerText = "Add exercise";
        workoutForm.appendChild(addExerciseBtn);
        document.getElementById("confirm-date-split-button").hidden = true;
    } else if (e.target.id === "add-exercise-button") {
        createExerciseSection(exerciseCount);
        ++exerciseCount;
    } else if (e.target.className === "exercise-remove-button") {
        e.target.parentNode.remove();
    }
});

document.getElementById("submit-workout-button").addEventListener("click", function(e) {
    const workoutForm = document.getElementById("workout-form"); 
});

