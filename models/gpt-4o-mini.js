import OpenAI from 'openai';
import { getThreadMessages, addMessageToThread, VALID_ROLES } from '../threads/messages.js';
const openai = new OpenAI();

import config from '../config.js'

const FileObj = (...types) => ({ type: 'file', types });

var systemPrompt = config.systemPrompt

var modelConfig = {
    provider: 'OpenAI',
    types: ['text', FileObj('image', 'audio')],
}

async function completedActions(run) {
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
}

async function newMessage(threadId, prompt, model, type, urls, useSystem=true, startingMessage) {
    // Get previous messages from thread file
    const previousMessages = getThreadMessages(threadId)
    
    // Prepare messages array for completion
    const messages = []
    
    // Add previous messages
    previousMessages.forEach(msg => {
        messages.push({
            role: msg.role,
            content: msg.content
        })
    })
    
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

    // Save user message to thread file
    addMessageToThread(threadId, {
        role: VALID_ROLES.USER,
        content: prompt
    })

    try {
        const completion = await openai.chat.completions.create({
            messages: messages,
            model: model || 'gpt-4',
        });

        const response = completion.choices[0].message.content
        
        // Save assistant response to thread file
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
    var messages = []
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