import fs from 'fs';
import request from 'request' ;
import path from 'path';

import { marked } from 'marked'

// OpenAI API Key
var api_key = process.env.OPENAI_API_KEY

import OpenAI from 'openai';
const openai = new OpenAI(api_key);

import config from './config.js'

import changeUserStatus from './userId/change.js'
import getUserStatus from './userId/get.js'

var systemPrompt = config.systemPrompt
var checkPrompt = config.checkPrompt;
var errorCheck = config.errorCheck;

var defaultId = config.defaultSystemId;
var appsList = config.appsList;

function newRequest(res, userId, prompt, type, urls, voice, systemId, startingMessage) {
  if (getUserStatus(userId).status === 'inactive') changeUserStatus(userId, 'active')

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${api_key}`,
  };

  switch (type) {
    case 'create-image': 
      var model = `dall-e-${3}`
      imageRequest(headers, res, userId, prompt, model, startingMessage)
      break;
    case 'create-audio':
      var model = `tts-${1}-hd`
      audioRequest(res, userId, prompt, voice, model, startingMessage)
      break;
    case 'transcribe-audio': 
      var path = `/temp/${prompt}`
      var model = `whisper-${1}`
      transcriptionRequest(path, userId, res, model, startingMessage)
      break;
    default:
      var model = `gpt-${4}o`
      textRequest(res, userId, prompt, model, type, urls, systemId, startingMessage)
      break;
  }
}

async function newCompletion(userId, prompt, model, type, useSystem=true, startingMessage) {
  if (!getUserStatus(userId).thread) {
    const thread = await openai.beta.threads.create();
    changeUserStatus(userId, 'active', thread.id)

    const message = await openai.beta.threads.messages.create(
      thread.id,
      {
        role: 'assistant',
        content: 'Please first ask the user for their name, and address them as such.'
      }
    );
  }

  var userStatus = getUserStatus(userId)
  var threadId = userStatus.thread

  const message = await openai.beta.threads.messages.create(
    threadId,
    {
      role: "user",
      content: prompt,
    }
  );

  var run = await openai.beta.threads.runs.createAndPoll(
    threadId,
    { 
      assistant_id: config.assistantId,
      instructions: systemPrompt
    }
  );
  
  
  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(
      run.thread_id
    );

    var output = messages.data.reverse()

    output = output.pop().content

    var text = []
    
    output.forEach(o => {
      if (o.type === 'text') text.push(o.text.value)
    })

    text = text.join('\n\n---------------------------------------------------------------\n\n')

    return text
  } else {
    return {status: 'waiting', message: run.status}
  }
}

async function textRequest(res, userId, prompt, model, type, urls, systemId, startingMessage) {
  if (!!systemId === false) systemId = defaultId

  var output = await newCompletion(userId, prompt, model, type, true, startingMessage)
  
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
  var currentApp
  if (!!appsList) {
    for (let i = 0; i < output.split('').length; i++) {
      var nOutput = output.slice(i)
      while (nOutput.startsWith('`')) nOutput = nOutput.slice(1)
      while (nOutput.endsWith('`')) nOutput = nOutput.slice(0, -1)
      if (nOutput.startsWith('`')) nOutput = nOutput.slice(1)
      if (nOutput.endsWith('`')) nOutput = nOutput.slice(0, -1)

      if (
        (nOutput.startsWith('{') && nOutput.endsWith('}')) || 
        (nOutput.startsWith('[') && nOutput.endsWith(']'))
      ) {
        nOutput = JSON.parse(nOutput)
      }
      if (typeof nOutput === 'object') {
        if (nOutput.isApp && nOutput.appName) {
          currentApp = nOutput
        }
      }
    }
  }
    
  if (currentApp) {
    res.send({status: 'appOK', content: currentApp})
  }
  else {
    var cOutput = newCompletion(userId, checkPrompt, model, type, false, startingMessage)
    if (cOutput === 'good') {
      output = marked.parse(output)
      res.send({status: 'OK', content: output})
    }
    else if (cOutput === 'not good') {
      if (errorCheck.includes('{errorMessage}')) {
        errorCheck = errorCheck.replace('{errorMessage}', output)
      }
      output = newCompletion(userId, errorCheck, model, type, false, startingMessage)
      res.send({status: 'Error', content: output})
    }
    else {
      output = marked.parse(output)
      res.send({status: 'OK', content: output})
    }
  }
}

function imageRequest(headers, res, userId, prompt, model, startingMessage) {
  const payload = {
    model: model,
    prompt: prompt,
    n: 1,
    size: "1024x1024", 
  };

  request.post(
    {
      headers: headers,
      url: "https://api.openai.com/v1/images/generations",
      body: JSON.stringify(payload),
    },
    function (error, result, body) {
      body = JSON.parse(body);
      if (body.error) {
        var err = body.error.message
        res.send({content: err, status: 'Error'})
      }
      else {
        data = body["data"];
        data.forEach(function (d) {
          url = d["url"];
          var status = url.includes('://') ? 'Success' : 'Error'
          res.send({status: status, content: url});
        });
      }
    },
  );
}

async function audioRequest(res, userId, prompt, voice, model, startingMessage) {
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

async function transcriptionRequest(path, userId, res, model, startingMessage) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(path),
    model: model,
  });

  res.send({status: 'OK', content: transcription.text});
}

export default newRequest