import fs from 'fs';
import request from 'request';
import jsdom from 'jsdom';

function getContent(req, res) {
  var base = 'https://www.wikipedia.org/search-redirect.php?family=Wikipedia&search='
  var url = ''
  if (req.query.query) {
    url = base + req.query.query
  }

  if (url.includes('*')) url = url.replace('*', '')
  request(
    { url: url }, 
    function(error, result, body) {
      if (!!body) {
        var dom = new jsdom.JSDOM(body);
        body = dom.window.document.querySelector('body').outerHTML
        var content = dom.window.document.querySelector('[class*="content-"]:not(html):not([class*="menu"])')
        if (content) body = content.innerHTML

        if (body.includes('<')) body = body.split('<').join('&lt')
        if (body.includes('>')) body = body.split('>').join('&gt')
      }
      else {
        body = 'ERROR'
      }
      res.send(body)
    }
  );
}

export default getContent