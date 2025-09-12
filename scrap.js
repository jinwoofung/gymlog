addExerciseBtn.addEventListener("click", function(e) {
    e.preventDefault();

    ++exerciseCount;
    
    // container to store workout information and later send to db
    let exerciseObject = new Object();

     submit.addEventListener("click", function(e) {
        e.preventDefault();

        exerciseObject.name = input.value;

        let addSetBtn = document.createElement("button");
        addSetBtn.innerText = "Add Set";
        exerciseSect.appendChild(addSetBtn);

        const setArr = [];
        // unique set id 
        let setCount = 0; 

        /* Once an exercise is added, users will be able to add sets for that exercise. This works identical
        to how you could previously add exercises after a workout has been added */

        // What happens when you click "Add Set": 
        addSetBtn.addEventListener("click", function(e) {

            const setObj = new Object();
            
            
            
            
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