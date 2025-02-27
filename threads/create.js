import config from '../config.js'
const models = config.models

async function createThread(req, res) {
    var threads = {}
    var keys = Object.keys(models)

    var i = 0
    Object.keys(models).forEach(async model => {
        if (model.startsWith('_')) {
            keys.splice(i, 1)
            i++
            return
        }
        await (await models[model].actions).thread.create(model)
            .then(thread => threads[model] = thread)
            .then(thread => {
                console.log(i, keys.length)
                if (i === keys.length) res.json(threads)
                i++
            })
    })
}

export default createThread