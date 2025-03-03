import 'dotenv/config';
import fetch from 'node-fetch';

async function getContent(q, searchType) {
  var params = []
  var urlPathname = 'url'
  var prop = 'href'
  var qKey = 'q'

  switch (searchType) {
    case 'image': 
      params.push('udm=2')
      urlPathname = 'imgres'
      prop = 'src'
      qKey = 'imgurl'
  }

  params = `&${params.join('&')}`
  var url = `https://www.googleapis.com/customsearch/v1?key=${process.env.SEARCH_API_KEY}&cx=750a504f8a13f45f4&q=${q}${params}`

  try {
    const response = await fetch(url);
    var body = await response.text();
    
    if (!body) {
      throw new Error('Empty response received');
    }

    body = JSON.parse(body)

    var items = body.items

    return items
  } catch (error) {
    return 'ERROR: Failed to fetch search results'
  }
}

export default getContent