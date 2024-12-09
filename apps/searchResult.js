import fs from 'fs';
import request from 'request';
import jsdom from 'jsdom';

function getContent(req, res) {
  var params = []
  var urlPathname = 'url'
  var prop = 'href'
  var qKey = 'q'

  var q = 'How do you work?'
  if (req.query.q) {
    q = req.query.q
  }
  var searchType = req.query.type
  var page = parseInt(req.query.page)

  switch (searchType) {
    case 'image': 
      params.push('udm=2')
      urlPathname = 'imgres'
      prop = 'src'
      qKey = 'imgurl'
  }

  params = `&${params.join('&')}`

  var url = `https://www.google.com/search?q=${q}${params}`

  request(
    { url: url }, 
    function(error, result, body) {
      if (!body) {
        body = 'ERROR'
      }

      var matches = parseContent(body)

      if (matches) {
        res.json(matches)
      }
    }
  );

  function parseContent(body) {
    var bDom = new jsdom.JSDOM(body);

    var matches = []
    var items = bDom.window.document.querySelectorAll(`a[href*="/${urlPathname}?q="]`)

    items.forEach(function(e, i) {
      var hrefSrc = e[prop]
      hrefSrc = hrefSrc.slice(`/${urlPathname}`.length)

      var q = (new URLSearchParams(hrefSrc)).get(qKey)

      if (q) {
        var html = e.innerHTML
        var text = ''

        switch(searchType) {
          case 'image':
            text = e.textContent
            q = decodeURIComponent(q)
          default: 
            text = html.match(/<h3.+>.+<\/h3>/)
            if (text) {
              text = text[0].split('<h3 ')[1].split('>')
              text.shift()
              text = text.join('>').split('</h3>')[0].split('<div ')[1].split('>')
              text.shift()
              text = text.join('>').split('</div>')[0]
            }
        }

        var isGood = true
        matches.forEach(match => {
          if (q === match.link) isGood = false
        })

        if (
          (!q.includes('.google.com') && !q.startsWith('/search?q=')) && 
          (i !== 1 && isGood)
        ) {
          matches.push({link: q, text: text})
        }
      }
    })  

    if (page && bDom.window.document.querySelectorAll(`a[href*="/${urlPathname}?q="]`).length > 0) {
      var length = items.length
      var num = length*page

      request(
        { url: `${url}&start=${num}` }, 
        function(error, result, body) {
          if (!body) {
            body = 'ERROR'
          }

          var matches = parseContent(body)

          res.json(matches)
        }
      );
    return false
    }
    return matches
  }
}

export default getContent