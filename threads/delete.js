import config from '../config.js'
const models = config.models

async function deleteThread(req, res) {
    var threads = req.body.threads

    Object.keys(threads).forEach(async (model, i) => {
        var thread = threads[model]
        await (await models[model].actions).thread.delete(thread)
            .then(() => {
                if (i === Object.keys(models).length - 1) res.json(threads)
            })
    })
}

export default deleteThread