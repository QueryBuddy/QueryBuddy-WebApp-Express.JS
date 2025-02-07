import fs from 'fs'

function add(id, status=null, thread=null) {
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
    obj.status = status
    obj.thread = thread

    fs.writeFileSync(`./userConversations/${id}.json`, JSON.stringify(obj))
}

export default add