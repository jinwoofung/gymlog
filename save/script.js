// db operations 
const request = window.indexedDB.open("workoutsdb");
let db;

request.onupgradeneeded = function(event) {
    /* db doesn't exist, so create a new db. onupgradeneeded method will only be
    called when the database is newly created. I wanted this tool to be simple 
    so adding new indexes to sort by other than date felt unnecessary. */
    db = request.result;
    const store = db.createObjectStore("workouts", { keyPath: "id", autoIncrement: true});
    const dateIndex = store.createIndex("byDate", "date");
    const workout_json = store.createIndex("workout_json", "workout_json");

    console.log("workoutdb created!");
    
    /* The problem of parallel updating (same page on a new tab with a different version) 
    will not happen */

    // This may change if the option to add cardio is added. 
};

request.onsuccess = function(event) {
    // If there are previous workouts already stored in the db, we need to load them onto the page. 

    /* If there are a lot of workouts, it might take too much time and memory to load all the workouts.
    To keep it realistic, only the most recent 7 workouts will be displayed. In terms of the id, its the 
    7 greatest id numbers. */

    db = request.result;

    let tx = db.transaction("workouts", "readonly"); 
    let store = tx.objectStore("workouts");

    let storeCount = store.count();

    storeCount.onsuccess = function() {
        if (storeCount.result !== 0) {
            let cursorRequest = store.openCursor({direction: "prev"});
            let count = 0; 
        
            // finding the largest key - i.e. last element in the array of keys. 
            cursorRequest.onsuccess = function() {
                let cursor = cursorRequest.result;

                if (cursor && count < 7) {
                    // add html logic here once data submission logic into idb is complete. 
                    const prevWorkoutSect = getElementById("prev-workout-sect");

                    let date = store.

                    count++;
                    cursor.continue();
                } else {
                    // Latest 7 workouts have been loaded, do not continue traversing cursor. 
                }
            };
        }
        console.log("existing workouts loaded!");
    }

};

request.onerror = (event) => {
    // An error will likely happen if the user doesn't give the tool permission. 
    console.log("failed creating workoutsdb.");
};

/* A user must add an exercise before adding sets. Thus the page starts with only the 
'add exercise' form initially. Only after an exercise is submitted will the users see 
the form to add sets. */

document.getElementById("add-workout").addEventListener("click", function(e) {
    e.preventDefault();

    /* Open a transaction on "readwrite" and create an object to log a single workout. Conveniently, 
    if a user decides to not add the workout when the form is partially submitted, thenature of the 
    transaction object will revert the changes made to the workout db. */ 
    
    /* The transaction is only deemed complete when the "save workout" button located at the end of the form 
    is filled, which will subsequently result in the object converted into a JSON string. All other submit 
    buttons only modify the workout object. */

    const tx = db.transaction("workouts", "readwrite");
    const workoutObjectStore = tx.objectStore("workouts");

    const workoutObject = new Object(); 

    const date = document.getElementById('date');
    workoutObject.date = date;
    const split = document.getElementById('split');
    workoutObject.split = split;
    
    /* display the workout date, split and location on a seperate box. The user may 
    create only one workout at a time. (NOT IMPLEMENTED YET) */
    
    const workoutSect = document.createElement("section");
    document.querySelector("main").appendChild(workoutSect);

    const heading = document.createElement("h3");
    heading.textContent = date.value + ": " + split.value;
    workoutSect.appendChild(heading);
    
    /* After specifying a workout by entering the date and split, 
    they are able to add specific exercises using another form */

    let addExerciseBtn = document.createElement("button");
    addExerciseBtn.innerText = "Add Exercise"
    workoutSect.appendChild(addExerciseBtn);

    // prevent duplicate exercise ids
    let exerciseCount = 0;

    // store exercises in an array to later add it to exercise object
    const exerciseCollectionArr = [];

    /* Users can add exercises. Pressing the "Add Exercise" button will create 
    a form that accepts exercises. */
    addExerciseBtn.addEventListener("click", function(e) {
        e.preventDefault();

        const exerciseObject = new Object();

        const exerciseSect = document.createElement("section");
        document.querySelector("main").appendChild(exerciseSect);

        const exerciseForm = document.createElement("form");

        let label = document.createElement("label");
        label.htmlFor = "exercise" + exerciseCount;
        label.innerText = "Exercise: ";
        let input = document.createElement("input");
        input.id = "exercise" + exerciseCount;
        input.required = true;
        let submit = document.createElement("button");
        submit.type = "submit";
        submit.innerText = "submit exercise";
        
        exerciseForm.appendChild(label);
        exerciseForm.appendChild(input);
        exerciseForm.appendChild(submit);
        workoutSect.appendChild(exerciseForm);

        ++exerciseCount;

        submit.addEventListener("click", function(e) {
            e.preventDefault();

            const exerciseHeading = document.createElement("h4");
            exerciseObject.name = input.value;
            exerciseHeading.textContent = input.value;
            exerciseSect.appendChild(exerciseHeading);

            let addSetBtn = document.createElement("button");
            addSetBtn.innerText = "Add Set";

            exerciseSect.appendChild(addSetBtn);

            let setCount = 0;

            const setArr = [];

            /* Once an exercise is added, users will be able to add sets for that exercise. This works identical
            to how you could previously add exercises after a workout has been added */

            // What happens when you click "Add Set": 
            addSetBtn.addEventListener("click", function(e) {
                const setSect = document.createElement("section");
                exerciseSect.appendChild(setSect);

                const setObj = new Object();
                
                let setForm = document.createElement("form");
                let setWeightLabel = document.createElement("label");
                setWeightLabel.textContent = "Weight"
                setWeightLabel.htmlFor = "e" + exerciseCount + "s" + setCount + "w";
                let setWeightInput = document.createElement("input");
                setWeightInput.id = "e" + exerciseCount + "s" + setCount;
                setForm.appendChild(setWeightLabel);
                setForm.appendChild(setWeightInput);

                let setRepLabel = document.createElement("label");
                setRepLabel.textContent = "Reps"
                setRepLabel.htmlFor = "e" + exerciseCount + "s" + setCount + "r";
                let setRepInput = document.createElement("input");
                setRepInput.id = "e" + exerciseCount + "s" + setCount;
                setForm.appendChild(setRepLabel);
                setForm.appendChild(setRepInput);
                
                setSect.appendChild(setForm);
                
                ++setCount;

                /* submit set */
                const setSubmit = document.createElement("button");
                setSubmit.type = "submit";
                setSubmit.textContent = "save set";
                setForm.appendChild(setSubmit);

                setSubmit.addEventListener("click", function(e) {
                    e.preventDefault();
                    
                    // stored set information into object, and appended to array
                    setObj.weight = setWeightInput.value;
                    setObj.reps = setRepInput.value;
                    setArr.push(setObj);

                    let set = document.createElement("p");
                    set.textContent = setRepInput.value + "of" + setWeightInput.value;
                    setSect.appendChild(set);
                });
            });
            exerciseObject.sets = setArr;
        });
        exerciseCollectionArr.push(exerciseObject);
    });
    workoutObject.exercises = exerciseCollectionArr;

    // add completed workoutObject into the workout objectStore

    const workoutObjString = JSON.stringify(workoutObject);
    let addRequest = workoutObjectStore.add(workoutObjString);

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


/* Each time the "add-set" button is clicked, a box containing 
the input to the form is created on the page.*/

