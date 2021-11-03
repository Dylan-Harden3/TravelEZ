
import express from 'express';
import fetch from 'node-fetch';

var app = express();

app.use(express.static('app'))

app.get('/getweather/:search', async (req,res) => {
    var search = `https://api.worldweatheronline.com/premium/v1/weather.ashx?q=${req.params.search}&key=768a046de2124a9892f160500212610&date=today&format=json&fx=no&mca=no`;
    const response = await fetch(search);
    const data = await response.json(); 
    var returnstring = `the weather is ${data.data.current_condition[0].weatherDesc[0].value} with a temperature of ${data.data.current_condition[0].temp_F} degrees F.`;
    res.send(returnstring);
});

app.get('/gettime/:search', async (req,res) => {
    var search = `https://api.worldweatheronline.com/premium/v1/tz.ashx?key=768a046de2124a9892f160500212610&q=${req.params.search}&format=json`;
    const response = await fetch(search);
    const data = await response.json();
    var dateTime = data.data.time_zone[0].localtime;
    var time = dateTime.split(' ')[1];
    var returnstring = `is ${time}`;
    res.send(returnstring);
});

app.get('/gethotels/:search', async(req,res) => {
    var returndata;
    const response = await fetch(`https://hotels4.p.rapidapi.com/locations/search?query=${req.params.search}&locale=en_US`, {
	    "method": "GET",
	    "headers": {
		    "x-rapidapi-host": "hotels4.p.rapidapi.com",
		    "x-rapidapi-key": "9f65bda9f0mshb1bda8f9b7b151bp1d2291jsn83a7a7023b3d"
	    }
    });
    const data = await response.json();

    returndata = returndata + 

    res.json(data);
})


app.listen(process.env.port || 3000, () => {
    console.log('listening 3000')
});


