import fs from 'fs';
import request from 'request';
import jsdom from 'jsdom';

function getContent(req, res) {
  var url = req.query.url
  var scope2 = req.query.scope2 || 'body'
  
  if (!url) {
    res.send('ERROR: Unable to get contents of the requested page. Please check the URL and try again.')
    return
  }

  if (url.includes('*')) url = url.replace('*', '')
  request(
    { url: url }, 
    function(error, result, body) {
      if (!!body) {
        if (scope2 !== 'none') {
          var dom = new jsdom.JSDOM(body);
          body = dom.window.document.querySelector(scope2)
          if (body.outerHTML === '<body>\n</body>') {
            body = 'ERROR: Unable to get contents of the requested page. Please check the URL and try again.'
          }
          else {
            body = body.outerHTML
          }
          
          var matches = [
            /<style>.+<\/style>/, 
            /<style.+>.+<\/style>/, 
            /<script>.+<\/script>/, 
            /<script.+>.+<\/script>/, 
            /<svg.+>.+<\/svg>/, 
            /<link.+>/, 
          ]

          matches.forEach(function(m, i) {
            var mS = body.match(m)
            if (mS) {
              mS.forEach(function(em, i) {
                body = body.split(em).join('')
              })
            }
          })
        
          if (body.includes('<')) body = body.split('<').join('&lt;')
          if (body.includes('>')) body = body.split('>').join('&gt;')
        }
        else {
          body = 'ERROR'
        }

        res.send(`<pre>${body}</pre>`)
      }
    });
}

export default getContent