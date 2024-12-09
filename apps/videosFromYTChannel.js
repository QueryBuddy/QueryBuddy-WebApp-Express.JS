import request from 'request';

function getForecast(req, res) {
  var id = req.query.id
  let channelURL = encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`)
  
  request.post(
    { url: `https://api.rss2json.com/v1/api.json?rss_url=${channelURL}` }, 
    function(err, response, body) {
      body = JSON.parse(body)
      res.json(body)
    }
  )
}

export default getForecast