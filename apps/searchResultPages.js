import fs from 'fs';
import request from 'request';
import jsdom from 'jsdom';

function getContent(req, res) {
  var q = 'How do you work?'
  if (req.query.q) {
    q = req.query.q
  }

  var url = `https://www.google.com/search?q=${q}`
  console.log(url)

  request(
    { url: url }, 
    function(error, result, body) {
      if (!body) {
        body = 'ERROR'
      }

      var bDom = new jsdom.JSDOM(body);
      
      var match = bDom.window.document.querySelectorAll('.AaVjTc > tbody > tr > td.NKTSme')
      if (match.length > 0) match = match.length
      
      res.json({pages: match})
    }
  );
}

export default getContent