import fs from 'fs';
import request from 'request';
import jsdom from 'jsdom';

function getContent(req, res) {
  var url = req.query.q

  request(
    { url: url }, 
    function(error, result, body) {
      if (!body) {
        body = 'ERROR'
      }

      var bDom = new jsdom.JSDOM(body);

      var matches = []

      bDom.window.document.querySelectorAll('a[href]').forEach(function(a, i) {
        var href = a.href
        var text = a.textContent
        matches.push({link: href, text: text})
      })

      res.json(matches)
    }
  );
}

export default getContent