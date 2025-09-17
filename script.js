document.getElementById("submit-workout-button").style.visibility = "hidden";

let exerciseCount = 0;
let setCount = 0;

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
    // allows users to view previous workouts 
    db = request.result;

    let tx = db.transaction("workouts", "readonly"); 
    let store = tx.objectStore("workouts");

    let storeCount = store.count();

    storeCount.onsuccess = function() {
        if (storeCount.result > 0) {
            // access the latest workouts first
            console.log(storeCount.result + " previous workouts in db");
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

request.onerror = function(e) {
    // An error will likely happen if the user doesn't give the tool permission. 
    console.log("failed creating workoutsdb.");
};

function validateForm() {
    const workoutForm = document.getElementById("workout-form");
    if (workoutForm.date.value === '' || workoutForm.split.value === '') return false;

    const exerciseSections = document.querySelectorAll('.exerciseSection');
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

function createSetSection(exerciseNumber) {
    const exerciseSect = document.getElementById("exercise-section-" + exerciseNumber);
        
    const setSect = document.createElement("section");
    setSect.className = 'setSection';

    // set weight 
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

    let setConfirmBtn = document.createElement("button");
    setConfirmBtn.className = "set-confirm-button";
    setConfirmBtn.type = "button";
    setConfirmBtn.textContent = "add another set";

    setSect.appendChild(setWeightLabel);
    setSect.appendChild(setRepLabel);
    setSect.appendChild(setConfirmBtn);
    exerciseSect.appendChild(setSect);
}

document.getElementById("workout-form").addEventListener("click", function(e) {
    if (e.target.id === "confirm-date-split-button") {
        const workoutForm = document.getElementById("workout-form");

        let addExerciseBtn = document.createElement("button");
        addExerciseBtn.id = "add-exercise-button";
        addExerciseBtn.type = "button";
        addExerciseBtn.innerText = "Add exercise";
        workoutForm.appendChild(addExerciseBtn);

        document.getElementById("confirm-date-split-button").hidden = true;

    } else if (e.target.id === "add-exercise-button") {
        const workoutForm = document.getElementById("workout-form");
        const exerciseSection = document.createElement("section");
        exerciseSection.id = "exercise-section-" + exerciseCount;
        exerciseSection.count = exerciseCount;
        exerciseSection.className = "exerciseSection";

        let input = document.createElement("input");
        input.id = "exercise-" + exerciseCount; // 
        input.required = true;

        let label = document.createElement("label");
        label.htmlFor = "exercise-" + exerciseCount;
        label.innerText = "Exercise: ";

        let exerciseConfirmBtn = document.createElement("button");
        exerciseConfirmBtn.type = "button";
        exerciseConfirmBtn.className = "exercise-confirm-button"
        exerciseConfirmBtn.innerText = "confirm exercise";

        exerciseSection.appendChild(label);
        exerciseSection.appendChild(input);
        exerciseSection.appendChild(exerciseConfirmBtn);
        workoutForm.appendChild(exerciseSection);
        
        ++exerciseCount;
    // Don't need confirm button, its just a form anyways 
    } else if (e.target.className === "exercise-confirm-button") {
        const currentExerciseNumber = e.target.parentNode.count
        createSetSection(currentExerciseNumber);
        e.target.hidden = true;
        document.getElementById("submit-workout-button").style.visibility = "visible";
    } else if (e.target.className === "set-confirm-button") {
        const currentExerciseNumber = e.target.parentNode.parentNode.count
        createSetSection(currentExerciseNumber);
        e.target.hidden = true;
    }
});

document.getElementById("submit-workout-button").addEventListener("click", function(e) {
    if (validateForm() === true) {
        e.preventDefault();
        const tx = db.transaction("workouts", "readwrite");
        const workoutObjectStore = tx.objectStore("workouts");
        const workoutForm = document.getElementById("workout-form"); 
        let newWorkout = new Object();

        console.log("adding workout to a new workout object");
        // store exercises in an array to later add it to exercise object
        newWorkout.date = document.getElementById("date").value;
        console.log("added workout date");
        newWorkout.split = document.getElementById("split").value;
        console.log("added workout split");

        let exercises = [];
        console.log(workoutForm.childElementCount);
        for (let i = 0; i < workoutForm.childElementCount; ++i) {
            if (workoutForm.children[i].tagName === "SECTION") { // "exercise" section
                console.log("entered a exercise section element");
                let exercise = new Object();
                exercise.name = workoutForm.children[i].querySelector("input").value;
                console.log("adding exercise #" + i); 
                let sets = [];

                for (let j = 0; j < workoutForm.children[i].childElementCount; ++j) { 
                    if (workoutForm.children[i].children[j].tagName === "SECTION") { // "set" section
                        const currentSetSection = workoutForm.children[i].children[j];
                        let set = new Object();
                        // handle form validation later
                        set.weight = currentSetSection.children[0].children[0].value; 
                        set.reps = currentSetSection.children[1].children[0].value; 
                        sets.push(set);
                        console.log("added set # " + j + " of exercise " + i + " to set array");
                    }   
                }
                exercise.sets = sets;
                exercises.push(exercise); 
                console.log("added exercise #" + i + " to exercise array");
            }
        }

        newWorkout.exercises = exercises;

        const addRequest = workoutObjectStore.add(newWorkout);

        addRequest.onsuccess = function() {
            console.log("new workout added!")
        };

        addRequest.onerror = function(event) {
            if (addRequest.error.name == "ConstraintError") {
                console.log("duplicate workout id, failed to add");
                // make unique id
                event.preventDefault();
            } else {
            }
        }; 
    } else {
        console.log("incomplete input");
    }
});

