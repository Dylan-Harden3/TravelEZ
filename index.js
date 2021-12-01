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
    
    } catch (error) {

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

        for (var i = 0 ; i < hotels.length ; i++) {

            hotelsList.push(hotels[i].destinationId);

        }
    
        // adding landmarks to return list
        var landmarks = data.suggestions[2].entities;
        var landmarksList = [];
        for (var i = 0 ; i < landmarks.length ; i++) {

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

        for (var i = 0; i < hotelsList.length; i++) {

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
                    "x-rapidapi-key": "9f65bda9f0mshb1bda8f9b7b151bp1d2291jsn83a7a7023b3d"
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
        for (var i = 0; i < ((dataLocation.data.body.searchResults.results.length > 25) ? 25 : dataLocation.data.body.searchResults.results.length); i++) {

            let name = dataLocation.data.body.searchResults.results[i].name;
            let rating = dataLocation.data.body.searchResults.results[i].starRating;
            let image = dataLocation.data.body.searchResults.results[i].optimizedThumbUrls.srpDesktop;
    
            // check for non-existent address
            let address = dataLocation.data.body.searchResults.results[i].address.streetAddress

            if (address == undefined) {

                address = "No address information available.";

            }
    
            // check for non-existent pricing
            let price;

            try {

                price = dataLocation.data.body.searchResults.results[i].ratePlan.price.current;

            } catch (err) {

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
                        "x-rapidapi-key": "9f65bda9f0mshb1bda8f9b7b151bp1d2291jsn83a7a7023b3d"
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

// object to store our vacation recommendations
let vacations = {
    type : {
        Coastal : {
            Sightseeing : {
                Hot : {
                    Name : "Orlando",
                    images : [
                        "https://cdn.britannica.com/07/201607-050-0B5774CB/Orlando-Florida-aerial-cityscape-towards-Eola-Lake.jpg",
                        "https://a.cdn-hotels.com/gdcs/production9/d394/d2da586b-0f28-423e-b9e6-2cf51d57a459.jpg",
                        "https://media.timeout.com/images/105785479/750/562/image.jpg"
                    ],
                    airport : "orlando",
                    description : "Check out the Kennedy Space Center or discover new possibilities at Disney World"
                },
                Temperate : {
                    Name : "Washington DC",
                    images : [
                        "https://www.thoughtco.com/thmb/JGE_xQpUmHb6oan75GMw0D4ensc=/2119x1415/filters:fill(auto,1)/GettyImages-497322993-598b2ad403f4020010ae0a08.jpg",
                        "https://media.timeout.com/images/105242152/750/562/image.jpg",
                        "https://images.barrons.com/im-414236?width=1280&size=1"
                    ],
                    airport : "washington dc",
                    description : "Explore our nation's history by visiting the capitol, or meet the president at the Whitehouse"
                },
                   
                Cold : {
                    Name : "New York",
                    images : [
                        "https://blog-www.pods.com/wp-content/uploads/2019/04/MG_1_1_New_York_City-1.jpg",
                        "https://static.politico.com/dims4/default/af81090/2147483647/resize/1160x%3E/quality/90/?url=https%3A%2F%2Fstatic.politico.com%2F36%2F98%2F5ceb5cf3473c91620bb5bea1254d%2Flede1-200331-blesener-politico-009.jpg",
                        "https://images.musement.com/cover/0002/49/thumb_148242_cover_header.jpeg?w=1200&h=630&q=95&fit=crop"
                    ],
                    airport : "new york",
                    description : "Say hello to lady liberty, expand your knowledge at the Modern Museum of Art, or go for a run in Central Park"
                }
            },
            OutdoorAdventure : {
                Hot : {
                    Name : "Key West",
                    images : [
                        "https://keywest.com/img/home-photo-4.jpg",
                        "https://upload.wikimedia.org/wikipedia/commons/4/40/Key_west_2001.JPG",
                        "https://www.visittheusa.com/sites/default/files/styles/hero_l/public/images/hero_media_image/2016-10/HERO%201_shutterstock_153029399_Web72DPI.jpg?itok=6moNnSno"
                    ],
                    airport : "miami",
                    description : "Enjoy the beach and explore all the ocean has to offer, while you're there visit the Southernmost Point of the United States"
                },
                Temperate : {
                    Name : "Cape Hatteras",
                    images : [
                        "https://upload.wikimedia.org/wikipedia/commons/1/1c/Cape_Hatteras_lighthouse_North_Carolina_%28improved%29.jpg",
                        "https://cdn.shopify.com/s/files/1/2062/5873/files/worldclasswaves2.jpg?10927803612752716525",
                        "https://islandfreepress.org/wp-content/uploads/2019/06/The-Story-of-Erosion-at-the-Cape-Hatteras-Lighthouse-700x465.jpg"
                    ],
                    airport : "greenville",
                    description : "Checkout scenic views at the Cape Hatteras Lighthouse or go fishing at Cape Point Way"
                },
                Cold : {
                    Name : "Olympic National Park",
                    images : [
                        "https://selectregistry.com/wp-content/uploads/2021/03/shutterstock_142490023-1000x650.jpg",
                        "https://www.themandagies.com/wp-content/uploads/2020/02/rialto-beach-hole-in-the-wall-hike-olympic-national-park-washington-pnw-the-mandagies-57.jpg",
                        "https://cdn.britannica.com/96/75396-050-5D1D411B/Mountain-goats-mountains-Olympic-National-Park-Washington.jpg"
                    ],
                    airport : "seattle",
                    description : "Explore the great outdoors in northwest Washington, while you're there visit Hurricane Ridge"
                }
            },
            Leisure : {
                Hot : {
                    Name : "Miami",
                    images : [
                        "https://blog-www.pods.com/wp-content/uploads/2019/08/MG_6_1_Miami.jpg",
                        "https://i.natgeofe.com/n/4e57f727-4dfd-4f7d-9c27-9edd6f73cfd0/miami-travel_16x9.jpg",
                        "https://www.tripsavvy.com/thmb/dw1scZ-PkJacGr0hTCLL4nRSDi4=/2121x1413/filters:fill(auto,1)/south-beach-miami-from-south-pointe-park--florida--usa-1137673992-0dc4c290e2764b178a5ab5be28dbd2d7.jpg"
                    ],
                    airport : "miami",
                    description : "Go deep sea fishing or explore underwater reefs on a scuba trip"
                },
                Temperate : {
                    Name : "Los Angeles",
                    images : [
                        "https://www.oxy.edu/sites/default/files/page/banner-images/los-angeles_main_1440x800.jpg",
                        "https://media.architecturaldigest.com/photos/56a29165883e5aaf0648d83e/4:3/w_768/LA-package.jpg",
                        "https://www.californiaemploymentlawreport.com/wp-content/uploads/sites/747/2021/10/Los-Angeles2-scaled.jpeg"
                    ],
                    airport : "los angeles",
                    description : "Cool off at Santa Monica Pier or take a selfie with the Hollywood Sign"
                },
                Cold : {
                    Name : "Boston",
                    images : [
                        "https://static.onecms.io/wp-content/uploads/sites/28/2021/02/23/boston-massachusetts-BOSTONTG0221.jpg",
                        "https://www.nbss.edu/uploaded/_Blog_Content/2018/Boston_from_above_RobbieShade_Flickr_sm.jpg",
                        "https://www.history.com/.image/ar_4:3%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MTYyNDgzMzUzNjQ2Mjc3Nzgw/topic-boston-gettyimages-564358796-promo.jpg"
                    ],
                    airport : "boston",
                    description : "Check out the Museum of Fine Arts or catch a Red Soxs game in historic Fenway Park"
                }
            }
        },
        Continental : {
            Sightseeing : {
                Hot : {
                    Name : "New Orleans",
                    images : [
                        "https://loveincorporated.blob.core.windows.net/contentimages/fullsize/ede6167d-14f2-491c-b5f3-382f09d67133-neworleansmainstreetseanpavoneresized.jpg",
                        "https://media.cntraveller.com/photos/611beeb7d5b6f5a4a3def8f9/16:9/w_2580,c_limit/new-orleans-gettyimages-534573323.jpg",
                        "https://www.tripsavvy.com/thmb/RMbaES1vikHeg6l52MrK-PM78J4=/3868x2574/filters:fill(auto,1)/streetcar-in-new-orleans-699112771-592dcb643df78cbe7e6bd39a.jpg"
                    ],
                    airport : "new orleans",
                    description : "Learn something new at the National World War 2 Museum or shake things up on Bourbon Street"
                },
                Temperate : {
                    Name : "San Francisco",
                    images : [
                        "https://blog-www.pods.com/wp-content/uploads/2021/03/resized_FI_Getty_San-Francisco-CA-1.jpg",
                        "https://goop-img.com/wp-content/uploads/2021/06/Whats-New-Great-SF_Stocksy_txp015179d2JT6300_Medium_267243.jpg",
                        "https://s.hdnux.com/photos/01/22/22/74/21573426/3/rawImage.jpg"
                    ],
                    airport : "san francisco",
                    description : "Check out the Golden Gate Bridge or visit Alcatraz Island."
                },
                Cold : {
                    Name : "Denver",
                    images : [
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Denver_skyline.jpg/1200px-Denver_skyline.jpg",
                        "http://res.cloudinary.com/simpleview/image/upload/v1476753838/clients/denver/denver-skyline-trees-snowcapped-mountains_559ccf24-f0ae-5102-065b2b9af325bc4a.jpg",
                        "https://media.timeout.com/images/105124787/image.jpg"
                    ],
                    airport : "denver",
                    description : "Explore Denver's many museums or take a short ride to Breckenridge for some skiing."
                }
            },
            OutdoorAdventure : {
                Hot : {
                    Name : "Tusayan",
                    images : [
                        "https://www.mygrandcanyonpark.com/wp-content/uploads/2019/03/tusayan-overview_ordelheide_1600.jpg",
                        "https://grandcanyoncvb.org/wp-content/uploads/2021/06/Tusayan-Smoky-The-Bear.jpg",
                        "https://www.mygrandcanyonpark.com/wp-content/uploads/2019/03/tusayan-overview_ordelheide_700.jpg?width=730"
                    ],
                    airport : "flagstaff",
                    description : "Explore scenic world class hiking trails at the Grand Canyon."
                },
                Temperate : {
                    Name : "Keystone",
                    images : [
                        "https://upload.wikimedia.org/wikipedia/commons/2/2f/Keystone-winter.jpg",
                        "https://www.uncovercolorado.com/wp-content/uploads/2020/06/keystone-lake-colorado-summer.jpg",
                        "https://cdn.summitdaily.com/wp-content/uploads/sites/2/2021/02/2-ORR-MT-Close-1024x546.jpg"
                    ],
                    airport : "denver",
                    description : "Race down the slopes at Keystone Resort or hike through Loveland Pass."
                },
                Cold : {
                    Name : "Jackson Hole",
                    images : [
                        "https://upload.wikimedia.org/wikipedia/commons/d/d0/Barns_grand_tetons.jpg",
                        "https://thumbor.forbes.com/thumbor/fit-in/1200x0/filters%3Aformat%28jpg%29/https%3A%2F%2Fspecials-images.forbesimg.com%2Fimageserve%2F60c360e2db2172fdd6861833%2F0x0.jpg",
                        "https://media.cntraveler.com/photos/5ab132ea39877c0712affa62/16:9/w_2495,h_1403,c_limit/jackson-hole-Scenic-17.jpg"
                    ],
                    airport : "alpine",
                    description : "Explore the great outdoors or race down the slides at Snow King Mountain Resort."
                }
            },
            Leisure : {
                Hot : {
                    Name : "Las Vegas",
                    images : [
                        "https://g.foolcdn.com/editorial/images/627313/las-vegas-sign-at-dusk.jpg",
                        "https://assets.simpleviewcms.com/simpleview/image/upload/c_limit,h_1200,q_75,w_1200/v1/clients/lasvegas/strip3_e7dbc8d1-ebcc-494a-a785-ff59ddaa7ddb.jpg",
                        "https://s31606.pcdn.co/wp-content/uploads/2020/06/iStock-1144242421-e1591402294411.jpg"
                    ],
                    airport : "las vegas",
                    description : "Unwind at luxury resorts, theme hotels, and 24 hour casinos or explore Red Rock Canyon."
                },
                Temperate : {
                    Name : "Atlanta",
                    images : [
                        "https://a.cdn-hotels.com/gdcs/production114/d1629/63a8dbe5-e678-4fe4-957a-ad367913a3fa.jpg",
                        "https://cdn2.atlantamagazine.com/wp-content/uploads/sites/4/2019/11/1119_AnswersAtlanta_AndreaFremiotti_oneuseonly.jpg",
                        "https://www.exploregeorgia.org/sites/default/files/2020-11/piedmont-park-atlanta-credit-benjamingalland.jpg"
                    ],
                    airport : "atlanta",
                    description : "Check out the Atlanta Zoo or the Coca-Cola Museum."
                },
                Cold : {
                    Name : "Seattle",
                    images : [
                        "https://media.cntraveler.com/photos/60480c67ff9cba52f2a91899/16:9/w_2991,h_1682,c_limit/01-velo-header-seattle-needle.jpg",
                        "https://img.static-af.com/images/meta/IDname/CITY-SEA-1?aspect_ratio=2:1&max_width=1920",
                        "https://cache.marriott.com/marriottassets/marriott/SEAWI/seawi-hotel-1733-hor-wide.jpg?interpolation=progressive-bilinear&downsize=1440px:*"
                    ],
                    airport : "seattle",
                    description : "Take in immaculate views from the Space Needle or be a part of the 12th man at a Seahawks game."
                }
            }
        },
        Exotic : {
            Sightseeing : {
                Hot : {
                    Name : "Honolulu",
                    images : [
                        "https://www.visittheusa.com/sites/default/files/styles/16_9_1280x720/public/2017-02/HERO%207_Honolulu_Waikiki_500PX_WEB72DPI.jpg?itok=uEUn_N7c",
                        "https://www.visittheusa.com/sites/default/files/styles/hero_l/public/images/hero_media_image/2017-02/HERO%205_Honolulu_Stairway-to-heaven_500PX_WEB72DPI.jpg?itok=j4YwZlfc",
                        "https://dlslab.com/wp-content/uploads/2020/09/honolulu-area-header-5.jpg"
                    ],
                    airport : "honolulu",
                    description : "Bathe in the sun at Waikiki Beach or explore many exhibits in Pearl Harbor."
                },
                Temperate : {
                    Name : "Carlsbad Caverns",
                    images : [
                        "https://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F28%2F2020%2F03%2F20%2Fcarlsbad-cavern-green-CBAD0320.jpg",
                        "https://www.nps.gov/articles/000/images/Mark-Minton-descending-rope-from-Mabel_s-Room-to-Mystery-Room-Yvonne-Droms.JPG?maxwidth=1200&maxheight=1200&autorotate=false",
                        "https://d21yqjvcoayho7.cloudfront.net/wp-content/uploads/2015/03/salughter.jpeg"
                    ],
                    airport : "el paso",
                    description : "Come see thousands of years of developing rock formations in the famous Carlsbad Caverns"
                },
                Cold : {
                    Name : "Juneau",
                    images : [
                        "https://www.visittheusa.com/sites/default/files/styles/hero_l/public/images/hero_media_image/2017-04/eefb8a268f18f7ae87899d4ad03f1fd1.jpeg?itok=S-8d5SAG",
                        "https://www.valisemag.com/wp-content/uploads/2021/02/Juneau-Facts-Hero.jpg",
                        "https://chstm2y9cx63tv84u2p8shc3-wpengine.netdna-ssl.com/wp-content/uploads/2021/02/juneau-houses-from-above.jpg"
                    ],
                    airport : "juneau",
                    description : "Visit the Alaska State museum, the Alaskan Brewery and Bottling Company, or admire the beautiful scenery"
                }
            },
            OutdoorAdventure : {
                Hot : {
                    Name : "Maui",
                    images : [
                        "https://www.gohawaii.com/sites/default/files/styles/wide_carousel_large/public/content-carousel-images/10105_mauiregionslp_VideoThumbnail.jpg?itok=vzKj-jK9",
                        "https://imagesvc.meredithcorp.io/v3/mm/image?q=85&c=sc&poi=face&w=1800&h=900&url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F28%2F2021%2F02%2F23%2Fmaui-hawaii-MAUITG0221.jpg",
                        "https://wpcdn.us-east-1.vip.tn-cloud.net/www.hawaiimagazine.com/content/uploads/2021/02/gettyimages-967082682-1024x680.jpg"
                    ],
                    airport : "maui",
                    description : "Go whale watching, snorkeling, take an ATV adventure, and enjoy the culture of the island"
                },
                Temperate : {
                    Name : "Sequoia National Park",
                    images : [
                        "https://i2.wp.com/morethanjustparks.com/wp-content/uploads/2021/06/sequoia-2.jpg?fit=1800%2C1201&ssl=1",
                        "https://drupal8-prod.visitcalifornia.com/sites/drupal8-prod.visitcalifornia.com/files/styles/fluid_1200/public/vc_ca101_nationalparks_sequoiakingsnationalparks_rf_673066812_1280x640.jpg?itok=EVBZ0WOL",
                        "http://cdn.cnn.com/cnnnext/dam/assets/180309132748-04-sequoia-park.jpg"
                    ],
                    airport : "fresno",
                    description : "Stand in awe at the largest trees in the world and observe the beautiful wildlife in this stunning national park"
                },
                Cold : {
                    Name : "Acadia National Park",
                    images : [
                        "https://media.cntraveler.com/photos/5f15986ca107fd1a0223ddde/16:9/w_3599,h_2024,c_limit/MaineAcadiaNationalPark-2020-GettyImages-1065259808.jpg",
                        "https://images2.minutemediacdn.com/image/upload/c_crop,h_1351,w_2400,x_0,y_133/v1625669870/shape/mentalfloss/69386-gettyimages-666640904.jpg?itok=qAhFDehZ",
                        "https://www.citrusmilo.com/acadia/joebraun_jordancliffs15.jpg"
                    ],
                    airport : "augusta",
                    description : "Bike, hike, stargaze, and enjoy nature in this beautiful national park"
                }
            },
            Leisure : {
                Hot : {
                    Name : "Nassau",
                    images : [
                        "https://jetexcdn.sfo2.cdn.digitaloceanspaces.com/jetex.com/wp-content/uploads/2019/12/nassau-bahamas-scaled.jpg",
                        "https://www.blackpast.org/wp-content/uploads/prodimages/files/Hilton_resort_and_waterfront_Nassau_Bahamas_2020.jpg",
                        "https://www.thepinnaclelist.com/wp-content/uploads/2018/03/02-Nassau-Bahamas-Popular-Second-Home-Locations-for-Professional-Gamblers.jpg"
                    ],
                    airport : "nassau",
                    description : "Try your luck at the casinos, chill on the beach, or enjoy the Atlantis Resort"
                },
                Temperate : {
                    Name : "Florida Keys",
                    images : [
                        "https://a.cdn-hotels.com/gdcs/production34/d728/f29dc048-f96e-4047-a984-dbd32f30474e.jpg",
                        "http://prod-upp-image-read.ft.com/37c9ec1a-7c36-11e9-81d2-f785092ab560",
                        "https://www.bhpalmbeach.com/wp-content/uploads/2019/08/florida-keys-cocaine.jpg"
                    ],
                    airport : "miami",
                    description : "Relax on the beach and enjoy fresh seafood cuisine"
                },
                Cold : {
                    Name : "Anchorage",
                    images : [
                        "https://upload.wikimedia.org/wikipedia/commons/4/4a/Anchorage_on_an_April_evening.jpg",
                        "https://lp-cms-production.imgix.net/2021-02/shutterstockRF_579463462.jpg?auto=compress&fit=crop&fm=auto&sharp=10&vib=20&w=1200&h=800",
                        "https://livability.com/wp-content/uploads/2020/04/AnchorageAK-NorthernLightsViewing_0.jpg"
                    ],
                    airport : "anchorage",
                    description : "Enjoy an afternoon at the Anchorage golf course, shop for native art, or relax at a spa"
                }
            }
        }
    }
};

// return quiz results
app.get('/getresults/:search', async (req,res) => {

    try {

        let args = req.params.search.split(',');
        let results = [];

        if (args[1] == 'Outdoor Adventure') {

            results = vacations.type[args[0]]['OutdoorAdventure'][args[2]];

        } else {

            results = vacations.type[args[0]][args[1]][args[2]];

        }

        res.json(results);

    } catch(e) {

        res.send('error');

    }

});

// start server
app.listen(process.env.PORT || 3000, () => {

    console.log('listening 3000');

});