import config from '../config.js'
const models = config.models
var keys = Object.keys(models)

async function deleteThread(req, res) {
    var threads = req.body.threads

    var i = 0
    keys.forEach(async model => {
        if (model.startsWith('_')) {
            keys.splice(i, 1)
            i++
            return
        }
        await (await models[model].actions).thread.delete(threads[model])
            .then(() => {
                if (i === keys.length) res.json(threads)
                i++
            })
    })
}

export default deleteThread