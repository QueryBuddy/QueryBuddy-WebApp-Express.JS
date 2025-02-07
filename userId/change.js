import fs from 'fs'

function add(id, status=null, thread=null) {
    if (!fs.existsSync('./userStatus')) {
        fs.mkdirSync('./userStatus')
    }

    if (!fs.existsSync(`./userStatus/${id}.json`)) {
        fs.writeFileSync(`./userStatus/${id}.json`, JSON.stringify({
            messages: [],
            lastMessage: {},
        }))
    }

    var obj = JSON.parse(fs.readFileSync(`./userStatus/${id}.json`, 'utf8'))
    obj.status = status
    obj.thread = thread

    fs.writeFileSync(`./userStatus/${id}.json`, JSON.stringify(obj))
}

export default add