import request from 'request';

var unitsObj = {
  C: 'Metric', 
  F: 'Imperial', 
}

function getForecast(req, res) {
  var apiKey = process.env['OPENWEATHER_API_KEY'];
  
  var zipcode = req.query.zip
  if (zipcode.startsWith('"')) zipcode = zipcode.slice(1)
  if (zipcode.endsWith('"')) zipcode = zipcode.slice(0, -1)
  var unit = unitsObj[req.query.unit]

  request.post(
    { url: `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode}&units=${unit}&appid=${apiKey}` }, 
    function(err, response, body) {
      responseReceivedHandler(req, res, err, response, body)
    }
  )
}

function responseReceivedHandler(req, res, err, response, body) {
  var responseType = req.query.responseType
  
  body = JSON.parse(body)

  if (responseType === 'JSON') {
    res.send(body)
    return
  }
  
  var unit = req.query.unit
  var result = ''

  if (body.cod !== '404') {
    result += `<h3 style="margin-block: 0;">Weather for ${body.name}</h3>`

    var wEle = '<section class="weather">'
    
    body.weather.forEach(function(w, i) {
      let main = w.main
      main = `${main.split('')[0].toUpperCase()}${main.substring(1)}`
      let desc = w.description
      desc = desc.split(' ')
      if (desc.length > 1) {
        desc.forEach(function(d, i) {
          desc[i] = `${desc[i].split('')[0].toUpperCase()}${desc[i].substring(1)}`
        })
      }
      else {
        desc[0] = `${desc[0].split('')[0].toUpperCase()}${desc[0].substring(1)}`
      }
      desc = desc.join(' ')
      desc = String(desc).replace(',', ' ')

      let icon = w.icon
      let iconurl = `http://openweathermap.org/img/w/${icon}.png`;

      wEle += `<div class="w">
<img class="icon" src="${iconurl}" alt="${icon}">${main}: ${desc}
</div>`
    })

    wEle += '</section>'
    result += wEle

    let main = body.main

    var mainEle = `\n<section><strong>Temprature</strong>\n`
    var mainHTML = ''

    let mHeadItems = [
      'feels_like', 
      'humidity', 
      'temp', 
      'temp_max', 
      'temp_min', 
    ]
    mHeadItems.forEach(function(iName, i) {
      let item = main[iName]
      if (iName === 'humidity') item = `${item}%`
      else item = `${item} °${unit}`
      iName = iName.split('_')
      if (iName.length > 1) {
        iName.forEach(function(d, i2) {
          iName[i2] = `${iName[i2].split('')[0].toUpperCase()}${iName[i2].substring(1)}`
        })
      }
      else {
        iName[0] = `${iName[0].split('')[0].toUpperCase()}${iName[0].substring(1)}`
      }
      iName = iName.join(' ')
      iName = String(iName).replace(',', ' ')
      if (i !== 0) mainHTML += '\n'
      mainHTML += `<b>${iName}:</b> ${item}`
    })

    mainEle += mainHTML
    mainEle += '</section>'
    result += mainEle

    let wind = body.wind

    var windEle = `\n<section><strong>Wind</strong>\n`
    var windHTML = ''

    let windHeadItems = [
      'deg', 
      'speed', 
    ]
    windHeadItems.forEach(function(iName, i) {
      let item = wind[iName]
      if (iName === 'deg') item = `${item}°`
      iName = iName.split('_')
      if (iName.length > 1) {
        iName.forEach(function(d, i2) {
          iName[i2] = `${iName[i2].split('')[0].toUpperCase()}${iName[i2].substring(1)}`
        })
      }
      else {
        iName[0] = `${iName[0].split('')[0].toUpperCase()}${iName[0].substring(1)}`
      }
      iName = iName.join(' ')
      iName = String(iName).replace(',', ' ')
      if (i !== 0) windHTML += '\n'
      windHTML += `<b>${iName}:</b> ${item}`
    })

    windEle += windHTML
    windEle += '</section>'
    result += windEle

    let sys = body.sys

    var sEle = `\n<section><strong>Time</strong>\n`
    var sHTML = ''

    let sHeadItems = [
      'country', 
      'sunrise', 
      'sunset', 
    ]
    sHeadItems.forEach(function(iName, i) {
      let item = sys[iName]
      let item2 = ''
      if (iName !== 'country') {
        let d = new Date(item*1000)
        if (iName === 'sunrise') {
          item = `${d.getHours()}:${d.getMinutes()} AM`
        }
        if (iName === 'sunset') {
          item = `${d.getHours()-12}:${d.getMinutes()} PM`
          item2 = `${d.getHours()}:${d.getMinutes()}`
        }
      }
      iName = iName.split('_')
      if (iName.length > 1) {
        iName.forEach(function(d, i2) {
          iName[i2] = `${iName[i2].split('')[0].toUpperCase()}${iName[i2].substring(1)}`
        })
      }
      else {
        iName[0] = `${iName[0].split('')[0].toUpperCase()}${iName[0].substring(1)}`
      }
      iName = iName.join(' ')
      iName = String(iName).replace(',', ' ')
      if (iName === 'sunset') {
        iName += `-MIL`
        item = item2
      }
      if (i !== 0) sHTML += '\n'
      sHTML += `<b>${iName}:</b> ${item}`
    })

    sEle += sHTML
    sEle += '</section>'
    result += sEle

  }
  else {
    result = body.message
  }
  
  // if (result.includes('<')) {
  //   result = result.split('<').join('&lt;')
  // }
  // if (result.includes('>')) {
  //   result = result.split('>').join('&gt;')
  // }

  res.send(result)
}

export default getForecast