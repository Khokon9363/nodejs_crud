// Dependencies
const http = require('http')
const { handleReqRes } = require('./helpers/handleReqRes')
const environments = require('./helpers/environments')
const data = require('./lib/data')

// App object | Module scaffolding
const app = {}

// Todo
// data.create('test', 'newFile', {
//     name: 'Bangladesh',
//     language: 'Bangla'
// }, (err) => {
//     console.log('Error was', err)
// })

// data.read('test', 'newFile', (err, data) => {
//     console.log(err, data)
// })

// data.update('test', 'newFile', {
//     name: 'Bangladesh',
//     language: 'Banglish'
// }, (err) => {
//     console.log('Error was', err)
// })

// data.delete('test', 'newFile', (err) => {
//     console.log(err)
// })

// Create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes)

    server.listen(environments.PORT, () =>{
        console.log(`Server running on port ${environments.PORT}`)
    })
}

// handle request response
app.handleReqRes = handleReqRes

app.createServer()