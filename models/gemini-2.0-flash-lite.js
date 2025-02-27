import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    FileState,
    GoogleAICacheManager,
    GoogleAIFileManager,
} from '@google/generative-ai/server';

import config from '../config.js'

const FileObj = (...types) => ({ type: 'file', types });

var systemPrompt = config.systemPrompt

var modelConfig = {
    provider: 'Google',
    model: 'gemini-2.0-flash-lite',
    types: ['text'/*, FileObj('image', 'audio')*/],
    modelPrompt: 'Unfortunately, you are not yet able to keep context.',
}
modelConfig.api_key = process.env[`${modelConfig.provider.toUpperCase()}_API_KEY`]


const genAI = new GoogleGenerativeAI(modelConfig.api_key);
const aiModel = genAI.getGenerativeModel({ model: modelConfig.model });

const conversation = aiModel.startChat();
const chat = aiModel.startChat();

async function newMessage(threadId, prompt, model, type, urls, useSystem=true, startingMessage) {
    return newCompletion(threadId, prompt, model, type, urls, useSystem=true, startingMessage)
}

async function newCompletion(threadId, prompt, model, type, urls, useSystem=true, startingMessage) {
    var messageObj = [prompt]

    if (urls) {
        urls.forEach(async url => {
            console.log(url)

            // const uploadResult = await fileManager.uploadFile(`${mediaPath}/a11.txt`, {
            //     mimeType: "text/plain",
            // });

            // messageObj.push(
            //     {
            //         fileData: {
            //             fileUri: uploadResult.file.uri,
            //             mimeType: uploadResult.file.mimeType,
            //         },
            //     },
            // )
        })
    }

    let result = await chat.sendMessage(messageObj);

    return result.response.text()
}

async function createThread(model) {
    let sendSPrompt = await chat.sendMessage(systemPrompt);
    return 'n/a'
}

async function deleteThread(id) {
    let sendOPrompt = await chat.sendMessage('This chat is over, thanks!');
    return 'done!'
}

export default { config: modelConfig, message: newMessage, completion: newCompletion, thread: { create: createThread, delete: deleteThread } }