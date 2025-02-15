import config from '../config.js'
const models = config.models

async function createThread(req, res) {
    var threads = {}

    Object.keys(models).forEach(async (model, i) => {
        await (await models[model].actions).thread.create(req, res)
            .then(thread => threads[model] = thread)
            .then(() => {
                if (i === Object.keys(models).length - 1) res.json(threads)
            })
    })
}

export default createThread