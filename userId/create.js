import fs from 'fs'

var length = 64
var chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

function generateId() {
    var id = ''
    for (var i = 0; i < length; i++) {
        id += chars[Math.floor(Math.random() * chars.length)]
    }
    return id
}

function createId(req, res) {
    if (!fs.existsSync('./userStatus')) {
        fs.mkdirSync('./userStatus')
    }

    var id = generateId()

    while (fs.existsSync(`./userStatus/${id}.json`)) {
        id = generateId()
    }

    fs.writeFileSync(`./userStatus/${id}.json`, JSON.stringify({
        status: 'inactive',
    }))

    res.json({ userid: id })
}

export default createId