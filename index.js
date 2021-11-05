
import express from 'express';
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
    var combined = [];  // list to hold all information about landmarks and hotels

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
    combined.push(landmarksList);

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
    combined.push(landmarksImg);

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
        console.log(jres)

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
        for (var j = 0; j < 5; ++j) {  // ERROR CHECKING
            hotelsImg.push(data.hotelImages[j].baseUrl.replace("{size}", "z"));
        }
    }
    console.log(hotelsImg);
    
    // adding hotel information to final return list
    combined.push(name)
    combined.push(stars)
    combined.push(price)
    combined.push(tagline)
    combined.push(freebies)
    combined.push(hotelsImg)

    // sending list as JSON 
    console.log(combined);
    res.json(combined);
});

app.listen(process.env.port || 3000, () => {
    console.log('listening 3000')
});