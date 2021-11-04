
window.onload = () => {
    console.log(`location-selected ${localStorage.getItem('location-selected')}`);
    console.log(`hotel-selected ${localStorage.getItem('hotel-selected')}`);
    console.log(`flight-selected ${localStorage.getItem('flight-selected')}`);
    console.log(`search: ${localStorage.getItem('search')}`)
    search(localStorage.getItem('search'));
    setResultsSearch();
}

async function search(text)  {
<<<<<<< HEAD
    var params = text.split(',');
    if(params.length == 1) {
        getWeather(text);
        getTime(text);
        getHotels(text);
    }else if(localStorage.getItem('hotel-selected') == 'true'){ 
        searchHotels(text);
    }else {
        //makeSearch('flight', params);
=======
    console.log(text);
    if (localStorage.getItem('location-selected') == 'true') {
        console.log("location");
        getWeather(text);
        getTime(text);
        getHotels(text);
    } else if (localStorage.getItem('hotel-selected') == 'true') {
        console.log("hotel");
        getHotels(text);
    } else {
        console.log("flights")
>>>>>>> b14736b (implemented hotels/weather API; curr return as JSON)
    }
}

// weather request
async function getWeather(text) {
    const responseWeather = await fetch(`../../getweather/${text}`);
<<<<<<< HEAD
    const jsonWeather = await responseWeather.text();
    console.log(jsonWeather);
    setWeather(jsonWeather);
=======
    const jsonWeather = await responseWeather.json();
    console.log(jsonWeather);
>>>>>>> b14736b (implemented hotels/weather API; curr return as JSON)
}

// time request
async function getTime(text) {
    const responseTime = await fetch(`../../gettime/${text}`);
<<<<<<< HEAD
    const jsonTime = await responseTime.text();
    console.log(jsonTime);
    setTime(jsonTime);
=======
    const jsonTime = await responseTime.json();
    console.log(jsonTime);
>>>>>>> b14736b (implemented hotels/weather API; curr return as JSON)
}

// hotel request
async function getHotels(text) {
    const responseHotels = await fetch(`../../gethotels/${text}`);
    const jsonHotels = await responseHotels.json();
<<<<<<< HEAD

    setResults(jsonHotels);
}

//search Hotels
async function searchHotels(text) {
    const hotelSearchResponse = await fetch(`../../searchhotels/${text}`);
    const jsonHotelSearch = await hotelSearchResponse.json();
}

function setWeather(text) {
    var p = document.getElementById('weather-results');
    p.textContent = `In ${localStorage.getItem('search')}, ${text}`;
}

function setTime(text) {
    var timeP = document.getElementById('time-results');
    timeP.textContent = `The local time in ${localStorage.getItem('search')} ${text}`;
    var searchV = document.getElementById('search-value');
    searchV.innerHTML = `Showing results for <br>${localStorage.getItem('search')}`;
}

function setResults(info) {
    var hotelResults = document.getElementById('hotel-results');
    for(var i = 0 ; i < info[0].length ; i++){
        hotelResults.innerHTML += `<p>${info[0][i]}</p>`;
    }
    var hotelTitle = document.getElementById('hotel-title');
    hotelTitle.textContent = `Popular hotels in ${localStorage.getItem('search')}`;
    var landmarkResults = document.getElementById('landmark-results');
    for(var i = 0 ; i < info[1].length ; i++){
        landmarkResults.innerHTML += `<p>${info[1][i]}</p>`;
    }
    var hotelTitle = document.getElementById('landmark-title');
    hotelTitle.textContent = `Popular landmarks in ${localStorage.getItem('search')}`;
}  

function setResultsSearch() {
    var locationSelected = localStorage.getItem('location-selected');
    var hotelSelected = localStorage.getItem('hotel-selected');
    var flightSelected = localStorage.getItem('flight-selected');
    if(locationSelected == 'true') {
        changeOutline('location');
        changeBar('location');
    }else if(hotelSelected == 'true'){
        changeOutline('hotel');
        changeBar('hotel');
    }else {
        changeOutline('flight');
        changeBar('flight');
    }
 }

function changeOutline(icon) {
    var icons = document.getElementsByClassName('icon');
    for(var i = 0 ; i < icons.length ; i++){
        if(icons[i].id != icon){
            icons[i].classList.remove('outline-navy');
        }else {
            icons[i].classList.add('outline-navy')
        }
    }
}

function changeBar(type) {
    var realId = `${type}-search`;
    var selected = document.getElementsByClassName('selected');
    selected[0].classList.add('not-selected');
    selected[0].classList.remove('selected');
    var newSelected = document.getElementById(realId);
    newSelected.classList.add('selected');
    newSelected.classList.remove('not-selected');
=======
    console.log(jsonHotels.suggestions);
>>>>>>> b14736b (implemented hotels/weather API; curr return as JSON)
}