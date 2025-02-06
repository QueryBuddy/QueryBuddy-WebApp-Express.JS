import fs from 'fs'

var length = 64
var chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

function add(id, actor, content, type) {
    if (!fs.existsSync('./userConversations')) {
        fs.mkdirSync('./userConversations')
    }

    if (!fs.existsSync(`./userConversations/${id}.json`)) {
        fs.writeFileSync(`./userConversations/${id}.json`, JSON.stringify({
            messages: [],
            lastMessage: {},
        }))
    }

    var obj = JSON.parse(fs.readFileSync(`./userConversations/${id}.json`, 'utf8'))
    obj.messages.push({ actor: actor, content: content, type: type, timestamp: new Date() })
    obj.lastMessage = { actor: actor, content: content, type: type, timestamp: new Date() }

    fs.writeFileSync(`./userConversations/${id}.json`, JSON.stringify(obj))
}

export default add