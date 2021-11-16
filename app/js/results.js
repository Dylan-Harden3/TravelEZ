
window.onload = async () => {
    // when we load the window we do the search
    if(!await isSameSearch()){
        console.log('search: ' + localStorage.getItem('search'))
        await search(localStorage.getItem('search'));
        // set the smaller search bar to the search which was entered
        await setResultsSearch();
    }
    // once the search is complete we remove the loading screen
    await deleteLoading();
}

async function setError() {
    window.location.href = 'error.html';
}

async function isSameSearch(){
    return localStorage.getItem('search') == localStorage.getItem('lastSearch');
}

async function search(text)  {
    // here we can either have a location search, a hotel search, or a flight searchs
    if(await isValidInput(text)){
        if(localStorage.getItem('location-selected') == 'true') {
            await getHotels(text);
            await getWeather(text);
            await getTime(text);
        }else if(localStorage.getItem('hotel-selected') == 'true'){ 
            await searchHotels(text);
        }else {
            await searchflights(text);
        }
    }else {
        window.alert('you must enter all fields');
        window.location.href = 'search.html';
    }
}

async function isValidInput(search){

    var params = search.split(',');
    for(var i = 0 ; i < params.length ; i++){
        if(params[i] == ''){
            return false;
        }
    }
    return true;
}

// weather request
async function getWeather(text) {
    const responseWeather = await fetch(`../../getweather/${text}`);
    const jsonWeather = await responseWeather.text();
    if(jsonWeather.startsWith('error')){
        await setError();
        return;
    }
    await setWeather(jsonWeather);
}

// time request
async function getTime(text) {
    const responseTime = await fetch(`../../gettime/${text}`);
    const jsonTime = await responseTime.text();
    if(jsonTime.startsWith('error')){
        await setError();
        return;
    }
    await setTime(jsonTime);
}

// hotel request
async function getHotels(text) {
    const responseHotels = await fetch(`../../gethotels/${text}`);
    const jsonHotels = await responseHotels.json();
    await setResults(jsonHotels);
}

//search Hotels
async function searchHotels(text) {
    const hotelSearchResponse = await fetch(`../../searchhotels/${text}`);
    const jsonHotelSearch = await hotelSearchResponse.json();
    if(jsonHotelSearch.error){
        await setError();
        return;
    }
    await setHotels(jsonHotelSearch);
}

// to set weather/time we just add the text to the corresponding paragraph
async function setWeather(text) {
    var p = document.getElementById('weather-results');
    p.textContent = `In ${localStorage.getItem('search')}, ${text}`;
}

async function setTime(text) {
    var timeP = document.getElementById('time-results');
    timeP.textContent = `The local time in ${localStorage.getItem('search')} ${text}`;
    
}

// set the hotels and landmarks from a location search
async function setResults(info) {
    if(info.error) {
        await setError();
        return;
    }
    var searchV = document.getElementById('search-value');
    searchV.innerHTML = `Showing results for <br>${localStorage.getItem('search')}`;
    var hotelResults = document.getElementById('hotel-results');
    var hotels = info.hotels;
    // iterate through all hotels, creating a card with the info for that hotel
    for(var i = 0 ; i < hotels.length ; i++){
        var newCard = document.createElement('div');
        newCard.classList.add('card');
        newCard.classList.add('m-2');
        newCard.classList.add('mx-auto');
        newCard.style.width = '18rem';

        var img = document.createElement('img');
        img.classList.add('card-img-top')
        img.src = `${hotels[i].image}`;
        newCard.appendChild(img);

        var cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        var cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = `${hotels[i].name}`;
        cardBody.appendChild(cardTitle);

        var hotelRates = document.createElement('div');
        hotelRates.classList.add('d-flex');
        hotelRates.classList.add('justify-content-around');
        
        var price = document.createElement('h6');
        price.textContent = `${hotels[i].price}/night`;
        var stars = document.createElement('h6');
        stars.textContent = `${hotels[i].stars}`;

        hotelRates.appendChild(price);
        hotelRates.appendChild(stars);

        cardBody.appendChild(hotelRates);

        var hotelInfo = document.createElement('div');
        hotelInfo.classList.add('d-flex');
        hotelInfo.classList.add('flex-column');

        var tagline = document.createElement('h6');
        tagline.classList.add('card-text');
        tagline.textContent = `${hotels[i].tagline}`;
        var freebies = document.createElement('h6');
        freebies.classList.add('card-text');
        if(hotels[i].freebies != undefined){
            freebies.textContent = `${hotels[i].freebies}`;
        }

        hotelInfo.appendChild(tagline);
        hotelInfo.appendChild(freebies);

        cardBody.appendChild(hotelInfo);

        newCard.appendChild(cardBody);

        hotelResults.appendChild(newCard);
    }

    var hotelTitle = document.getElementById('hotel-title');
    hotelTitle.innerHTML = `Popular hotels in <br> ${localStorage.getItem('search')}`;

    var landmarkResults = document.getElementById('landmark-results');
    var landmarks = info.landmarks;
    // iterate through all landmarks, creating a card with the info for that hotel
    for(var i = 0 ; i < landmarks.length ; i++){
        var curCard = document.createElement('div');
        curCard.classList.add('card');
        curCard.classList.add('m-2');
        curCard.classList.add('mx-auto');
        curCard.style.width = '18rem';
        
        var curImg = document.createElement('img');
        curImg.classList.add('card-img-top')
        curImg.src = `${landmarks[i].image}`;
        curCard.appendChild(curImg);

        var curBody = document.createElement('div');
        curBody.classList.add('card-body');

        var cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = `${landmarks[i].name}`;

        curBody.appendChild(cardTitle);
        curCard.appendChild(curBody);

        landmarkResults.appendChild(curCard);
    }

    var hotelTitle = document.getElementById('landmark-title');
    hotelTitle.textContent = `Popular landmarks in ${localStorage.getItem('search')}`;
}

async function setHotels(data) {
    var params = localStorage.getItem('search').split(',');
    var searchValue = document.getElementById('search-value');
    searchValue.innerHTML = `hotels in ${params[0]}<br>check-in: ${params[1]}<br>check-out: ${params[2]}`;

    var hotels = data.hotels;

    for(var i = 0 ; i < hotels.length ; i++){
        var outline = document.createElement('div');
        outline.classList.add('d-flex');
        outline.classList.add('align-items-center');
        outline.classList.add('rounded');
        outline.classList.add('navy-border');
        outline.classList.add('flight');
        outline.classList.add('m-2');
        outline.classList.add('w-75')

        var img = document.createElement('img');
        img.src = `${hotels[i].image}`
        img.style.width = '20vh';
        outline.appendChild(img);

        var hotelInfo = document.createElement('div');
        hotelInfo.classList.add('d-flex');
        hotelInfo.classList.add('flex-column');
        hotelInfo.classList.add('justify-content-around');
        hotelInfo.classList.add('grow-2');

        var name = document.createElement('h5');
        name.textContent = `${hotels[i].name}`;
        hotelInfo.appendChild(name);

        var ratingPrice = document.createElement('div');
        ratingPrice.classList.add('d-flex');
        ratingPrice.classList.add('justify-content-around');
        var rating = document.createElement('p');
        rating.textContent = `Rating: ${hotels[i].rating} stars`
        var price = document.createElement('p');
        price.textContent = `Price: ${hotels[i].price}/night`;
        ratingPrice.appendChild(rating);
        ratingPrice.appendChild(price);
        hotelInfo.appendChild(ratingPrice);

        var link = document.createElement('p');
        link.textContent = `${hotels[i].address}`;

        hotelInfo.appendChild(link);

        outline.append(hotelInfo);

        document.getElementById('flight-results').appendChild(outline);

    }
}

async function searchflights(text) {
    const responseFlights = await fetch(`../../getflights/${text}`);
    const jsonFlights = await responseFlights.json();
    if(jsonFlights.error){
        await setError();
        return;
    }
    await setFlights(jsonFlights);
}

async function setFlights(flightsData) {
    var params = localStorage.getItem('search').split(',');

    var searchValue = document.getElementById('search-value');
    searchValue.innerHTML = `flights from: ${params[0]}<br>to: ${params[1]}<br>on ${params[2]}`;

    if(flightsData.flightsReturn){
        // make an outer div to make the two columns
        var outerDiv = document.createElement('div');
        outerDiv.classList.add('d-flex');
        outerDiv.classList.add('justify-content-evenly');

        //make left column for leaving flights
        var flightsLeaving = document.createElement('div');
        flightsLeaving.classList.add('d-flex');
        flightsLeaving.classList.add('flex-column');
        flightsLeaving.classList.add('justify-content-between');
        flightsLeaving.classList.add('pr-4');

        //make right column for returning flights
        var flightsReturning = document.createElement('div');
        flightsReturning.classList.add('d-flex');
        flightsReturning.classList.add('flex-column');
        flightsReturning.classList.add('justify-content-between');
        flightsReturning.classList.add('pl-4');

        var departFlights = flightsData.flightsLeave;
        var returnFlights = flightsData.flightsReturn;

        for(var i = 0 ; i < departFlights.length && i < returnFlights.length ; i++){
            var outline = document.createElement('div');
            outline.classList.add('d-flex');
            outline.classList.add('align-items-center');
            outline.classList.add('rounded');
            outline.classList.add('navy-border');
            outline.classList.add('flight');
            outline.classList.add('m-2');

            var img = document.createElement('img');
            img.src = `${departFlights[i].image}`
            img.style.width = '20vh';
            outline.appendChild(img);

            var flightInfo = document.createElement('div');
            flightInfo.classList.add('d-flex');
            flightInfo.classList.add('flex-column');
            flightInfo.classList.add('justify-content-around');
            flightInfo.classList.add('grow-2');
            
            var namePrice = document.createElement('div');
            namePrice.classList.add('d-flex');
            namePrice.classList.add('justify-content-around');
            
            var name = document.createElement('h5');
            name.textContent = `${departFlights[i].name}`;
            namePrice.appendChild(name);
            var price = document.createElement('h6');
            price.textContent = `Price: $${departFlights[i].price}`;
            namePrice.appendChild(price);
            flightInfo.appendChild(namePrice);

            var seatsDuration = document.createElement('div');
            seatsDuration.classList.add('d-flex');
            seatsDuration.classList.add('justify-content-around');
            var seats = document.createElement('p');
            seats.textContent = `Seats Remaining: ${departFlights[i].numSeats}`
            seatsDuration.appendChild(seats);
            var duration = document.createElement('p');
            duration.textContent = `Duration ${departFlights[i].duration}hrs`
            seatsDuration.appendChild(duration);
            flightInfo.appendChild(seatsDuration);
            var link = document.createElement('a');
            link.href = `http://${departFlights[i].website}`;
            link.textContent = `${departFlights[i].website}`;
            link.target = '_blank';
            flightInfo.appendChild(link);

            outline.appendChild(flightInfo);

            flightsLeaving.appendChild(outline);
        }
        for(var i = 0 ; i < departFlights.length && i < returnFlights.length ; i++){
            var outline = document.createElement('div');
            outline.classList.add('d-flex');
            outline.classList.add('align-items-center');
            outline.classList.add('rounded');
            outline.classList.add('navy-border');
            outline.classList.add('flight');
            outline.classList.add('m-2');

            var img = document.createElement('img');
            img.src = `${returnFlights[i].image}`
            img.style.width = '20vh';
            outline.appendChild(img);

            var flightInfo = document.createElement('div');
            flightInfo.classList.add('d-flex');
            flightInfo.classList.add('flex-column');
            flightInfo.classList.add('justify-content-around');
            flightInfo.classList.add('grow-2');
            
            var namePrice = document.createElement('div');
            namePrice.classList.add('d-flex');
            namePrice.classList.add('justify-content-around');
            
            var name = document.createElement('h5');
            name.textContent = `${returnFlights[i].name}`;
            namePrice.appendChild(name);
            var price = document.createElement('h6');
            price.textContent = `Price: $${returnFlights[i].price}`;
            namePrice.appendChild(price);
            flightInfo.appendChild(namePrice);

            var seatsDuration = document.createElement('div');
            seatsDuration.classList.add('d-flex');
            seatsDuration.classList.add('justify-content-around');
            var seats = document.createElement('p');
            seats.textContent = `Seats Remaining: ${returnFlights[i].numSeats}`
            seatsDuration.appendChild(seats);
            var duration = document.createElement('p');
            duration.textContent = `Duration ${returnFlights[i].duration}hrs`
            seatsDuration.appendChild(duration);
            flightInfo.appendChild(seatsDuration);
            var link = document.createElement('a');
            link.href = `http://${returnFlights[i].website}`;
            link.textContent = `${returnFlights[i].website}`;
            link.target = '_blank';
            flightInfo.appendChild(link);

            outline.appendChild(flightInfo);

            flightsReturning.appendChild(outline);
        }
        var leavingTitle = document.createElement('h4');
        var returningTitle = document.createElement('h4');

        leavingTitle.innerHTML = `flights from: ${params[0]}<br>to: ${params[1]}<br>on ${params[2]}`;
        returningTitle.innerHTML = `flights from: ${params[1]}<br>to: ${params[0]}<br>on ${params[3]}`;

        flightsLeaving.prepend(leavingTitle);
        flightsReturning.prepend(returningTitle);

        outerDiv.appendChild(flightsLeaving);
        outerDiv.appendChild(flightsReturning);

        document.getElementById('flight-results').appendChild(outerDiv);
    }else{
        var flights = flightsData.flightsLeave;
        for(var i = 0 ; i < flights.length ; i++) {
            var outline = document.createElement('div');
            outline.classList.add('d-flex');
            outline.classList.add('align-items-center');
            outline.classList.add('rounded');
            outline.classList.add('navy-border');
            outline.classList.add('flight');
            outline.classList.add('m-2');
            outline.classList.add('w-75');

            var img = document.createElement('img');
            img.src = `${flights[i].image}`
            img.style.width = '20vh';
            outline.appendChild(img);

            var flightInfo = document.createElement('div');
            flightInfo.classList.add('d-flex');
            flightInfo.classList.add('flex-column');
            flightInfo.classList.add('justify-content-around');
            flightInfo.classList.add('grow-2');
            
            var namePrice = document.createElement('div');
            namePrice.classList.add('d-flex');
            namePrice.classList.add('justify-content-around');
            
            var name = document.createElement('h5');
            name.textContent = `${flights[i].name}`;
            namePrice.appendChild(name);
            var price = document.createElement('h6');
            price.textContent = `Price: $${flights[i].price}`;
            namePrice.appendChild(price);
            flightInfo.appendChild(namePrice);

            var seatsDuration = document.createElement('div');
            seatsDuration.classList.add('d-flex');
            seatsDuration.classList.add('justify-content-around');
            var seats = document.createElement('p');
            seats.textContent = `Seats Remaining: ${flights[i].numSeats}`
            seatsDuration.appendChild(seats);
            var duration = document.createElement('p');
            duration.textContent = `Duration ${flights[i].duration}hrs`
            seatsDuration.appendChild(duration);
            flightInfo.appendChild(seatsDuration);
            var link = document.createElement('a');
            link.href = `http://${flights[i].website}`;
            link.textContent = `${flights[i].website}`;
            link.target = '_blank';
            flightInfo.appendChild(link);

            outline.appendChild(flightInfo);

            document.getElementById('flight-results').appendChild(outline);
        }
    }
}

// set the search bar to the correct search
async function setResultsSearch() {

    var locationSelected = localStorage.getItem('location-selected');
    var hotelSelected = localStorage.getItem('hotel-selected');
    var flightSelected = localStorage.getItem('flight-selected');
    // we check which search was selected and set the icon and bar to reflect that
    if(locationSelected == 'true') {
        document.getElementById('search-description').textContent = 'location search';
        changeOutline('location');
        changeBar('location');
    }else if(hotelSelected == 'true'){
        document.getElementById('search-description').textContent = 'hotel search';
        changeOutline('hotel');
        changeBar('hotel');
    }else {
        document.getElementById('search-description').textContent = 'flight search';
        changeOutline('flight');
        changeBar('flight');
    }
 }

 // set the correct icon
function changeOutline(icon) {
    var icons = document.getElementsByClassName('icon');
    // iterate all icons and set the desired one to selected
    for(var i = 0 ; i < icons.length ; i++){
        if(icons[i].id != icon){
            icons[i].classList.remove('outline-red');
        }else {
            icons[i].classList.add('outline-red')
            console.log("icon: " + icon)
            document.getElementById('search-description').textContent = `${icon} search`;
        }
    }
}

// set the correct search bar
function changeBar(type) {
    var realId = `${type}-search`;

    // get the old search bar which was selected, and set it to display: none
    var selected = document.getElementsByClassName('selected');
    selected[0].classList.add('not-selected');
    selected[0].classList.remove('selected');

    // get the new search bar and set it to be displayed
    var newSelected = document.getElementById(realId);
    newSelected.classList.add('selected');
    newSelected.classList.remove('not-selected');
    console.log('type ' + type)
    if(type == 'flight'){
        document.getElementById('round-trip').style.display = 'block';
    }else {
        document.getElementById('round-trip').style.display = 'none';
    }
}

async function deleteLoading() {
    var loading = document.getElementById('loading');
    loading.style = 'z-index: -1 !important';
    var loader = document.getElementById('loader');
    loader.style.display = 'none';
}