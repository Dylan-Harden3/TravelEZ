// submits quiz, fills local storage with results
async function submit() {
    console.log("hello");
    console.log(document.getElementById("q3a1").checked);
    console.log(document.getElementById("q3a2").value);
    console.log(document.getElementById("q3a3").value);
}

// quiz results 
async function getResults(text) {
    const responseResults = await fetch(`../../getresults/${text}`);  // text = <type>,<activities>,<weather>
    console.log(responseResults);
}