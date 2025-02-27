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
    types: ['text'/*, FileObj('image', 'audio')*/],
    modelPrompt: 'Unfortunately, you are not yet able to keep context.',
}
modelConfig.api_key = process.env[`${modelConfig.provider.toUpperCase()}_API_KEY`]

// Access your API key as an environment variable.
const genAI = new GoogleGenerativeAI(modelConfig.api_key);

async function newMessage(threadId, prompt, model, type, urls, useSystem=true, startingMessage) {
    // Get cache
    var cache = await cacheManager.get(threadId);

    // Construct a `GenerativeModel` which uses the cache object.
    const genModel = genAI.getGenerativeModelFromCachedContent(cache);

    // Query the model.
    const result = await genModel.generateContent({
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: prompt
                    },
                ],
            },
        ],
    });

    return result.response.text()
}

async function newCompletion(threadId, prompt, model, type, urls, useSystem=true, startingMessage) {
    // Construct a `GenerativeModel` which uses the cache object.
    const genModel = genAI.getGenerativeModel({ model: model });

    // Query the model.
    const result = await genModel.generateContent({
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: prompt
                    },
                ],
            },
        ],
    });

    return result.response.text()
}

async function createThread(model) {
    // Construct a GoogleAICacheManager using your API key.
    const cacheManager = new GoogleAICacheManager(modelConfig.api_key);

    // Create a cache with a 5 minute TTL.
    let ttlSeconds = 300;
    const cache = await cacheManager.create({
        model: `models/${model}`,
        displayName: config.aName,
        systemInstruction: systemPrompt,
        contents: /*modelConfig.modelPrompt ? */[
            {
                role: 'ai',
                parts: [
                    {
                        text: modelConfig.modelPrompt,
                    }
                ],
            },
        ],// : [{role: 'system'}],
        ttlSeconds,
    });

    return cache.name
}

async function deleteThread(id) {
    await cacheManager.delete(id);
}

export default { config: modelConfig, message: newMessage, completion: newCompletion, thread: { create: createThread, delete: deleteThread } }