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
    if (!fs.existsSync('./userConversations')) {
        fs.mkdirSync('./userConversations')
    }

    var id = generateId()

    while (fs.existsSync(`./userConversations/${id}.json`)) {
        id = generateId()
    }

    fs.writeFileSync(`./userConversations/${id}.json`, JSON.stringify({
        messages: [],
        lastMessage: {},
    }))

    res.json({ userid: id })
}

export default createId