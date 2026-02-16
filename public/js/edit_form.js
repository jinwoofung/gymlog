function createButton(textContent, className) {
    let button = document.createElement('button'); 
    button.type = 'button'; 
    button.textContent = textContent;
    button.className = className;

    return button;
}

function createLabelInput(textContent, className, isRequired) {
    let label = document.createElement('label');
    label.textContent = textContent;

    let input = document.createElement('input');
    input.className = className;
    input.required = isRequired;
    label.appendChild(input); 

    return label;
}

function createSetSection() {
    const sect = document.createElement("section");
    sect.className = "setSection";
    sect.append(
        createLabelInput("Weight", 'weightInput', true),
        createLabelInput("Reps", 'repsInput', true),
        createButton("Remove set", "removeSetBtn"),
    );

    const button = sect.querySelector('.removeSetBtn'); 
    button.addEventListener('click', (e) => {
        e.target.parentNode.remove();
    })

    return sect;
}

function createExerciseSection() {
    const sect = document.createElement('section');
    sect.className = 'exerciseSection';
    sect.append(
        createLabelInput('Exercise: ', 'exerciseInput', true),
        createButton("Add set", 'addSetBtn'),
        createButton("Remove exercise", 'removeExerciseBtn'),
    );

    const addSetBtn = sect.querySelector('.addSetBtn');
    addSetBtn.addEventListener('click', (e) => {
        sect.append(createSetSection());
    });

    const removeExerciseBtn = sect.querySelector('.removeExerciseBtn');
    removeExerciseBtn.addEventListener('click', (e) => { 
        e.target.closest('.exerciseSection').remove();
    })

    return sect;
}

function addEventListeners() {
    const addExerciseBtn = document.querySelector('.addExerciseBtn');
    addExerciseBtn.addEventListener('click', (e) => {
        const form = document.getElementById("workout-form");
        form.append(createExerciseSection()); 
    });

    const exerciseSections = document.querySelectorAll(".exerciseSection");
    exerciseSections.forEach(section => {
        section.addEventListener("click", (e) => {
            if (e.target.className === "removeExerciseBtn") {
                e.target.parentNode.remove(); 
            } else if (e.target.className === "removeSetBtn") {
                e.target.parentNode.remove();
            } else if (e.target.className === "addSetBtn") {
                const exerciseSect = e.target.closest('.exerciseSection'); 
                exerciseSect.append(createSetSection()); 
            }}
        )
    })
}

document.addEventListener("DOMContentLoaded", (e) => {
    addEventListeners(); 
});

onsubmit = (e) => {
    const exerciseSections = document.querySelectorAll('.exerciseSection');
    for (let i = 0; i < exerciseSections.length; ++i) {
        exerciseSections[i].querySelector('.exerciseInput').name = `exercise[${i}]`;

        const setSections = exerciseSections[i].querySelectorAll('.setSection');
        for (let j = 0; j < setSections.length; ++j) {
            setSections[j].querySelector('.weightInput').name = `exercise[${i}][sets][${j}][weight]`;
            setSections[j].querySelector('.repsInput').name = `exercise[${i}][sets][${j}][reps]`;
        }
    }
}
