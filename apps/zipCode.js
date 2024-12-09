import request from 'request';
import states from './states.json';

function getForecast(req, res) {
  var apiKey = process.env['ZIPCODE_API_KEY'];
  
  var city = req.query.city
  var state = req.query.state
  state = states[state]

  request.post(
    { url: `https://www.zipcodeapi.com/rest/${apiKey}/city-zips.json/${city}/${state}` }, 
    function(err, response, body) {
      body = JSON.parse(body)
      res.send(body)
    }
  )
}

export default getForecast