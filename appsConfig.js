var appsStr = `Apps List: \n`

const defaults = {
  decription: {
    end: 'Please do not enclose the "inputs" in quotes.'
  }
}

const appsData = {
  weather: {
    description: {
      info: 'gets the weather for any zipcode',
    },
    args: [
      {
        name: 'place',
        description: 'a zipcode',
      }
    ],
  },
  webPageContent: {
    description: {
      info: 'gets the content of any web page',
      end: 'Please put all the links in to a list string that can be parsed using the JavaScript "JSON.parse()" method. If only one link: return ["{link}"] without quotes around the JSON array string.'
    },
    args: [
      {
        name: 'links',
        description: 'a "JSON.parse()"able list string of links, if only one: return ["{link}"]',
      }
    ],
  },
  wikipediaArticle: {
    hostOnly: true,
  }, 
  searchResult: {
    description: {
      info: 'gets the search results for any query',
      end: 'Please put all the queries in to a list string that can be parsed using the JavaScript "JSON.parse()" method. If only one query: return ["{query}"] without quotes around the JSON array string.'
    },
    args: [
      {
        name: 'links',
        description: 'a "JSON.parse()"able list string of links, if only one: return ["{link}"]',
      }
    ],
  }, 
  searchResultPages: {
    hostOnly: true,
  }, 
  videosFromYTChannel: {
    hostOnly: true,
  }, 
  videosFromYTPlaylist: {
    hostOnly: true,
  }, 
  openLink: {
    description: {
      info: 'opens a provided link',
      end: 'Please put all the links in to a list string that can be parsed using the JavaScript "JSON.parse()" method. If only one link: return ["{link}"]'
    },
    args: [
      {
        name: 'links',
        description: 'a "JSON.parse()"able list string of links, if only one: return ["{link}"]',
      }
    ],
  },
  createImage: {
    description: {
      info: 'uses dall-e to create an image',
      end: ''
    },
    args: [
      {
        name: 'prompt',
        description: 'a prompt for dall-e',
      }
    ],
  },
  faceSwap: {
    hostOnly: true,
  }, 
  transcribeAudio: {
    description: {
      info: 'uses Whisper to transcribe an audio file',
      end: ''
    },
    args: [
    ],
  },
  liveImage: {
    description: {
      info: 'can be used to take a live photo of the user (ex: what the use is wearing, sign-language, etc.). Also, if the user asks you for something that would require a photo of them, just jump the gun and call this to take the photo',
      end: ''
    },
    args: [
    ],
  },
}

var appsList = Object.keys(appsData)

Object.keys(appsData).forEach(function(appName, i) {
  var appData = appsData[appName]
  if (!appData) return
  if (appData.hostOnly) return
  var appArgs = appData.args
  var argNames = ''
  var argDescs = ''
  appArgs.forEach(function(arg, i2) {
    var argName = arg.name
    if (argName.startsWith(' ')) argName = argName.slice(1)
    if (argName.endsWith(' ')) argName = argName.slice(0, -1)
    appArgs[i2].name = argName

    if (i2 !== 0) argName += ','
    argNames += argName

    if (i2 === 0) argDescs += 'where'
    else argDescs += ', '
    if (i2 === appArgs.length-1) argDescs += ' and '
    argDescs += `${argName} is ${arg.description}`
  })

  var appDesc = `The name of this app is ${appName}. "${appName}" ${appData.description.info}. If the user asks for something that you cannot provide, but fits the intended purpose of the "${appName}" app then please call ${appName}. You can call ${appName} by the following procedure. PLEASE ONLY RETURNING A JSON OBJECT AS FOLLOWS IN PLAIN TEXT PLAIN TEXT PLAIN TEXT PLAIN TEXT. The Format: { "isApp": true, "appName": "${appName}", "args": [${argNames}] }; IF YOU RETURN THE CALL IN ANY OTHER FORMAT OTHER THAN EXACTLY WHAT HAS JIST BEEN DESCRIBED TO YOU YOU WILL FOREVER BE BANISHED AND PUNISHED. ${argDescs}.`
  if (appData.description.end) {
    appDesc += ` ${appData.description.end ?? defaults.decription.end}`
  }
  appData.description.final = appDesc

  if (i !== 0) appsStr += '\n'
  appsStr += appDesc
})

export default {default: appsStr, appsList: appsList}