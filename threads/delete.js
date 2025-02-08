import OpenAI from 'openai';
const openai = new OpenAI();

async function deleteId(req, res) {
    var id = req.body.thread

    var thread = await openai.beta.threads.retrieve(id)

    if (thread) {
        var resp = await openai.beta.threads.del(id)
        res.json(resp)
    }
    else {
        res.json(thread)
    }
  }

export default deleteId