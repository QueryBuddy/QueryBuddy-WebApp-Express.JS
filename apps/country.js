import fetch from 'node-fetch';

var unitsObj = {
  C: 'Metric', 
  F: 'Imperial', 
}

export default async function(req, res) {
  var apiKey = process.env.OPENWEATHER_API_KEY;
  
  var lat = req.query.lat
  var lon = req.query.lon

  var url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`

  try {
    const response = await fetch(url);
    const body = await response.json();
    res.json(body[0])
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).send('Error fetching weather data');
  }
}