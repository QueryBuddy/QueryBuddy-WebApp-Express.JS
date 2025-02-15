import OpenAI from 'openai';
const openai = new OpenAI();

import config from '../config.js'

var systemPrompt = config.systemPrompt

async function newMessage(threadId, prompt, model, type, useSystem=true, startingMessage) {
    const message = await openai.beta.threads.messages.create(
        threadId,
        {
            role: "user",
            content: prompt,
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
    else {
        return {status: 'waiting', message: run.status}
    }
}

async function newCompletion(threadId, prompt, model, type, useSystem=true, startingMessage) {
    var messages = []
    if (systemPrompt && useSystem) {
        messages.push({"role": "system", "content": systemPrompt})
    }

    messages.push({"role": "user", "content": prompt})

    const completion = await openai.chat.completions.create({
        messages: messages,
        model: model,
    });

    return completion.choices[0].message.content
}

async function createThread(req, res) {
    const thread = await openai.beta.threads.create();

    const message = await openai.beta.threads.messages.create(
      thread.id,
        {
            role: 'assistant',
            content: 'Please first ask the user for their name, and address them as such.'
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

export default { message: newMessage, completion: newCompletion, thread: { create: createThread, delete: deleteThread } }