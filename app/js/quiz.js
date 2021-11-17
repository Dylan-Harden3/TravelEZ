// submits quiz, fills local storage with results
async function submit() {
    let type, activities, weather;  // to hold values of each question

    // type (question 1)
    if (document.getElementById("q1a1").checked) {
        type = "Coastal";
        document.getElementById("q1a1").checked = false;
    } else if (document.getElementById("q1a2").checked) {
        type = "Continental";
        document.getElementById("q1a2").checked = false;
    } else if (document.getElementById("q1a3").checked) {
        type = "Exotic";
        document.getElementById("q1a3").checked = false;
    } else {
        type = "n/a";
    }

    // activities (question 2)
    if (document.getElementById("q2a1").checked) {
        activities = "Sightseeing";
        document.getElementById("q2a1").checked = false;
    } else if (document.getElementById("q2a2").checked) {
        activities = "Outdoor Adventure";
        document.getElementById("q2a2").checked = false;
    } else if (document.getElementById("q2a3").checked) {
        activities = "Leisure";
        document.getElementById("q2a3").checked = false;
    } else {
        activities = "n/a";
    }

    // weather (question 3)
    if (document.getElementById("q3a1").checked) {
        weather = "Hot";
        document.getElementById("q3a1").checked = false;
    } else if (document.getElementById("q3a2").checked) {
        weather = "Temperate";
        document.getElementById("q3a2").checked = false;
    } else if (document.getElementById("q3a3").checked) {
        weather = "Cold";
        document.getElementById("q3a3").checked = false;
    } else {
        weather = "n/a";
    }

    if(weather == "n/a" || activities == "n/a" || type == "n/a"){
        alert("You must enter all fields");
    }else {
        // submitting answers
        await getResults(`${type},${activities},${weather}`);
    }
}
// quiz results 
async function getResults(text) {
    console.log("submitting: ", text);
    console.log("(not submitted to server yet, check line 40 of quiz.js)");
    return;  // temp since not hooked up to backend yet
    const responseResults = await fetch(`../../getresults/${text}`);  // text = <type>,<activities>,<weather>
    console.log(responseResults);
}

// 