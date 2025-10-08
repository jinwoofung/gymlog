document.getElementById("submit-workout-button").style.visibility = "hidden";

let exerciseCount = 0;

const request = window.indexedDB.open("workoutsdb");
let db;

request.onupgradeneeded = function(event) {
    db = request.result;
    const store = db.createObjectStore("workouts", { keyPath: "id", autoIncrement: true});
    const dateIndex = store.createIndex("byDate", "date");
};

request.onsuccess = function(event) {
    db = request.result;
};

request.onerror = function(event) {
    console.log("failed creating workoutsdb");
};

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

/*
function addWorkoutObjectToIndexedDB(workoutObject) {
    const tx = db.transaction("workouts", "readwrite");
    const store = tx.objectStore("workouts");

    const addRequest = store.add(workoutObject);
    addRequest.onsuccess = () => console.log("new workout added!");
    addRequest.onerror = () => console.log("Error: Failed to add workoutObject to IndexedDB");

    tx.onerror = e => console.log("transaction failed", e.target.error); 
    tx.oncomplete = () => console.log("transaction complete"); 
}
*/

/*
function makeWorkoutObject() {
    const workoutForm = document.getElementById("workout-form"); 
    let workoutObject = new Object();
    
    // store exercises in an array to later add it to exercise object
    workoutObject.date = document.getElementById("date").value;
    workoutObject.split = document.getElementById("split").value;

    let exercises = [];
        for (let i = 0; i < workoutForm.childElementCount; ++i) {
            if (workoutForm.children[i].className === 'exerciseSection') { // "exercise" section
                let exercise = new Object();
                exercise.name = workoutForm.children[i].querySelector("input").value;

                let sets = [];
                for (let j = 0; j < workoutForm.children[i].childElementCount; ++j) { 
                    if (workoutForm.children[i].children[j].className === 'setSection') { // "set" section
                        const currentSetSection = workoutForm.children[i].children[j];
                        let set = new Object();
                        set.weight = currentSetSection.children[0].children[0].value; 
                        set.reps = currentSetSection.children[1].children[0].value; 
                        sets.push(set);
                    }   
                }
                exercise.sets = sets;
                exercises.push(exercise); 
            }
        }
    workoutObject.exercises = exercises;
        
    return workoutObject;
}
*/ 

document.getElementById("submit-workout-button").addEventListener("click", function(e) {
    const workoutForm = document.getElementById("workout-form"); 
});

