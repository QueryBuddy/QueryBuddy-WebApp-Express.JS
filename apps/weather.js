import fetch from 'node-fetch';

var getCountry = require('./country.js')

var unitsObj = {
  C: 'Metric', 
  F: 'Imperial', 
}

export default async function(req, res) {
  var apiKey = process.env['OPENWEATHER_API_KEY'];
  
  var zipcode = req.query.zip
  if (zipcode.startsWith('"')) zipcode = zipcode.slice(1)
  if (zipcode.endsWith('"')) zipcode = zipcode.slice(0, -1)

  var country = getCountry(req)
  var unit = 'C'
  if (country === 'US') unit = 'F'

  var unit = unitsObj[unit]

  var url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode}&units=${unit}&appid=${apiKey}`

  try {
    const response = await fetch(url);
    const body = await response.json();
    res.send(body)
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).send('Error fetching weather data');
  }
}