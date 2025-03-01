import fs from 'fs';
import fetch from 'node-fetch';
import jsdom from 'jsdom';

async function getContent(req, res) {
  var q = 'How do you work?'
  if (req.query.q) {
    q = req.query.q
  }

  var url = `https://www.google.com/search?q=${q}`
  console.log(url)

  try {
    const response = await fetch(url);
    const body = await response.text();
    
    var bDom = new jsdom.JSDOM(body);
    
    var match = bDom.window.document.querySelectorAll('.AaVjTc > tbody > tr > td.NKTSme')
    if (match.length > 0) match = match.length
    
    res.json({pages: match})
  } catch (error) {
    console.error('Error fetching data:', error);
    res.json({pages: 0});
  }
}

export default getContent