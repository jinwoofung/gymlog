document.getElementById("workout-form-sect").style.visibility = "hidden";

const request = window.indexedDB.open("workoutsdb");
let db;

request.onupgradeneeded = function(event) {
    db = request.result;
    const store = db.createObjectStore("workouts", { keyPath: "id", autoIncrement: true});
    // Adds ability to sort workouts by date
    const dateIndex = store.createIndex("byDate", "date");
    const workout_json = store.createIndex("workout_json", "workout_json");

    console.log("workoutdb created!");
};

request.onsuccess = function(event) {
    // allows users to view previous workouts 
    db = request.result;

    let tx = db.transaction("workouts", "readonly"); 
    let store = tx.objectStore("workouts");

    let storeCount = store.count();

    storeCount.onsuccess = function() {
        if (storeCount.result !== 0) {
            // access the latest workouts first
            let cursorRequest = store.openCursor({direction: "prev"});
            let workoutCount = 0; 
        
            cursorRequest.onsuccess = function() {
                let cursor = cursorRequest.result;
                const prevWorkoutsSect = document.getElementById("prev-workouts-sect");

                // only display the 7 latest workouts unless user requests more
                if (cursor && workoutCount < 7) {
                    let prevWorkoutSect = document.createElement("section");
                    prevWorkoutsSect.appendChild(prevWorkoutSect);
                    
                    let prevWorkoutDate = cursor.key.date;
                    let prevWorkoutObj = JSON.parse(cursor.value.workout_json);

                    let prevWrkHeader = prevWorkoutSect.createElement("h2");
                    prevWrkHeader.textContent = prevWorkoutDate + ": " + prevWorkoutObj.split;
                    prevWorkoutSect.appendChild(prevWrkHeader);

                    for (let i = 0; i < prevWorkoutObj.exercises.length; ++i) {
                        let exerciseSect = document.createElement("section");
                        let exerciseObj = prevWorkoutObj.exercises[i];

                        let exerciseHeader = document.createElement("h5");
                        exerciseHeader.textContent = exerciseObj.name;
                        
                        for (let j = 0; j < exerciseObj.sets.length; ++j) {
                            let singleSetDisplay = document.createElement("p");
                            singleSetDisplay.textContent = "Set" + j + ": " + exerciseObj.sets[j].weight + " " + exerciseObj.sets[j].reps;
                            exerciseSect.appendChild(singleSetDisplay);
                        }
                        prevWorkoutSect.appendChild(exerciseSect);
                    }
                    workoutCount++;
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

document.getElementById("add-workout").addEventListener("click", function(e) {
    // makes the page less cluttered by only providing the "adding workout" form when asked for.
    document.getElementById("workout-form-sect").style.visibility = "visible";
    document.getElementById("final-submit-section").style.visibility = "hidden";
});

document.getElementById("workout-form-sect").addEventListener("click", function(e) {
    
    let exerciseCount = 0;
    let setCount = 0;
    
    if (e.target.id === "log-workout") {
        e.preventDefault();
        const workoutSect = document.getElementById("workout-form");

        let addExerciseBtn = document.createElement("button");
        addExerciseBtn.id = "add-exercise-button";
        addExerciseBtn.type = "button";
        addExerciseBtn.innerText = "add exercise";
        workoutSect.appendChild(addExerciseBtn);
    } else if (e.target.id === "add-exercise-button") {
        e.preventDefault();

        const workoutForm= document.getElementById("workout-form");
        const exerciseSect = document.createElement("section");
        exerciseSect.id = "exercise-sect-" + exerciseCount;

        let input = document.createElement("input");
        input.id = "exercise-" + exerciseCount;
        input.required = true;

        let label = document.createElement("label");
        label.htmlFor = "exercise-" + exerciseCount;
        label.innerText = "Exercise: ";

        let exerciseConfirmBtn = document.createElement("button");
        exerciseConfirmBtn.id = "exercise-confirm-btn-" + exerciseCount;
        exerciseConfirmBtn.type = "button";
        exerciseConfirmBtn.innerText = "confirm exercise";

        exerciseSect.appendChild(label);
        exerciseSect.appendChild(input);
        exerciseSect.appendChild(exerciseConfirmBtn);
        workoutForm.appendChild(exerciseSect);
        
        ++exerciseCount;
    } else if (e.target.id === "exercise-confirm-btn-" + exerciseCount) {
        e.preventDefault();

        const exerciseSect = document.getElementById("exercise-sect-" + exerciseCount)
        const setSect = document.createElement("section");

        let setWeightLabel = document.createElement("label");
        setWeightLabel.textContent = "Weight"
        setWeightLabel.htmlFor = "setweight"
        let setWeightInput = document.createElement("input");
        setWeightInput.id = "setweight";
        
        let setRepLabel = document.createElement("label");
        setRepLabel.textContent = "Reps"
        setRepLabel.htmlFor = "setrep";e
        let setRepInput = document.createElement("input");
        setRepInput.id = "setrep";
    
        let setConfirmBtn = document.createElement("button");
        setConfirmBtn.id = "set-confirm-btn";
        setConfirmBtn.type = "button";
        setConfirmBtn.textContent = "confirm set";

        setSect.appendChild(setWeightLabel);
        setSect.appendChild(setWeightInput);
        setSect.appendChild(setRepLabel);
        setSect.appendChild(setRepInput);
        setSect.appendChild(setConfirmBtn);
    
        exerciseSect.appendChild(setSect);
    } else if (e.target.id === "set-confirm-btn") {
        e.preventDefault();


    }
});

document.getElementById("submit-workout").addEventListener("click", function(e) {
    e.preventDefault();

    const tx = db.transaction("workouts", "readwrite");
    const workoutObjectStore = tx.objectStore("workouts");

    const workoutObject = new Object(); 

    const date = document.getElementById('date');
    const split = document.getElementById('split');
    workoutObject.date = date;
    workoutObject.split = split;
    
    // idea: limit users to creating one workout at a time. 

    // To prevent duplicate exercise ids
    let exerciseCount = 0;

    // store exercises in an array to later add it to exercise object
    const exerciseCollectionArr = [];

    workoutObject.exercises = exerciseCollectionArr;

    const addRequest = workoutObjectStore.add(workoutObject);

    addRequest.onsuccess = function() {
        console.log("transaction complete");
    };

    addRequest.onerror = function(event) {
        if (addRequest.error.name == "ConstraintError") {
            console.log("duplicate workout id");
            // make unique id
            event.preventDefault();
        } else {
        }
    }; 
});


