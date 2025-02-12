import config from '../config.js'
const models = config.models

async function deleteThread(req, res) {
    var threads = {}

    Object.keys(models).forEach(async model => {
        threads[model] = (await models[model].actions).thread.delete(req, res)
    })
  
    res.json(threads)
}

export default deleteThread