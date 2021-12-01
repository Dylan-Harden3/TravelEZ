// gets quiz results from local storage
window.onload = async () => {
    await getQuizResults(localStorage.getItem('quizResults'));
}

// get quiz recommendation 
async function getQuizResults(text) {
    const responseQuiz = await (await fetch(`../../getresults/${text}`)).json();
    // console.log(responseQuiz);
    document.getElementById('recommendName').textContent = `We Suggest You Visit ${responseQuiz.Name}`;
    // create images and add to DOM
    for(var i = 0 ; i < 3 ; i++){
        var img = document.createElement('img');
        img.src = responseQuiz.images[i];
        img.style.width = '30%';
        if(i == 0){
            img.classList.add('rounded-left');
        }
        if(i == 2){
            img.classList.add('rounded-right');
        }
        document.getElementById('photos').appendChild(img);
    }
    // update description and airport
    document.getElementById('description').textContent = responseQuiz.description;
    document.getElementById('airport').textContent = `Nearby Airport: ${responseQuiz.airport}`;
}