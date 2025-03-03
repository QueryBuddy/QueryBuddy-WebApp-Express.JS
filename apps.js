var appsData = {
  weather: async function(params) {
    var zip = params[0]

    var cResponse = await fetch('/getCountry')
    if (cResponse.ok) {
      var country = await response.text()
      var unit = 'C'
      if (country === 'United States of America') unit = 'F'
  
      var response = await fetch(`/getWeather?zip=${zip}&unit=${unit}`)
      if (response.ok) {
        var weather = await response.text()
        newMessage('app', weather, {isApp: true, appName: 'weather'})
      }
      else {
        newMessage('app', 'Unable to get weather.', {appName: 'weather'})
      }
    }
    else {
      newMessage('app', 'Unable to get country.', {appName: 'weather'})
    }
  },
  openLink: async function(params) {
    var links = params[0]
    links = JSON.parse(links)

    links.forEach(async function(link, i) {
      open(link)
      newMessage('app', `Opened "${link}".`, {appName: 'openLink'})
    })
  },
  createImage: async function(params) {
    var prompt = params[0]
    newRequest('create-image', prompt)
  }, 
  transcribeAudio: async function(params) {
    if (!fnames) {
      var params = new URLSearchParams(window.location.search)
      var names = params.get('name')
      if (!!names) {
        if (names.includes(',')) names = names.split(',')
        else names = [names]
      }
    }

    fnames.forEach(async function(n, i) {
      newRequest('transcribe-audio', n)
    })
  },
  liveImage: async function(params) {
    this.takeLiveImage()
  },
  takeLiveImage: async function(params) {
    var dialog = document.querySelector('.live-photo')

    var iframe = dialog.querySelector('iframe')
    iframe.src = iframe.getAttribute('data-src')
    iframe.removeAttribute('data-src')

    dialog.showModal()
  },
  sendLiveImage: async function(params) {
    var dialog = document.querySelector('.live-photo')
    dialog.close()

    var iframe = dialog.querySelector('iframe')
    iframe.setAttribute('data-src', iframe.src)
    iframe.src = ''


    var json = params[0]
    var lastMessage = document.querySelectorAll('.messages > .message.user')
    lastMessage = lastMessage[lastMessage.length-1]
    var lastTextSpan = lastMessage.querySelector('.text__span')
    var lastMessageContent = lastTextSpan.innerHTML

    fnames = json.name
    filelocation = json.filelocation

    handleFiles()

    type = 'live-image-send'
    sendMessage(lastMessageContent)
  }
}

// appsData.takeLiveImage()