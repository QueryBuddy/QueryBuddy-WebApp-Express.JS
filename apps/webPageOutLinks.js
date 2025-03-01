import fetch from 'node-fetch';
import jsdom from 'jsdom';

async function getContent(req, res) {
  var url = req.query.url

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const body = await response.text();
    
    var dom = new jsdom.JSDOM(body);
    var links = dom.window.document.querySelectorAll('a');
    var outLinks = [];
    
    links.forEach(function(link) {
      if (link.href) outLinks.push(link.href);
    });
    
    res.json(outLinks);
  } catch (error) {
    console.error('Error fetching page links:', error);
    res.status(500).json({ error: 'Failed to fetch page links' });
  }
}

export default getContent