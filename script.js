document.getElementById("submit-workout-button").style.visibility = "hidden";

let exerciseCount = 0;
let setCount = 0;

const request = window.indexedDB.open("workoutsdb");
let db;

request.onupgradeneeded = function(event) {
    db = request.result;
    const store = db.createObjectStore("workouts", { keyPath: "id", autoIncrement: true});
    const dateIndex = store.createIndex("byDate", "date");
};

function renderSets(exerciseSection, setArray) {
    for (let j = 0; j < setArray.length; ++j) {
        let set = document.createElement("p");
        set.textContent = `Set ${j+1}: ${setArray[j].weight} for ${setArray[j].reps} reps`;
        exerciseSection.appendChild(set);
    }
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

function renderDateAndSplit(workoutSection, date, split) {
    let workoutHeader = document.createElement("h2");
    workoutHeader.textContent = date + ": " + split;
    workoutSection.appendChild(workoutHeader);
}

function renderWorkout(workoutObject) {
    let workoutsSection = document.getElementById("prev-workouts-section");
    let workoutSection = document.createElement("section");
    workoutsSection.appendChild(workoutSection);

    renderDateAndSplit(workoutSection, workoutObject.date, workoutObject.split);
    renderExercises(workoutSection, workoutObject.exercises); 
}

request.onsuccess = function(event) {
    db = request.result;

    let tx = db.transaction("workouts", "readonly"); 
    let store = tx.objectStore("workouts");
    let cursorRequest = store.index("byDate").openCursor(null, "prev");

    cursorRequest.onsuccess = function(event) {
        let cursor = event.target.result;

        if (cursor) {
        renderWorkout(cursor.value);
        cursor.continue();
        } 
    };

    cursorRequest.onerror = function(event) {
        console.log("Error: ", event.target.error);
    };

    tx.onerror = e => console.log("transaction failed", e.target.error); 
    tx.oncomplete = () => console.log("transaction complete"); 
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

function createNestedLabelInput(id, textContent, required) {
    let label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = textContent;

    let input = document.createElement('input');
    input.id = id;
    input.required = required;

    label.appendChild(input); 
    return label;
}

function validateForm() {
    const workoutForm = document.getElementById("workout-form");
    if (workoutForm.date.value === '') return false;

    const exerciseSections = document.querySelectorAll('.exerciseSection');
    if (exerciseSections.length === 0) return false;

    for (const exerciseSection of exerciseSections) {
        if (exerciseSection.querySelector('input').value === '') return false; 
        
        const setSections = document.querySelectorAll('.setSection');
        for (const setSection of setSections) {
            if (setSection.children[0].children[0].value === '') return false;
            if (setSection.children[1].children[0].value === '') return false;
        }
    }
    return true;
}

function createExerciseSection(exerciseNumber) {
    const workoutForm = document.getElementById("workout-form");
    const exerciseSection = document.createElement("section");
    
    exerciseSection.id = "exercise-section-" + exerciseNumber;
    exerciseSection.count = exerciseNumber;
    exerciseSection.className = "exerciseSection";

    exerciseSection.append(
        createNestedLabelInput(`exercise-${exerciseNumber}`, "Exercise: ", true),
        createButton("confirm exercise", "exercise-confirm-button"),
        createButton("remove this exercise", "exercise-remove-button"),
        createButton("add a set", "set-create-button")
    );
    workoutForm.appendChild(exerciseSection);
}

function createSetSection(exerciseNumber) {
    const exerciseSect = document.getElementById(`exercise-section-${exerciseNumber}`);
        
    const setSect = document.createElement("section");
    setSect.className = 'setSection';

    setSect.append(
        createNestedLabelInput('', "Weight: ", true),
        createNestedLabelInput('', "Reps: ", true),
        createButton("remove this set", "set-remove-button")
    );
    exerciseSect.appendChild(setSect);
}

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

function addWorkoutObjectToIndexedDB(workoutObject) {
    const tx = db.transaction("workouts", "readwrite");
    const store = tx.objectStore("workouts");

    const addRequest = store.add(workoutObject);
    addRequest.onsuccess = () => console.log("new workout added!");
    addRequest.onerror = () => console.log("Error: Failed to add workoutObject to IndexedDB");

    tx.onerror = e => console.log("transaction failed", e.target.error); 
    tx.oncomplete = () => console.log("transaction complete"); 
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
    } else if (e.target.className === "exercise-confirm-button") {
        const currentExerciseNumber = e.target.parentNode.count
        createSetSection(currentExerciseNumber);
        e.target.hidden = true;
        document.getElementById("submit-workout-button").style.visibility = "visible";
    } else if (e.target.className === "exercise-remove-button") {
        e.target.parentNode.remove();
    } else if (e.target.className === "set-create-button") {
        const currentExerciseNumber = e.target.parentNode.count;
        createSetSection(currentExerciseNumber);
    } else if (e.target.className === "set-remove-button") {
        let curExerciseObj = e.target.parentNode.parentNode;
        if (curExerciseObj.querySelectorAll('section').length === 1) {
            curExerciseObj.remove();
        } else {
            e.target.parentNode.remove();
        }
    }
});

document.getElementById("submit-workout-button").addEventListener("click", function(e) {
    const workoutForm = document.getElementById("workout-form"); 
    e.preventDefault();

    if (validateForm() === true) {
        const workoutObject = makeWorkoutObject();
        addWorkoutObjectToIndexedDB(workoutObject);
    } else {
        console.log("failed form validation");
        if (!workoutForm.checkValidity()) {
            workoutForm.reportValidity();
        }
    }
});

