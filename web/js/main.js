document.addEventListener("DOMContentLoaded", () => {
    const labels = ["car", "fish", "house", "tree", "bicycle", "guitar", "pencil", "clock"];
    let index = 0;
    const data = {
        student: null,
        session: new Date().getTime(),
        drawings: {}
    };

    const studentInput = document.getElementById('student');
    const instructions = document.getElementById('instructions');
    const advanceBtn = document.getElementById('advanceBtn');
    const sketchPadContainer = document.getElementById('sketchPadContainer');
    const sketchPad = new SketchPad(sketchPadContainer);

    advanceBtn.addEventListener('click', start);

    function start() {
        if (studentInput.value === "") {
            alert("Please type your name first!");
            return;
        }
        data.student = studentInput.value;
        studentInput.style.display = "none";
        sketchPadContainer.style.visibility = "visible";
        const label = labels[index];
        instructions.innerHTML = "Please draw a " + label;
        advanceBtn.innerHTML = "NEXT";
        advanceBtn.removeEventListener('click', start);
        advanceBtn.addEventListener('click', next);
    }

    function next() {
        if (sketchPad.paths.length === 0) {
            alert("Draw something first!");
            return;
        }

        const label = labels[index];
        data.drawings[label] = sketchPad.paths;
        sketchPad.reset();
        index++;
        if (index < labels.length) {
            const nextLabel = labels[index];
            instructions.innerHTML = "Please draw a " + nextLabel;
        } else {
            sketchPadContainer.style.visibility = "hidden";
            instructions.innerHTML = "Thank you!";
            advanceBtn.innerHTML = "SAVE";
            advanceBtn.removeEventListener('click', next);
            advanceBtn.addEventListener('click', save);
        }
    }

    function save() {
        advanceBtn.style.display = 'none';
        instructions.innerHTML = "Take your downloaded file and place it alongside the others in the dataset!";

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
        const fileName = data.session + ".json";
        element.setAttribute('download', fileName);

        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
});
