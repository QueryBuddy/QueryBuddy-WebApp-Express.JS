const fs = require('fs')

function createOutput(output) {
  var outputObj = `{
    output: "${output}"
}`
  fs.writeFileSync('output.json', outputObj)
}

exports.default = createOutput