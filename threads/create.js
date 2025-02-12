import config from '../config.js'
const models = config.models

async function createThread(req, res) {
    var threads = {}

    Object.keys(models).forEach(async model => {
        threads[model] = (await models[model].actions).thread.create(req, res)
    })

    res.json(threads)
}

export default createThread