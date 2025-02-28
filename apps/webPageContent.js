import fs from 'fs';
import fetch from 'node-fetch';
import jsdom from 'jsdom';

async function getContent(req, res) {
  var url = req.query.url
  var scope2 = req.query.scope2 || 'body'
  
  if (!url) {
    res.send('ERROR: Unable to get contents of the requested page. Please check the URL and try again.')
    return
  }

  if (!url.includes('://')) url = `https://${url}`

  if (url.includes('*')) url = url.replace('*', '')

  var response = await fetch(url)
  var body = await response.text()


  var dom = new jsdom.JSDOM(body);

  if (scope2 !== 'none') {
    if (dom.window.document.querySelector(scope2).querySelectorAll('*').length < 1) {
      body = 'ERROR: Unable to get contents of the requested page. Please check the URL and try again.'
      res.send(body)
      return
    }
    
    body = dom.window.document.querySelector(scope2)
  }
  else {
    if (dom.window.document.querySelectorAll('*').length < 1) {
      body = 'ERROR: Unable to get contents of the requested page. Please check the URL and try again.'
      res.send(body)
      return
    }
    
    body = dom.window.document
  }


  
  var selectors = [
    'style',
    'script',
    'script',
    // 'svg.+',
    'link',
  ]

  selectors.forEach(s => {
    var matches = body.querySelectorAll(s)
    matches.forEach(m => {
      m.remove()
    })
  })

  body = body.innerHTML
  if (body.includes('<')) body = body.split('<').join('&lt;')
  if (body.includes('>')) body = body.split('>').join('&gt;')
    
  res.send(`<pre>${body}</pre>`)
}

export default getContent