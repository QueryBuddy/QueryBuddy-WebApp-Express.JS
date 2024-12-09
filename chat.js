var systemPrompt = !!systemPrompt ? systemPrompt : false
var appsList = !!appsList ? appsList : false
var keepValue = !!keepValue ? keepValue : false

var type = 'text'
var useAmt = 0
var maxUses = 10
var maxMessage = `You will now exceed ${maxUses} continuous messages. Please <a href="javascript:location.reload()">Start a New Conversation</a> to send more messages.`

var chatElement
var langElement
var sendBtn
var checkForSend = function() {}

var queryString
var urlParams
var filelocation

var urls
var fnames
var nameStr = ''

var interval
var specialActs4Conv = function(x,y,z) {}

var lastAnswer = ''
var lastQuestion = ''

var systemId = '$[systemPrompt]'

var finaValu = ''
var prevValu = ''
var currValu = ''
var oSpeechRecognizer = null

function handleUpload(queryString) {
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString)

  fnames = urlParams.get('name')
  filelocation = urlParams.get('filelocation')

  handleFiles()
}

function addToPrompt(prompt) {
  if (prompt.endsWith('\n')) {
    prompt = prompt.slice(0, -1)
  }
  if (prompt.endsWith(' ')) {
    prompt = prompt.slice(0, -1)
  }
  if (
    !!prompt.endsWith('.') === false && 
    !!prompt.endsWith('?') === false && 
    !!prompt.endsWith('!') === false
  ) prompt += '.'
  prompt += ` ${nameStr}`
  if (prompt.endsWith(' ')) {
    prompt = prompt.slice(0, -1)
  }
  if (!!systemPrompt) {
    prompt += `\n${systemId}\n${systemPrompt}`
  }
  if (prompt.endsWith(' ')) {
    prompt = prompt.slice(0, -1)
  }
  if (
    !prompt.endsWith('.') === false && 
    !prompt.endsWith('?') === false && 
    !prompt.endsWith('!') === false
  ) prompt += '.'
  if (prompt.endsWith(' ')) {
    prompt = prompt.slice(0, -1)
  }
  if (prompt.includes('  ')) prompt = prompt.split(' ').join(' ')
  return prompt
}

function sendMessage(prompt, type, showUserMessage=true) {
  chatElement.disabled = true
  sendBtn.onclick = function() {}
  if (!!prompt === false) prompt = chatElement.value

  var lPrompt = prompt.toLowerCase()
  if (lPrompt.includes(' ')) lPrompt = lPrompt.split(' ').join('')

  if (lPrompt === 'tryagain') {
    if (lastQuestion) prompt = lastQuestion
  }
  else {
    lastQuestion = prompt
  }
  prompt = addToPrompt(prompt)

  if (prompt.toLowerCase().startsWith('continue')) {
    var lastMessage = document.querySelectorAll('.messages > .message.user')
    lastMessage = lastMessage[lastMessage.length-1]
    var lastTextSpan = lastMessage.querySelector('.text__span')
    var lastMessageContent = lastTextSpan.innerHTML
    var newMessageContent = lastAnswer
    if (newMessageContent.startsWith(lastMessageContent)) {
      newMessageContent = newMessageContent.substring(lastMessageContent.length)
    }
    newMessage('ai', newMessageContent)
    return
  }
  else {
    var newPrompt = prompt
    if (prompt.includes(systemId)) {
      prompt = prompt.split(systemId)
      var lastItem = prompt.pop()
      prompt = prompt.join(systemId)
      prompt += lastItem
      if (prompt.includes('  ')) {
        prompt = prompt.split('  ').join(' ')
      }

      newPrompt = newPrompt.split(systemId)
      newPrompt.pop()
      newPrompt.join(systemId)
      if (newPrompt.includes('  ')) {
        newPrompt = newPrompt.split('  ').join(' ')
      }
    }
    if (!!urls && !!type === false) type = 'image'
    if (!!urls) {
      newPrompt += '<div class="chat-imgs">'
      urls.forEach(function(u, i) {
        newPrompt += `<img class="input-image" src="${u}" alt="Image #${i+1}">`
      })
      newPrompt += '</div>'
    }
    if (showUserMessage) newMessage('user', newPrompt)
    type = !!type ? type : 'text'
    newRequest(type, prompt, urls=urls, filelocation=filelocation)
  }
  if (!keepValue) chatElement.value = ''
}

function ChangeLang(e) {
  if (oSpeechRecognizer) {
    oSpeechRecognizer.lang = langEle.value;
    //SpeechToText()
  }
}

function handleFiles() {
  if (!!fnames) {
    type = 'image'
    if (fnames.includes(',')) fnames = fnames.split(',')
    else fnames = [fnames]
  }
  if (!!urls) {
    type = 'image'
    if (urls.includes(',')) urls = urls.split(',')
    else urls = [urls]
    urls.forEach(function(u, i) {
      urls[i] = urls = decodeURIComponent(u)
    })
  }
  else if (!!fnames) urls = []
  if (filelocation == 'temp-storage') {
    nameStr += ` The names of the files are [`
    fnames.forEach(function(n, i) {
      urls.push(`https://${location.hostname}/temp?name=${n}`)
      if (i !== 0) nameStr += `, `
      nameStr += `"${n}"`
    })
    nameStr = String(`${nameStr}].`)
    if (nameStr.includes('  ')) nameStr = nameStr.split('  ').join(' ')
  }
}

window.addEventListener('DOMContentLoaded', function (e) {
  newRequest(
    'text', startingPrompt, null, null, null, 
    'box', {variation: 'info', name: 'welcome'}
  )
  
  queryString = window.location.search;
  urlParams = new URLSearchParams(queryString);
  filelocation = urlParams.get('filelocation');

  type = !!urlParams.get('type') ? urlParams.get('type') : type
  fnames = urlParams.get('name');
  urls = urlParams.get('url');

  handleFiles()
  
  if (!!lastAnswer !== false) {
    if (type === 'makeai') location.href = `https://ImaGPT.adarshrkumar.dev/create?prompt=${lastAnswer}`
  }
  else {
    setInterval(function() {
      if (!!lastAnswer !== false) {
        if (type === 'makeai') location.href = `https://ImaGPT.adarshrkumar.dev/create?prompt=${lastAnswer}`
      }
    }, 100)
  }

  langElement = document.getElementById('selLang')
  if (!!langElement) {
    langElement.addEventListener('change', ChangeLang)
  }
  if ('webkitSpeechRecognition' in window) {
  } 
  else {
    //speech to text not supported
    if (!!document.querySelector('label.dictate')) {
      document.querySelector('label.dictate').style.display = 'none';
    }
  }
  var dictChk = document.getElementById('chkSpeak')
  if (!!dictChk) {
    dictChk.addEventListener('change', SpeechToText)
  }

  chatElement = document.querySelector('.input-parent .input')
  chatElement.focus()
  chatElement.addEventListener('keyup', function(e) {
    if (e.keyCode === 13 && chatElement.value !== '\n') {
      sendMessage()
    }
  })

  sendBtn = chatElement.parentNode.querySelector('.send-btn')
  checkForSend = function(e) { if (chatElement.value !== '') sendMessage() }
  sendBtn.addEventListener('click', checkForSend)
});

function newRequest(type, prompt, urls, voice, filelocation, messageType, moreParams) {
  if (type == 'create-image') {
    if (prompt.includes(' \n ')) {
      prompt = prompt.split(' \n ').join(' ')
    }
    if (prompt.includes(' \n')) {
      prompt = prompt.split(' \n').join(' ')
    }
    if (prompt.includes('\n ')) {
      prompt = prompt.split('\n ').join(' ')
    }
    if (prompt.includes('\n')) {
      prompt = prompt.split('\n').join(' ')
    }
  }
  var reqUrl = `/sendRequest?t=${type}`
  if (type == 'image' && !!urls) reqUrl += `&urls=${urls}`
  if (!!filelocation) reqUrl += `&fl=${filelocation}`
  if (!!systemId) reqUrl += `&systemid=${systemId}`
  if (!!voice) reqUrl += `&systemid=${voice}`
    if (messageType == 'box') {
    if (!!moreParams) {
      if (!!moreParams.name) {
        if (moreParams.name == 'welcome') {
          reqUrl += `&startingmessage=true`
        }
      }
    }
  }
  prompt = encodeURIComponent(prompt)
  reqUrl += `&p=${prompt}`
  
  var xhr = new XMLHttpRequest();
  xhr.open('GET', reqUrl);
  xhr.addEventListener('load', function () {
    var output = this.responseText;
    var role = 'ai'
    if (messageType) role = messageType
    if (
      (
        output.startsWith('{') && 
        output.endsWith('}')
      ) || 
      (
        output.startsWith('[') && 
        output.endsWith(']')
      )
    ) {
      output = JSON.parse(output)
    }
    if (typeof output === 'object') {
      role = output.status.toLowerCase()
      if (role === 'ok') role = 'ai'
      else if (role === 'appok') {
        messageType = 'box'
        moreParams = {variation: 'appInfo', isApp: true}
      }
      else if (role === 'error') {}
      else if (messageType !== 'box') {
        messageType = 'box'
        moreParams = {variation: role}
      }
      output = output.content
    }
    
    switch (type) {
      case 'create-image':
        output = `<img src="${output}" alt="Generated Image">` 
        break;
      case 'create-audio': 
        output = `<video src="${output}" alt="Generated Audio" autoplay>` 
        break;
    }
    
    if (messageType === 'box') {
      newMessage(messageType, output, moreParams)
    }
    else {
      newMessage(role, output, moreParams)
      lastAnswer = output
    }
  });
  xhr.send();
}

function newMessage(role, content, moreParams) {
  var message = document.createElement('div');
  message.classList.add('message');
  message.classList.add(role);
  switch (role) {
    case 'box': 
      variation = moreParams.variation
      if (!!variation === false) variation = 'info'
      message.classList.add(variation)

      if (moreParams.isApp) {
        checkIfApp(content, moreParams);
        return
      }
      break
    case 'app': 
      var appName = moreParams.appName
      message.classList.add(appName)
      break
  }

  if (role !== 'error' && role !== 'box') {
    let image = document.createElement('div');
    image.classList.add('image');
    message.appendChild(image);
  }

  var text = document.createElement('span');
  text.classList.add('text');

  let textSpan = document.createElement('span');
  textSpan.classList.add('text__span');
  text.appendChild(textSpan);

  message.appendChild(text);

  document.querySelector('.messages').appendChild(message)

  var staggerRoles = [
    'ai', 
    'app', 
    'error', 
    'box', 
  ]

  var isRole = staggerRoles.filter(r => role === r).length > 0
  if (isRole) {
    var sI = 0;
    var prevContent = ''
    if (!!content) {
      doActs();
      interval = setInterval(doActs, 50);
    }
    else {
      textSpan.innerHTML = 'Unknown Error'
      chatElement.disabled = false
      sendBtn.addEventListener('click', checkForSend)
      setScrollPos()
    }
    function doActs() {
      if (sI < content.length) {
        chatElement.disabled = true
        sendBtn.onclick = function() {}
        let currLett = content.split('')[sI];
        prevContent += currLett;
        textSpan.innerHTML = prevContent
        sI++;
      }
      else {
        clearInterval(interval);
        specialActs4Conv(role, content, moreParams)
        chatElement.disabled = false
        sendBtn.addEventListener('click', checkForSend)
        if (useAmt > maxUses) {
          chatElement.disabled = true
          sendBtn.onclick = function() {}
          newMessage('error', maxMessage)
        }
      }
    }
    setScrollPos()
  } 
  else {
    textSpan.innerHTML = content  
    chatElement.disabled = false
    sendBtn.addEventListener('click', checkForSend)
    setScrollPos()
  }
}

function checkIfApp(app, moreParams) {
  if (appsList) {
    if (moreParams.isApp) {
      appsData[app.appName](app.args)
    }
  }
}

function setScrollPos() {
  var element = document.querySelector('.messages');
  element.scrollTop = element.scrollHeight;
}

function SpeechToText() {
  chatElement.disabled = false
  sendBtn.addEventListener('click', checkForSend)
  if (oSpeechRecognizer) {
    if (chkSpeak.checked) {
      oSpeechRecognizer.start();
    } 
    else {
      oSpeechRecognizer.stop();
    }
    return;
  } 

  oSpeechRecognizer = new webkitSpeechRecognition();
  oSpeechRecognizer.continuous = true;
  oSpeechRecognizer.interimResults = true;
  oSpeechRecognizer.lang = selLang.value;
  oSpeechRecognizer.start();

  oSpeechRecognizer.onresult = function (e) {
    chatElement.disabled = true
    sendBtn.onclick = function() {}
    var interimTranscripts = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      var transcript = e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        prevValu += currValu
        finaValu += currValu
        chatElement.value = finaValu
        currValu = ''
        chatElement.disabled = false
        sendBtn.addEventListener('click', checkForSend)
      }
      else {
        interimTranscripts += transcript;
        currValu = interimTranscripts
        prevValu = finaValu + interimTranscripts
        chatElement.value = prevValu
      }

      chatElement.disabled = false
      sendBtn.addEventListener('click', checkForSend)
    }
  };

  oSpeechRecognizer.onerror = function (e) {};
}