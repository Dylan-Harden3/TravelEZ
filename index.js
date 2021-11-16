import express from 'express';
import fetch from 'node-fetch';

var app = express();

app.use(express.static('app'))

// get weather from the weather api
app.get('/getweather/:search', async (req,res) => {
    // attempting to get flights, if error is thrown then catch and return {"error": <error thrown>}
    try {
        var search = `https://api.worldweatheronline.com/premium/v1/weather.ashx?q=${req.params.search}&key=768a046de2124a9892f160500212610&date=today&format=json&fx=no&mca=no`;
        const response = await fetch(search);
        const data = await response.json(); 
        var returnstring = `the weather is ${data.data.current_condition[0].weatherDesc[0].value} with a temperature of ${data.data.current_condition[0].temp_F} degrees F.`;
    } catch(error) {
        returnstring = "error: " + error;
    }

    res.send(returnstring);
});

// get time from the timezone api
app.get('/gettime/:search', async (req,res) => {
    // attempting to get flights, if error is thrown then catch and return {"error": <error thrown>}
    try {
        var search = `https://api.worldweatheronline.com/premium/v1/tz.ashx?key=768a046de2124a9892f160500212610&q=${req.params.search}&format=json`;
        const response = await fetch(search);
        const data = await response.json();
        var dateTime = data.data.time_zone[0].localtime;
        var time = dateTime.split(' ')[1];
        var returnstring = `is ${time}`;
    } catch(error) {
        returnString = "error:" + error;
    }

    res.send(returnstring);
});

// get the hotel and landmark information from hotel api
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

    try {
        // returns hotel and landmark information given a city, start date, end date
        const response = await fetch(`https://hotels4.p.rapidapi.com/locations/v2/search?query=${req.params.search}&locale=en_US`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "hotels4.p.rapidapi.com",
                "x-rapidapi-key": "a78338c436mshde13931799f7c20p10308bjsn5283b6acf0dc"
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
                    "x-rapidapi-key": "a78338c436mshde13931799f7c20p10308bjsn5283b6acf0dc"
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
                    "x-rapidapi-key": "a78338c436mshde13931799f7c20p10308bjsn5283b6acf0dc"
                }
            });
            var jres = await response.json()
            
            var curName = jres.data.body.propertyDescription.name
            name.push(curName)
            stars.push(jres.data.body.propertyDescription.starRatingTitle)
            price.push(jres.data.body.propertyDescription.featuredPrice.currentPrice.formatted)
            var tag = jres.data.body.propertyDescription.tagline[0];
            tag = tag.substring(3, tag.length - 5);
            tagline.push(tag)
            freebies.push(jres.data.body.propertyDescription.freebies[0])
    
            const hotelImgSearch = await fetch(`https://bing-image-search1.p.rapidapi.com/images/search?q=${curName} ${req.params.search}&count=1`, {
                "method": "GET",
                "headers": {
                    "x-rapidapi-host": "bing-image-search1.p.rapidapi.com",
                    "x-rapidapi-key": "a78338c436mshde13931799f7c20p10308bjsn5283b6acf0dc"
                }
            });
            const imgData = await hotelImgSearch.json();
            hotelsImg.push(imgData.value[0].thumbnailUrl);
        }
    
        // adding hotel information to final return obj
        // hotels
        for (var i = 0; i < hotelsList.length; ++i) {
            combinedJSON.hotels.push({
                "name": name[i],
                "image": hotelsImg[i],
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
        
    } catch(error) {
        combinedJSON = {"error": error};
    }

    res.json(combinedJSON);
});

// get extensive hotel information for a given city, check-in date, and check-out date
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

    // attempting to get flights, if error is thrown then catch and return {"error": <error thrown>}
    try {
        var args = req.params.search.split(',')  // splitting input into [city, start date, end date]

        // find location id
        const responseCity = await fetch(`https://hotels4.p.rapidapi.com/locations/v2/search?query=${args[0]}&locale=en_US`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "hotels4.p.rapidapi.com",
                "x-rapidapi-key": "a78338c436mshde13931799f7c20p10308bjsn5283b6acf0dc"
            }
        });
        const dataCity = await responseCity.json();
        var location = dataCity.suggestions[0].entities[0].destinationId;
    
        // request data about hotel based on id
        const responseLocation = await fetch(`https://hotels4.p.rapidapi.com/properties/list?adults1=1&destinationId=${location}&pageNumber=1&pageSize=25&checkIn=${args[1]}&checkOut=${args[2]}&adults1=1&sortOrder=STAR_RATING_HIGHEST_FIRST`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "hotels4.p.rapidapi.com",
                "x-rapidapi-key": "a78338c436mshde13931799f7c20p10308bjsn5283b6acf0dc"
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
            
        }
    } catch(error) {
        combinedJSON = {"error": error};
    }
 
    res.json(combinedJSON);
});

// get flights for from location and to location on specified date
/* format for request:
 * from,to,date(yyyy-mm-dd)
 */
app.get('/getflights/:search', async(req,res) => {
    // gets flight information for a date input and airports given
    async function getFlights(date, fromLoc, toLoc, airlineInfo) {
        // get flight data
        let responseFlight = await fetch(`https://priceline-com-provider.p.rapidapi.com/v1/flights/search?sort_order=PRICE&location_departure=${fromLoc}&date_departure=${date}&class_type=ECO&location_arrival=${toLoc}&itinerary_type=ONE_WAY&price_max=20000&date_departure_return=${date}&duration_max=2051&number_of_stops=1&price_min=100&number_of_passengers=1`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "priceline-com-provider.p.rapidapi.com",
                "x-rapidapi-key": "9b5960201fmsh3b87e1ff529e13ap1b03e7jsn5fa09936d25a"
            }
        });
        let responseFlightData = await responseFlight.json();

        let airlines = responseFlightData.airline;
        for (let i = 0; i < airlines.length; ++i) {
            // only add if not already added
            if (airlineInfo[(airlines[i].code)] == undefined) {
                // getting image for airline logo
                const airlineImg = await(await fetch(`https://bing-image-search1.p.rapidapi.com/images/search?q=${airlines[i].name} logo&count=1`, {
                    "method": "GET",
                    "headers": {
                        "x-rapidapi-host": "bing-image-search1.p.rapidapi.com",
                        "x-rapidapi-key": "9b5960201fmsh3b87e1ff529e13ap1b03e7jsn5fa09936d25a"
                    }
                })).json();

                let image;
                try {
                    image = airlineImg.value[0].thumbnailUrl;
                } catch(error) {
                    image = undefined;
                }

                airlineInfo[(airlines[i].code)] = {
                    "name": airlines[i].name,
                    "website": airlines[i].websiteUrl,
                    "image": image
                }
            }
        }

        let flightInfo = [
            /* flight object:
            *  "airline": <airline>,
            *  "price": <price>,
            *  "numSeats": <number of seats>,
            *  "duration": <duration of flight (includes layovers)>,
            *  "website": <website url>,
            *  "image": <image url>
            */
        ];
        // formating flight data to return 
        let count = (responseFlightData.pricedItinerary.length < 20) ? responseFlightData.pricedItinerary.length : 20;
        for (let i = 0; i < count; ++i) {
            let airlineCode, price, numSeats, duration, name, website, image;

            // airlineCode
            try {
                airlineCode = responseFlightData.pricedItinerary[i].pricingInfo.ticketingAirline;
            } catch(error) {
                airlineCode = undefined;
            }
            // price
            try {
                price = responseFlightData.pricedItinerary[i].pricingInfo.totalFare;
            } catch(error) {
                price = undefined;
            }
            // numSeats
            try {
                numSeats = responseFlightData.pricedItinerary[i].numSeats;
            } catch(error) {
                numSeats = undefined;
            }
            // duration
            try {
                duration = responseFlightData.pricedItinerary[i].totalTripDurationInHours;
            } catch(error) {
                duration = undefined;
            }
            // name
            try {
                name = airlineInfo[airlineCode].name;
            } catch(error) {
                name = undefined;
            }
            // website
            try {
                website = airlineInfo[airlineCode].website;
            } catch(error) {
                website = undefined;
            }
            // image
            try {
                image = airlineInfo[airlineCode].image;
            } catch(error) {
                image = undefined;
            }

            flightInfo.push({
                "airline": airlineCode,
                "price": price,
                "numSeats": numSeats,
                "duration": duration,
                "name": name,
                "website": website,
                "image": image
            });
        }

        return flightInfo;
    }

    // JSON object to hold flights to return
    var combinedJSON = {
        "fromLoc": "",
        "toLoc": "",
        "dateLeave": "",
        "flightsLeave": [], 
        /* flight object:
         *  "airline": <airline>,
         *  "price": <price>,
         *  "numSeats": <number of seats>,
         *  "duration": <duration of flight (includes layovers)>,
         *  "website": <website url>,
         *  "image": <image url>
         */
        "dateReturn": "",
        "flightsReturn": [], 
        /* flight object:
         *  "airline": <airline>,
         *  "price": <price>,
         *  "numSeats": <number of seats>,
         *  "duration": <duration of flight (includes layovers)>,
         *  "website": <website url>,
         *  "image": <image url>
         */
    };

    // attempting to get flights, if error is thrown then catch and return {"error": <error thrown>}
    try {
        let inputSplit = req.params.search.split(',');
        let dateLeave = inputSplit[2];  // date to yyyy-mm-dd format
        // length of input > 3 => two dates entered
        let dateReturn = (inputSplit.length > 3) ? inputSplit[3] : inputSplit[2];
        // type of flight 
        let roundTrip = (inputSplit.length > 3) ? true : false;
        
        // "from" location
        let responseFromLoc = await (await fetch(`https://priceline-com-provider.p.rapidapi.com/v1/flights/locations?name=${inputSplit[0]}`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "priceline-com-provider.p.rapidapi.com",
                "x-rapidapi-key": "9b5960201fmsh3b87e1ff529e13ap1b03e7jsn5fa09936d25a"
            }
        })).json();
        
        let fromLoc = responseFromLoc[0].id;

        // "to" location
        let responseToLoc = await (await fetch(`https://priceline-com-provider.p.rapidapi.com/v1/flights/locations?name=${inputSplit[1]}`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "priceline-com-provider.p.rapidapi.com",
                "x-rapidapi-key": "9b5960201fmsh3b87e1ff529e13ap1b03e7jsn5fa09936d25a"
            }
        })).json();
        
        let toLoc = responseToLoc[0].id;

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

        // flights
        combinedJSON.flightsLeave = await getFlights(dateLeave, fromLoc, toLoc, airlineInfo);
        combinedJSON.flightsReturn = roundTrip ? await getFlights(dateReturn, toLoc, fromLoc, airlineInfo) : undefined;

        // trip info
        combinedJSON.fromLoc = fromLoc;
        combinedJSON.toLoc = toLoc;
        combinedJSON.dateLeave = dateLeave;
        combinedJSON.dateReturn = roundTrip ? dateReturn : undefined;
    } catch(error) {
        combinedJSON = {"error": error};
    }

    res.json(combinedJSON);  // temp until good to go
});

let vacations = {
    type : {
        Coastal : {
            Sightseeing : {
                Hot : [
                    "Orlando"
                ],
                Temperate : [
                    "Washington DC"
                ],
                Cold : [
                    "New York City"
                ]
            },
            OutdoorAdventure : {
                Hot : [
                    "Key West"
                ],
                Temperate : [
                    "Cape Hatteras"
                ],
                Cold : [
                    "Olympic National Park"
                ]
            },
            Leisure : {
                Hot : [
                    "Miami"
                ],
                Temperate : [
                    "Los Angeles"
                ],
                Cold : [
                    "Boston"
                ]
            }
        },
        Continental : {
            Sightseeing : {
                Hot : [
                    "New Orleans"
                ],
                Temperate : [
                    "San Francisco"
                ],
                Cold : [
                    "Denver"
                ]
            },
            OutdoorAdventure : {
                Hot : [
                    "Tusayan"
                ],
                Temperate : [
                    "Keystone"
                ],
                Cold : [
                    "Jackson Hole"
                ]
            },
            Leisure : {
                Hot : [
                    "Las Vegas"
                ],
                Temperate : [
                    "Atlanta"
                ],
                Cold : [
                    "Seattle"
                ]
            }
        },
        Exotic : {
            Sightseeing : {
                Hot : [
                    "Honolulu"
                ],
                Temperate : [
                    "Carlsbad Caverns"
                ],
                Cold : [
                    "Juneau"
                ]
            },
            OutdoorAdventure : {
                Hot : [
                    "Maui"
                ],
                Temperate : [
                    "Sequoia National Park"
                ],
                Cold : [
                    "Acadia National Park"
                ]
            },
            Leisure : {
                Hot : [
                    "Nassau"
                ],
                Temperate : [
                    "Florida Keys"
                ],
                Cold : [
                    "Anchorage"
                ]
            }
        }
    }
};

app.get('/getresults/:search', async (req,res) => {
    try {
        let args = req.params.search.split(',');
        let results = [];
        if(args[1] == 'Outdoor Adventure'){
            results = vacations.type[args[0]]['OutdoorAdventure'][args[2]];
        }else {
            results = vacations.type[args[0]][args[1]][args[2]];
        }
        res.json(results);
    }catch(e) {
        res.send('error');
    }
});

app.listen(process.env.port || 3000, () => {
    console.log('listening 3000')
});