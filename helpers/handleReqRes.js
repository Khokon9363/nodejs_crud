// Dependencies
const url = require('url')
const { StringDecoder } = require('string_decoder')
const routes = require('../routes')
const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandler')
const { parseJSON } = require('./utilities')

// module scaffolding
const handler = {}

handler.handleReqRes = (req, res) => {
    // get the url & parse it
    const parsedUrl = url.parse(req.url, true)
    const path = parsedUrl.path
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')
    const method = req.method.toLowerCase()
    const queries = parsedUrl.query
    const headers = req.headers
    const reqProperties = {
        parsedUrl, path, trimmedPath, method, queries, headers
    }

    const decoder = new StringDecoder('utf-8')
    let realData = ''

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler
    
    req.on('data', (buffer) => {
        realData += decoder.write(buffer)
    })
    req.on('end', () => {
        realData += decoder.end()

        reqProperties.body = parseJSON(realData)

        chosenHandler(reqProperties, (status, payload) => {
            status = (typeof(status) === 'number') ? status : 500
            payload = (typeof(payload) === 'object') ? payload : {}
    
            const payloadString = JSON.stringify(payload)

            // return the final response
            res.setHeader('Content-Type', 'applicant/json')
            res.writeHead(status)
            res.end(payloadString)
        })
    })
}

module.exports = handler