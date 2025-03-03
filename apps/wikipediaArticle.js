import fetch from 'node-fetch';
import jsdom from 'jsdom';

async function getContent(q) {
  var url = `https://en.wikipedia.org/wiki/${q}`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const body = await response.text();
    
    var dom = new jsdom.JSDOM(body);
    var content = dom.window.document.querySelector('#mw-content-text');
    var paragraphs = content.querySelectorAll('p');
    var text = '';
    
    paragraphs.forEach(function(p) {
      text += p.textContent + '\n';
    });
    
    return text;
  } catch (error) {
    console.error('Error fetching Wikipedia article:', error);
    return 'ERROR: Failed to fetch Wikipedia article';
  }
}
export default getContent
