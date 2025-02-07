import fs from 'fs'

var length = 64
var chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

function add(id, actor, content, type) {
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
    return obj
}

export default add