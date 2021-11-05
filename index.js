
import express, { response } from 'express';
import fetch from 'node-fetch';

var app = express();

app.use(express.static('app'))

// get weather data
app.get('/getweather/:search', async (req,res) => {
    var search = `https://api.worldweatheronline.com/premium/v1/weather.ashx?q=${req.params.search}&key=768a046de2124a9892f160500212610&date=today&format=json&fx=no&mca=no`;
    const response = await fetch(search);
    const data = await response.json(); 
    var returnstring = `the weather is ${data.data.current_condition[0].weatherDesc[0].value} with a temperature of ${data.data.current_condition[0].temp_F} degrees F.`;
    res.send(returnstring);
});

// get time data
app.get('/gettime/:search', async (req,res) => {
    var search = `https://api.worldweatheronline.com/premium/v1/tz.ashx?key=768a046de2124a9892f160500212610&q=${req.params.search}&format=json`;
    const response = await fetch(search);
    const data = await response.json();
    var dateTime = data.data.time_zone[0].localtime;
    var time = dateTime.split(' ')[1];
    var returnstring = `is ${time}`;
    res.send(returnstring);
});

// get hotel and landmark data
app.get('/gethotels/:search', async(req,res) => {
    // JSON object to hold landmarks and hotels to return
    var combinedJSON = {
        "hotels": [], 
        /* hotel object:
         *  "name": <name>,
         *  "images: [<url>, ...],
         *  "stars": <star rating>,
         *  "price": <price>,
         *  "tagline": <tagline>,
         *  "freebies": <freebies>
         */
        "landmarks": [],
        /* landmark object:
         *  "name": <name>,
         *  "image": <image url>
         */
    };

    // returns hotel and landmark information given a city, start date, end date
    const response = await fetch(`https://hotels4.p.rapidapi.com/locations/search?query=${req.params.search}&locale=en_US`, {
	    "method": "GET",
	    "headers": {
		    "x-rapidapi-host": "hotels4.p.rapidapi.com",
		    "x-rapidapi-key": "9f65bda9f0mshb1bda8f9b7b151bp1d2291jsn83a7a7023b3d"
	    }
    });
    const data = await response.json();

    // adding hotels to return list
    var hotels = data.suggestions[1].entities;
    var hotelsList = [];
    for(var i = 0 ; i < hotels.length ; i++){
        hotelsList.push(hotels[i].destinationId);
    }

    // adding landmarks to return list
    var landmarks = data.suggestions[2].entities;
    var landmarksList = [];
    for(var i = 0 ; i < landmarks.length ; i++){
        landmarksList.push(landmarks[i].name);
    }

    // landmark images
    var landmarksImg = [];
    for (var i = 0; i < landmarksList.length; i++) {
        const response = await fetch(`https://bing-image-search1.p.rapidapi.com/images/search?q=${landmarksList[i]}&count=1`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "bing-image-search1.p.rapidapi.com",
                "x-rapidapi-key": "9f65bda9f0mshb1bda8f9b7b151bp1d2291jsn83a7a7023b3d"
            }
        });
        const data = await response.json();
        landmarksImg.push(data.value[0].thumbnailUrl);
    }

    // getting hotel information
    var stars = []
    var price = []
    var tagline = []
    var freebies = []
    var name = []
    var hotelsImg = [];
    for(var i = 0; i < hotelsList.length; i++) {
        const response = await fetch(`https://hotels4.p.rapidapi.com/properties/get-details?id=${hotelsList[i]}&locale=en_US`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "hotels4.p.rapidapi.com",
                "x-rapidapi-key": "9f65bda9f0mshb1bda8f9b7b151bp1d2291jsn83a7a7023b3d"
            }
        });
        var jres = await response.json()
        // console.log(jres)

        name.push(jres.data.body.propertyDescription.name)
        stars.push(jres.data.body.propertyDescription.starRatingTitle)
        price.push(jres.data.body.propertyDescription.featuredPrice.currentPrice.formatted)
        tagline.push(jres.data.body.propertyDescription.tagline[0])
        freebies.push(jres.data.body.propertyDescription.freebies[0])

        // getting img and pushing to list
        const responseImg = await fetch(`https://hotels4.p.rapidapi.com/properties/get-hotel-photos?id=${jres.data.body.pdpHeader.hotelId}`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "hotels4.p.rapidapi.com",
                "x-rapidapi-key": "9f65bda9f0mshb1bda8f9b7b151bp1d2291jsn83a7a7023b3d"
            }
        });
        const data = await responseImg.json();
        hotelsImg.push([]);  // want array for each set of image url's
        for (var j = 0; j < 5; ++j) {  // ERROR CHECKING
            hotelsImg[i].push(data.hotelImages[j].baseUrl.replace("{size}", "z"));
        }
    }
    
    // adding hotel information to final return obj
    // hotels
    for (var i = 0; i < hotelsList.length; ++i) {
        combinedJSON.hotels.push({
            "name": name[i],
            "images": hotelsImg[i],
            "stars": stars[i],
            "price": price[i],
            "tagline": tagline[i],
            "freebies": freebies[i]
        });
    }
    // landmarks
    for (var i = 0; i < landmarksList.length; ++i) {
        combinedJSON.landmarks.push({
            "name": landmarksList[i],
            "image": landmarksImg[i]
        });
    }

    // sending list as JSON 
    // console.log(combinedJSON);
    res.json(combinedJSON);
});

// request hotels for hotel search
app.get('/searchhotels/:search', async (req,res) => {
    // JSON object to hold hotels to return
    var combinedJSON = {
        "hotels": [], 
        /* hotel object:
         *  "name": <name>,
         *  "stars": <star rating>,
         *  "address": <address>,
         *  "price": <price>,
         *  "images: [<url>, ...]
         */
    };

    var args = req.params.search.split(',')  // splitting input into [city, start date, end date]

    // find location id
    const responseCity = await fetch(`https://hotels4.p.rapidapi.com/locations/search?query=${args[0]}&locale=en_US`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "hotels4.p.rapidapi.com",
            "x-rapidapi-key": "9f65bda9f0mshb1bda8f9b7b151bp1d2291jsn83a7a7023b3d"
        }
    });
    const dataCity = await responseCity.json();
    var location = dataCity.suggestions[0].entities[0].destinationId;

    // request data about hotel based on id
    const responseLocation = await fetch(`https://hotels4.p.rapidapi.com/properties/list?adults1=1&destinationId=${location}&pageNumber=1&pageSize=25&checkIn=${args[1]}&checkOut=${args[2]}&adults1=1&sortOrder=STAR_RATING_HIGHEST_FIRST`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "hotels4.p.rapidapi.com",
            "x-rapidapi-key": "9f65bda9f0mshb1bda8f9b7b151bp1d2291jsn83a7a7023b3d"
        }
    });
    const dataLocation = await responseLocation.json()
   
    // filling array with info about 25 hotels from city requested
    for(var i = 0; i < ((dataLocation.data.body.searchResults.results.length > 25) ? 25 : dataLocation.data.body.searchResults.results.length); i++){
    // for (var i = 0; i < 25; ++i){
        let name = dataLocation.data.body.searchResults.results[i].name;
        let rating = dataLocation.data.body.searchResults.results[i].starRating;
        let image = dataLocation.data.body.searchResults.results[i].optimizedThumbUrls.srpDesktop;

        // check for non-existent address
        let address = dataLocation.data.body.searchResults.results[i].address.streetAddress
        if(address == undefined){
            address = "No address information available.";
        }
 
        // check for non-existent pricing
        let price;
        try{
            price = dataLocation.data.body.searchResults.results[i].ratePlan.price.current;
        }
        catch(err){
            price = "No pricing information available.";
        }
 
        // adding data to json response
        combinedJSON.hotels.push({
            "name": name,
            "rating": rating,
            "address": address,
            "price": price,
            "image": image
        });
        console.log("pushed: ", i);
    }
 
    // console.log(combinedJSON);
    res.json(combinedJSON);
});

app.listen(process.env.port || 3000, () => {
    console.log('listening 3000')
});

// get flights for from location and to location on specified date
/* format for request:
 * from,to,date(mm-dd-yyyy)
 */
app.get('/getflights/:search', async(req,res) => {
    // JSON object to hold flights to return
    var combinedJSON = {
        "fromLoc": "",
        "toLoc": "",
        "date": "",
        "flights": [], 
        /* flight object:
         *  "airline": <airline>,
         *  "price": <price>,
         *  "numSeats": <number of seats>,
         *  "duration": <duration of flight (includes layovers)>,
         *  "website": <website url>,
         *  "image": <image url>
         */
    };

    let inputSplit = req.params.search.split(',');
    let date = reorderDate(inputSplit[2]);  // date to yyyy-mm-dd format
    
    // "from" location
    let responseFromLoc = await (await fetch(`https://priceline-com-provider.p.rapidapi.com/v1/flights/locations?name=${inputSplit[0]}`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "priceline-com-provider.p.rapidapi.com",
            "x-rapidapi-key": "9f65bda9f0mshb1bda8f9b7b151bp1d2291jsn83a7a7023b3d"
        }
    })).json();
    let fromLoc = responseFromLoc[0].id;

    // "to" location
    let responseToLoc = await (await fetch(`https://priceline-com-provider.p.rapidapi.com/v1/flights/locations?name=${inputSplit[1]}`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "priceline-com-provider.p.rapidapi.com",
            "x-rapidapi-key": "9f65bda9f0mshb1bda8f9b7b151bp1d2291jsn83a7a7023b3d"
        }
    })).json();
    let toLoc = responseToLoc[0].id;

    // get flight data
    let responseFlight = await (await fetch(`https://priceline-com-provider.p.rapidapi.com/v1/flights/search?sort_order=PRICE&location_departure=${fromLoc}&date_departure=${date}&class_type=ECO&location_arrival=${toLoc}&itinerary_type=ONE_WAY&price_max=20000&date_departure_return=${date}&duration_max=2051&number_of_stops=1&price_min=100&number_of_passengers=1`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "priceline-com-provider.p.rapidapi.com",
            "x-rapidapi-key": "9f65bda9f0mshb1bda8f9b7b151bp1d2291jsn83a7a7023b3d"
        }
    })).json();

    // getting airline info
    let airlineInfo = {
        /*
         *  "code": {
         *      "name": <name>,
         *      "website": <websiteUrl>,
         *      "image": <imageUrl>
         *  }
         */
    };
    let airlines = responseFlight.airline;
    for (let i = 0; i < airlines.length; ++i) {
        // getting image for airline logo
        const airlineImg = await(await fetch(`https://bing-image-search1.p.rapidapi.com/images/search?q=${airlines[i].name} logo&count=1`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "bing-image-search1.p.rapidapi.com",
                "x-rapidapi-key": "9f65bda9f0mshb1bda8f9b7b151bp1d2291jsn83a7a7023b3d"
            }
        })).json();
        airlineInfo[(airlines[i].code)] = {
            "name": airlines[i].name,
            "website": airlines[i].websiteUrl,
            "image": airlineImg.value[0].thumbnailUrl
        }
    }

    // formating flight data to return 
    for (let i = 0; i < 20; ++i) {
        let airlineCode = responseFlight.pricedItinerary[i].pricingInfo.ticketingAirline;
        combinedJSON.flights.push({
            "airline": airlineCode,
            "price": responseFlight.pricedItinerary[i].pricingInfo.totalFare,
            "numSeats": responseFlight.pricedItinerary[i].numSeats,
            "duration": responseFlight.pricedItinerary[i].totalTripDurationInHours,
            "name": airlineInfo[airlineCode].name,
            "website": airlineInfo[airlineCode].website,
            "image": airlineInfo[airlineCode].image
        });
    }
    combinedJSON.fromLoc = fromLoc;
    combinedJSON.toLoc = toLoc;
    combinedJSON.date = date;

    res.json(combinedJSON);  // temp until good to go
});

// reorders a date from {mm-dd-yyyy} to {yyyy-mm-dd}
function reorderDate(date) {
    let splitDate = date.split("-");
    return (`${splitDate[2]}-${splitDate[0]}-${splitDate[1]}`);
}