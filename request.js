import fs from 'fs';
import fetch from 'node-fetch' ;
import path from 'path';

var provider = 'OpenAI'
var api_key = process.env[`${provider.toUpperCase()}_API_KEY`]

import OpenAI from 'openai';
const openai = new OpenAI();

import config from './config.js'

var models = config.models

var checkPrompt = config.checkPrompt;
var errorCheck = config.errorCheck;

var defaultId = config.defaultSystemId;
var appsList = config.appsList;

function isJSON(text) {
  let isValid = false;
  
  if (typeof text !== 'string' || (typeof text === 'string' && text.length === 0)) {
    return isValid;
  }
  
  try {
    JSON.parse(text);
    isValid = true;
  } catch (e) {
  }
  
  return isValid;
}

function newRequest(res, model, threadId, prompt, type, urls, voice, systemId, startingMessage) {
  if (!urls) urls = []

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${api_key}`,
  };

  switch (type) {
    case 'create-image': 
      model = `dall-e-${3}`
      imageRequest(headers, res, threadId, prompt, model, startingMessage)
      break;
    case 'create-audio':
      model = `tts-${1}-hd`
      audioRequest(res, threadId, prompt, voice, model, startingMessage)
      break;
    case 'transcribe-audio': 
      var path = `/temp/${prompt}`
      model = `whisper-${1}`
      transcriptionRequest(path, threadId, res, model, startingMessage)
      break;
    default:
      if (!model) model = `gpt-${4}o`
      textRequest(res, threadId, prompt, model, type, urls, systemId, startingMessage)
      break;
  }
}

async function textRequest(res, threadId, prompt, model, type, urls, systemId, startingMessage) {
  var modelObj = models[model]

  if (type === 'live-image-send') type = 'image'

  if (!!systemId === false) systemId = defaultId

  var output
  if (startingMessage) {
    output = await (await modelObj.actions).completion(threadId, prompt, model, type, urls, true, startingMessage)
    res.send({status: 'OK', content: output})
    return
  }
  
  output = await (await modelObj.actions).message(threadId, prompt, model, type, urls, true, startingMessage)
  var appCheck = output
  while (appCheck.startsWith('\n')) appCheck = appCheck.slice(1)
  while (appCheck.endsWith('\n')) appCheck = appCheck.slice(0, -1)
  if (appCheck.startsWith('```json')) appCheck = appCheck.slice(7)
  if (appCheck.endsWith('```')) appCheck = appCheck.slice(0, -3)
  while (appCheck.startsWith('\n')) appCheck = appCheck.slice(1)
  while (appCheck.endsWith('\n')) appCheck = appCheck.slice(0, -1)

  var currentApp
  if (isJSON(appCheck) && !!appsList) {
    appCheck = JSON.parse(appCheck)
    if (appCheck.isApp) currentApp = appCheck
  }

  if (checkPrompt.includes('{userPrompt}')) {
    if (prompt.includes(systemId)) {
      prompt = prompt.split(systemId)
      prompt.pop()
      prompt = prompt.join(systemId)
    }
    checkPrompt = checkPrompt.replace('{userPrompt}', prompt)
  }
  if (checkPrompt.includes('{aiResponse}')) {
    checkPrompt = checkPrompt.replace('{aiResponse}', output)
  }

  if (currentApp) {
    res.send({status: 'appOK', content: currentApp})
  }
  else {
    var cOutput = await (await modelObj.actions).completion(threadId, checkPrompt, model, type, urls, false, startingMessage)
    if (cOutput === 'good') {
      res.send({status: 'OK', content: output})
    }
    else if (cOutput === 'not good') {
      if (errorCheck.includes('{errorMessage}')) {
        errorCheck = errorCheck.replace('{errorMessage}', output)
      }
      output = await (await modelObj.actions).completion(threadId, errorCheck, model, type, urls, false, startingMessage)
      res.send({status: 'Error', content: output})
    }
    else {
      res.send({status: 'OK', content: output})
    }
  }
}

async function imageRequest(headers, res, threadId, prompt, model, startingMessage) {
  const payload = {
    model: model,
    prompt: prompt,
    n: 1,
    size: "1024x1024", 
  };

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: 'post',
    body: JSON.stringify(payload),
    headers: headers
  });

  const body = await response.json();
  if (body.error) {
    var err = body.error.message
    res.send({content: err, status: 'Error'})
  }
  else {
    data = body["data"];
    data.forEach(d => {
      url = d["url"];
      var status = url.includes('://') ? 'Success' : 'Error'
      res.send({status: status, content: url});
    });
  }
}

async function audioRequest(res, threadId, prompt, voice, model, startingMessage) {
  var fname = './speech.mp3'
  const speechFile = path.resolve(fname);

  if (model.endsWith('-')) model = model.substring(0, model.length - 1)

  const mp3 = await openai.audio.speech.create({
    model: model,
    voice: voice,
    input: prompt,
  });
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
  res.send(fname)
}

async function transcriptionRequest(path, threadId, res, model, startingMessage) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(path),
    model: model,
  });

  res.send({status: 'OK', content: transcription.text});
}

export default newRequest