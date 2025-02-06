import fs from 'fs'

function deleteId(req, res) {
    var id = req.body.userid

    if (!fs.existsSync('./userConversations')) {
        fs.mkdirSync('./userConversations')
    }

    if (fs.existsSync(`./userConversations/${id}.json`)) {
        fs.unlinkSync(`./userConversations/${id}.json`)
        res.json({ message: 'deleted' })
    }
    else {
        res.json({ message: 'not found' })
    }
  }

export default deleteId