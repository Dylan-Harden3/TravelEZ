// submits quiz, fills local storage with results
async function submit() {
    let type, activities, weather;  // to hold values of each question

    // type (question 1)
    if (document.getElementById("q1a1").checked) {
        type = "0";
    } else if (document.getElementById("q1a2").checked) {
        type = "1";
    } else {
        type = "2";
    }

    // activities (question 2)
    if (document.getElementById("q2a1").checked) {
        activities = "0";
    } else if (document.getElementById("q2a2").checked) {
        activities = "1";
    } else {
        activities = "2";
    }

    // weather (question 3)
    if (document.getElementById("q3a1").checked) {
        weather = "0";
    } else if (document.getElementById("q3a2").checked) {
        weather = "1";
    } else {
        weather = "2";
    }

    // submitting answers
    await getResults(`${type},${activities},${weather}`);
}

// quiz results 
async function getResults(text) {
    console.log("submitting: ", text);
    return;  // temp since not hooked up to backend yet
    const responseResults = await fetch(`../../getresults/${text}`);  // text = <type>,<activities>,<weather>
    console.log(responseResults);
}