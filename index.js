
import express from 'express';
import fetch from 'node-fetch';

var app = express();

app.use(express.static('app'))

app.get('/getweather/:search', async (req,res) => {
    var search = `https://api.worldweatheronline.com/premium/v1/weather.ashx?q=${req.params.search}&key=768a046de2124a9892f160500212610&date=today&format=json&fx=no&mca=no`;
    const response = await fetch(search);
    const data = await response.json();
    res.json(data);
});

app.listen(3000, () => {
    console.log('listening 3000')
});
