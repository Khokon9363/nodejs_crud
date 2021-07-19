// Module scaffolding
const handler = {}

handler.notFoundHandler = (reqProperties, callback) => {
    callback(404, {
        data: 'Not found'
    })
}

module.exports = handler