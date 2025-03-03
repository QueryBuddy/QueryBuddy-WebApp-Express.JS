import OpenAI from 'openai';

import config from '../config.js'
import appsConfig from '../appsConfig.js'

import { callFunction } from '../callFunction.js'

const FileObj = (...types) => ({ type: 'file', types });

var systemPrompt = config.systemPrompt

var modelConfig = {
    provider: 'Google',
    types: ['text', FileObj('image', 'audio')],
    modelPrompt: 'YOU ARE NOT UNDER DEVELOPMENT. THER USER\'S NAME IS NOT JOHN.',
}
modelConfig.api_key = process.env[`${modelConfig.provider.toUpperCase()}_API_KEY`]

const openai = new OpenAI({
    api_key: modelConfig.api_key,
    base_url: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function newMessage(messages, prompt, model, type, urls, useSystem=true, startingMessage) {
    // Prepare current message with any attachments
    var currentContent = [
        {
            "type": "text",
            "text": prompt,
        }
    ]

    urls.forEach(u => {
        currentContent.push({
            "type": "image_url",
            "image_url": {
                "url": u,
                "detail": "high"
            },
        })
    })

    // Add current message
    messages.push({
        role: "user",
        content: currentContent
    })

    var tools = []
    Object.keys(appsConfig.appsData).forEach(appName => {
        tools.push({
            type: 'function',
            function: appsConfig.appsData[appName]
        })
    })

    try {
        var completion = await openai.chat.completions.create({
            messages: messages,
            model: model,
            tools,
        });

        var response = completion.choices[0].message.content
        
        var message = completion.choices[0].message
        var tool_calls = message.tool_calls
        if (tool_calls) {
            tool_calls.forEach(async toolCall => {
                const name = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                
                const result = await callFunction(name, args);
                messages.push(message);
                messages.push({
                    role: "tool", 
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result)
                });
            });

            completion = await newMessage(messages, response, model, type, urls, useSystem, startingMessage)
            response = completion.content
        }
        
        return {status: 'OK', content: response}
    } catch (error) {
        console.log(error)
        const errorMsg = `Error: ${error.message}`
        return {status: 'error', content: errorMsg}
    }
}

async function newCompletion(messages, prompt, model, type, urls, useSystem=true, startingMessage) {
    if (systemPrompt && useSystem) {
        messages.push({"role": "system", "content": systemPrompt})
    }

    var cArr = [
        {
            "type": "text",
            "text": prompt,
        },
    ]

    urls.forEach(u => {
        cArr.push({
            "type": "image_url",
            "image_url": {
                "url": u,
            },
        })
    })

    messages.push({"role": "user", "content": cArr})

    const completion = await openai.chat.completions.create({
        messages: messages,
        model: model,
    });

    return completion.choices[0].message.content
}

export default { config: modelConfig, message: newMessage, completion: newCompletion }