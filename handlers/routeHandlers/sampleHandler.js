// Module scaffolding
const handler = {}

handler.sampleHandler = (reqProperties, callback) => {
    callback(200, {
        data: 'I am from sample page'
    })
}

module.exports = handler