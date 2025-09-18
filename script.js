document.getElementById("submit-workout-button").style.visibility = "hidden";

let exerciseCount = 0;
let setCount = 0;

// indexedDB
const request = window.indexedDB.open("workoutsdb");
let db;

request.onupgradeneeded = function(event) {
    db = request.result;
    const store = db.createObjectStore("workouts", { keyPath: "id", autoIncrement: true});
    // Adds ability to sort workouts by date
    const dateIndex = store.createIndex("byDate", "date");
    console.log("workoutdb created!");
};

request.onsuccess = function(event) {
    console.log("succesfully opened workout db");
    
    db = request.result;

    let tx = db.transaction("workouts", "readonly"); 
    let store = tx.objectStore("workouts");

    let storeCount = store.count();

    // Allows users to view previous workouts 
    storeCount.onsuccess = function() {
        if (storeCount.result > 0) {
            // Access the latest workouts first
            let cursorRequest = store.index("byDate").openCursor(null, "prev");
        
            cursorRequest.onsuccess = function(event) {
                console.log("cursor request success!");
                let cursor = event.target.result;
                console.log(cursor);
                let prevWorkoutsSection = document.getElementById("prev-workouts-section");

                if (cursor) {
                    let prevWorkoutSection = document.createElement("section");
                    prevWorkoutsSection.appendChild(prevWorkoutSection);
                    
                    let prevWorkoutObj = cursor.value;
                    console.log(prevWorkoutObj);

                    let prevWorkoutHeader = document.createElement("h2");
                    prevWorkoutHeader.textContent = prevWorkoutObj.date + ": " + prevWorkoutObj.split;
                    prevWorkoutSection.appendChild(prevWorkoutHeader);

                    for (let i = 0; i < prevWorkoutObj.exercises.length; ++i) {
                        let exerciseSection = document.createElement("section");
                        let exerciseObj = prevWorkoutObj.exercises[i];

                        let exerciseHeader = document.createElement("h5");
                        exerciseHeader.textContent = exerciseObj.name;
                        
                        for (let j = 0; j < exerciseObj.sets.length; ++j) {
                            let singleSetDisplay = document.createElement("p");
                            singleSetDisplay.textContent = "Set " + (j + 1) + ": " + exerciseObj.sets[j].weight + " for " + exerciseObj.sets[j].reps + " reps";
                            exerciseSection.appendChild(singleSetDisplay);
                        }
                        prevWorkoutSection.appendChild(exerciseSection);
                    }
                    cursor.continue();
                } 
            };
        }
        console.log("existing workouts loaded!");
    }
};

request.onerror = function(event) {
    // An error will likely happen if the user doesn't give the tool permission. 
    console.log("failed creating workoutsdb.");
};

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
    console.log("form validated");
    return true;
}

function createSet(exerciseNumber) {
    const exerciseSect = document.getElementById("exercise-section-" + exerciseNumber);
        
    const setSect = document.createElement("section");
    setSect.className = 'setSection';

    // information about the set
    let setWeightLabel = document.createElement("label");
    setWeightLabel.textContent = "Weight: ";
    let setWeightInput = document.createElement("input");
    setWeightInput.type = "text";
    setWeightInput.required = true;
    setWeightLabel.appendChild(setWeightInput);

    let setRepLabel = document.createElement("label");
    setRepLabel.textContent = "Reps: "
    let setRepInput = document.createElement("input");
    setRepInput.type = "text";
    setRepInput.required = true;
    setRepLabel.appendChild(setRepInput);

    // removing a set
    let setRemoveBtn = document.createElement("button"); 
    setRemoveBtn.className = "set-remove-button";
    setRemoveBtn.type = "button"
    setRemoveBtn.textContent = "remove this set";

    setSect.appendChild(setWeightLabel);
    setSect.appendChild(setRepLabel);
    setSect.appendChild(setRemoveBtn);
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
                    if (workoutForm.children[i].children[j].tagName === 'setSection') { // "set" section
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

function addWorkoutToIndexedDB(workoutObject) {
    const tx = db.transaction("workouts", "readwrite");
    const workoutObjectStore = tx.objectStore("workouts");
    const addRequest = workoutObjectStore.add(workoutObject);

    addRequest.onsuccess = function(e) {
        console.log("new workout added!")
    };

    addRequest.onerror = function(e) {
        if (addRequest.error.name == "ConstraintError") {
            console.log("duplicate workout id, failed to add");
            e.preventDefault();
        } 
    };
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
        const exerciseSection = document.createElement("section");
        exerciseSection.id = "exercise-section-" + exerciseCount;
        exerciseSection.count = exerciseCount;
        exerciseSection.className = "exerciseSection";

        let label = document.createElement("label");
        label.innerText = "Exercise: ";

        let input = document.createElement("input");
        input.id = "exercise-" + exerciseCount; // 
        input.required = true;
        label.appendChild(input);

        let exerciseConfirmBtn = document.createElement("button");
        exerciseConfirmBtn.type = "button";
        exerciseConfirmBtn.className = "exercise-confirm-button";
        exerciseConfirmBtn.innerText = "confirm exercise";

        let exerciseRemoveBtn = document.createElement("button");
        exerciseRemoveBtn.type = "button";
        exerciseRemoveBtn.className = "exercise-remove-button";
        exerciseRemoveBtn.innerText = "remove this exercise";

        let setCreateBtn = document.createElement("button"); 
        setCreateBtn.type = "button";
        setCreateBtn.className = "set-create-button";
        setCreateBtn.innerText = "add a set";

        exerciseSection.appendChild(label);
        exerciseSection.appendChild(exerciseConfirmBtn);
        exerciseSection.appendChild(exerciseRemoveBtn);
        exerciseSection.appendChild(setCreateBtn);
        workoutForm.appendChild(exerciseSection);
        
        ++exerciseCount;
    // Don't need confirm button, its just a form anyways 
    } else if (e.target.className === "exercise-confirm-button") {
        const currentExerciseNumber = e.target.parentNode.count
        createSet(currentExerciseNumber);
        e.target.hidden = true;
        document.getElementById("submit-workout-button").style.visibility = "visible";
    } else if (e.target.className === "exercise-remove-button") {
        e.target.parentNode.remove();
    } else if (e.target.className === "set-create-button") {
        const currentExerciseNumber = e.target.parentNode.count;
        createSet(currentExerciseNumber);
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
        addWorkoutToIndexedDB(workoutObject);
    } else {
        if (!workoutForm.checkValidity()) {
            workoutForm.reportValidity();
            return;
        }
    }
});

