import fs from 'fs'

function deleteId(req, res) {
    var id = req.body.userid

    if (!fs.existsSync('./userStatus')) {
        fs.mkdirSync('./userStatus')
    }

    if (fs.existsSync(`./userStatus/${id}.json`)) {
        fs.unlinkSync(`./userStatus/${id}.json`)
        res.json({ message: 'deleted' })
    }
    else {
        res.json({ message: 'not found' })
    }
  }

export default deleteId