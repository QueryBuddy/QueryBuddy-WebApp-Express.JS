import OpenAI from 'openai';
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
    console.log(threadId)
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
                "detail": "high"
            },
        })
    })

    const message = await openai.beta.threads.messages.create(
        threadId,
        {
            role: "user",
            content: cArr,
        }
    );

    var allRuns = await openai.beta.threads.runs.list(
        threadId
    );

    var hasActiveRun = allRuns.data.filter(run => run.status === 'running').length > 0

    var run
    if (!hasActiveRun) {
        run = await openai.beta.threads.runs.createAndPoll(
        threadId,
        { 
            assistant_id: config.assistantId,
            instructions: systemPrompt
        }
        );
    }
    else {
        run = await openai.beta.threads.runs.retrieve(
            threadId,
            allRuns.body.last_id
        );
    
    }
    
    if (run.status === 'completed') {
        return completedActions(run)
    }
    else if (run.status === 'queued') {
        var i = 0
        var max = 5

        while (run.status === 'queued' && i < max) {
            run = await openai.beta.threads.runs.retrieve(
                threadId,
                run.id
            );
            i++
        }

        if (run.status === 'completed') {
            return completedActions(run)
        }
        else {
            return `Error: Unable to create a new message or retrieve the last one with run status of ${run.status}.`
        }
    }
    else if (run.status === 'failed') {
        return `Error ${run.last_error.code}: ${run.last_error.message}`
    }
    else {
        return `Error: Unable to create a new message or retrieve the last one.`
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

async function createThread() {
    const thread = await openai.beta.threads.create();

    const message = await openai.beta.threads.messages.create(
      thread.id,
        {
            role: 'assistant',
            content: config.firstMessage
        }
    );

    return thread.id
}

async function deleteThread(id) {
    var thread = await openai.beta.threads.retrieve(id)

    if (thread) {
        var resp = await openai.beta.threads.del(id)
        return resp
    }
    else {
        return thread
    }
}

export default { config: modelConfig, message: newMessage, completion: newCompletion, thread: { create: createThread, delete: deleteThread } }