// submits quiz, fills local storage with results
async function submit() {
    let type, activities, weather;  // to hold values of each question

    // type (question 1)
    if (document.getElementById("q1a1").checked) {
        type = "Coastal";
    } else if (document.getElementById("q1a2").checked) {
        type = "Continental";
    } else if (document.getElementById("q1a3").checked) {
        type = "Exotic";
    } else {
        type = "n/a";
    }

    // activities (question 2)
    if (document.getElementById("q2a1").checked) {
        activities = "Sightseeing";
    } else if (document.getElementById("q2a2").checked) {
        activities = "Outdoor Adventure";
    } else if (document.getElementById("q2a3").checked) {
        activities = "Leisure";
    } else {
        activities = "n/a";
    }

    // weather (question 3)
    if (document.getElementById("q3a1").checked) {
        weather = "Hot";
    } else if (document.getElementById("q3a2").checked) {
        weather = "Temperate";
    } else if (document.getElementById("q3a3").checked) {
        weather = "Cold";
    } else {
        weather = "n/a";
    }

    if(weather == "n/a" || activities == "n/a" || type == "n/a"){
        alert("You must enter all fields");
    }else {
        // submitting answers
        await setResults(`${type},${activities},${weather}`);
        window.location.href = "quizResults.html";
    }
}
// quiz results 
async function setResults(text) {
    localStorage.setItem('quizResults',text);
}