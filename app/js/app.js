// Get search bar and add submit event
var textSearch = document.getElementById('search');
textSearch.addEventListener('submit', search)

// search function
function search(e) {
    // first we prevent default and get the text in the search bar
    e.preventDefault();
    var txt = document.getElementById('search-txt').value;
    getHotels(txt);
    getWeather(txt);
}

/*
    For the Weather API
    -you can uncomment the console.log statements to see the steps for dealing with the response 
*/

/*
    general javascript notes:
    - (param1,param2...) => {} is the same as function(param1,param2...) {} it just looks better
    - '' and "" are the same thing
    - you can use `` instead of ""/'' for strings so we can do ${variable} instead of having to do 'string' + var + 'rest of string'
    - ; not required
    - to view the results of console.log() do cntrl+shift+j and then enter a search
*/

function getWeather(city){
    // this was generated on postman, I just added a few other keys to narrow the query
    var search = `https://api.worldweatheronline.com/premium/v1/weather.ashx?q=${city}&key=768a046de2124a9892f160500212610&date=today&format=json&fx=no&mca=no`;
    // fetch() basically just sends the request and returns a promise (google javascript promise), essentially we just call .then a bunch
    fetch(search)
    .then(result => {
        // if status is in 400s we messed up something, if its in 500s server messed up
        // 200 means everything with the request went ok, you can also call result.ok
        if(result.status == 200){
            //console.log("weather api success");
        }
        // this is just a response object with some information about the request like the status, so we convert it to JSON (kinda like a map)
        // console.log(result);
        return result.json();
    })
    .then(data => {
        // data is what we returned from the previous block
        // console.log(data);
        // console.log(data.data);
        // console.log(data.data.current_condition); 
        // console.log(data.data.current_condition[0]);
        // we can call data.data.current_condition to get the data js object and then the curent_condition array, the element at[0],
        // this contains various weather data which the api returned 
        var weatherData = data.data.current_condition[0];
        // now we can call this function to set the text with various values from the current_condition[0] object
        setWeather(city, weatherData.temp_F, weatherData.observation_time, weatherData.weatherDesc[0].value);
        // note that weatherDesc is an array so we get the element at [0] which is a js object called value which contains a description
    })
    .catch(error => {
        // this catches any error, for example the api may return a 400 level status if you enter some garbage text
        setWeatherError();
    });
}

function setWeather(city,temp,time, description) {
    // here we get the paragraph with id weather and set the text content to the results of the query
    var w = document.getElementById("weather");
    w.textContent = `In ${city}, the weather is ${description} with a temperature of ${temp} degrees F.`;
}

function setWeatherError() {
    // set the text to an error message
    var w = document.getElementById("weather")
    w.textContent = 'enter valid city';
}

/* 
    for hotel + landmarks 
*/
var hotelsList = document.getElementById('hotel-info');
var attractionsList = document.getElementById('attractions-info');

function getHotels(city) {
    // for this one we must declare headers
    fetch(`https://hotels4.p.rapidapi.com/locations/search?query=${city}&locale=en_US`, {
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "hotels4.p.rapidapi.com",
		"x-rapidapi-key": "9b5960201fmsh3b87e1ff529e13ap1b03e7jsn5fa09936d25a"
	}
    })
    .then(response => {
        if(response.status == 200){
            //console.log('hotel api success');
        }
        //console.log(response);
        return response.json();
    })
    .then(t => {
        //console.log(t);
        //console.log(t.suggestions);
        //console.log(t.suggestions[1]);
        //console.log(t.suggestions[1].entities);
        setHotels(t.suggestions[1].entities,city);
        setattractions(t.suggestions[2].entities,city);
    })
    .catch(err => {
        console.error(err);
    });
}

function setHotels(hotels,city) {
    // here we pass in suggestions[1] which is an array
    hotelsList.innerHTML = `Some popular hotels in ${city}: `;
    // forEach is cleaner version of for(i to array.length),we can pass in 3 values, element,index,array, would be good to also see map(),filter() as well
    hotels.forEach(element => {
        hotelsList.innerHTML += `${element.name}, `;
    });
}

//same process as setHotels
function setattractions(attractions,city) {
    attractionsList.innerHTML = `Some popular landmarks in ${city}: `;
    attractions.forEach(element => {
        attractionsList.innerHTML += `${element.name}, `;
    })
}

window.onload = () => {
    var path = window.location.pathname;
    var page = path.split("/").pop();
    console.log( page );
}