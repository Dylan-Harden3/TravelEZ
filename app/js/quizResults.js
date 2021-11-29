window.onload = async () => {
    await getQuizResults(localStorage.getItem('quizResults'));
}

async function getQuizResults(text) {
    const responseQuiz = await (await fetch(`../../getresults/${text}`)).json();
    console.log(responseQuiz);
    document.getElementById('recommendName').textContent = `We Suggest You Visit ${responseQuiz.Name}`;
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
    
    document.getElementById('description').textContent = responseQuiz.description;
    document.getElementById('airport').textContent = `Nearby Airport: ${responseQuiz.airport}`;
}