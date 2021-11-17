// submits quiz, fills local storage with results
async function submit() {
    let type, activities, weather;  // to hold values of each question

    // type (question 1)
    if (document.getElementById("q1a1").checked) {
        type = "Coastal";
    } else if (document.getElementById("q1a2").checked) {
        type = "Continental";
    } else {
        type = "Exotic";
    }

    // activities (question 2)
    if (document.getElementById("q2a1").checked) {
        activities = "Sightseeing";
    } else if (document.getElementById("q2a2").checked) {
        activities = "Outdoor Adventure";
    } else {
        activities = "Leisure";
    }

    // weather (question 3)
    if (document.getElementById("q3a1").checked) {
        weather = "Hot";
    } else if (document.getElementById("q3a2").checked) {
        weather = "Temperate";
    } else {
        weather = "Cold";
    }

    // submitting answers
    await getResults(`${type},${activities},${weather}`);
}

// quiz results 
async function getResults(text) {
    console.log("submitting: ", text);
    console.log("(not submitted to server yet, check line 40 of quiz.js)");
    return;  // temp since not hooked up to backend yet
    const responseResults = await fetch(`../../getresults/${text}`);  // text = <type>,<activities>,<weather>
    console.log(responseResults);
}