
window.onload = () => {
    console.log(`location-selected ${localStorage.getItem('location-selected')}`);
    console.log(`hotel-selected ${localStorage.getItem('hotel-selected')}`);
    console.log(`flight-selected ${localStorage.getItem('flight-selected')}`);
    console.log(`search: ${localStorage.getItem('search')}`)
    search(localStorage.getItem('search'));
}

async function search(text)  {
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
    }
}

// weather request
async function getWeather(text) {
    const responseWeather = await fetch(`../../getweather/${text}`);
    const jsonWeather = await responseWeather.json();
    console.log(jsonWeather);
}

// time request
async function getTime(text) {
    const responseTime = await fetch(`../../gettime/${text}`);
    const jsonTime = await responseTime.json();
    console.log(jsonTime);
}

// hotel request
async function getHotels(text) {
    const responseHotels = await fetch(`../../gethotels/${text}`);
    const jsonHotels = await responseHotels.json();
    console.log(jsonHotels.suggestions);
}