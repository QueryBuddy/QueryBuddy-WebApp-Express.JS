import fs from 'fs'
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getThreadMessages, addMessageToThread, VALID_ROLES } from '../threads/messages.js';
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
    modelPrompt: 'YOU ARE NOT UNDER DEVELOPMENT. THER USER\'S NAME IS NOT JOHN.',
}
modelConfig.api_key = process.env[`${modelConfig.provider.toUpperCase()}_API_KEY`]



const genAI = new GoogleGenerativeAI(modelConfig.api_key);

function handleFiles(messageObj, urls) {
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
    return messageObj
}

async function newMessage(threadId, prompt, model, type, urls, useSystem=true, startingMessage) {
    // Get previous messages from thread file
    var oldMessages = getThreadMessages(threadId)

    var previousMessages = []
    previousMessages.forEach((msg, i) => {
        if (msg.role == VALID_ROLES.ASSISTANT) {
            msg.role = 'model'
        }
        msg.parts = [{text: msg.content}]

        previousMessages.push({role: msg.role, parts: [{text: msg.content}]})
    })
    
    const chat = genAI.getGenerativeModel({ model: modelConfig.model, systemInstruction: JSON.stringify(previousMessages) }).startChat({ history: previousMessages });
    
    // Add all previous messages
    
    // Handle current message
    var messageObj = prompt
    messageObj = handleFiles(messageObj, urls)
    
    // Save user message
    addMessageToThread(threadId, {
        role: VALID_ROLES.USER,
        content: prompt
    })
    
    try {
        // Send current message and get response
        let result = await chat.sendMessage(messageObj);
        const response = result.response.text();
        
        // Save assistant response
        addMessageToThread(threadId, {
            role: VALID_ROLES.ASSISTANT,
            content: response
        })
        
        return response
    } catch (error) {
        const errorMsg = `Error: ${error.message}`
        addMessageToThread(threadId, {
            role: VALID_ROLES.ASSISTANT,
            content: errorMsg
        })
        return errorMsg
    }
}

async function newCompletion(threadId, prompt, model, type, urls, useSystem=true, startingMessage) {
    const chat = genAI.getGenerativeModel({ model: model }).startChat();

    var messageObj = prompt

    messageObj = handleFiles(messageObj, urls)

    let result = await chat.sendMessage(messageObj);

    return result.response.text()
}

export default { config: modelConfig, message: newMessage, completion: newCompletion }