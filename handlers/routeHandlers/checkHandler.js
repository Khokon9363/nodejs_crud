// Dependencies
const data = require('../../lib/data')
const { parseJSON, randStr } = require('../../helpers/utilities')
const tokenHandler = require('./tokenHandler')
const { maxChecks } = require('../../helpers/environments')

// Module scaffolding
const handler = {}

handler.checkHandler = (reqProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'patch', 'delete']

    if(acceptedMethods.indexOf(reqProperties.method) > -1){
        handler._check[reqProperties.method](reqProperties, callback)
    }else{
        callback(405)
    }
}

handler._check = {}

handler._check.post = (reqProperties, callback) => {
    const protocol = handler._validations.protocol(reqProperties)
    const url = handler._validations.url(reqProperties)
    const method = handler._validations.method(reqProperties)
    const successCodes = handler._validations.successCodes(reqProperties)
    const timeoutSeconds = handler._validations.timeoutSeconds(reqProperties)
    const tokenId = handler._validations.tokenId(reqProperties)

    if(protocol && url && method && successCodes && timeoutSeconds && tokenId){
        data.read('tokens', tokenId, (err1, token) => {
            if(!err1 && token){
                const phone = parseJSON(token).phone
                
                data.read('users', phone, (err2, user) => {
                    if(!err2 && user){
                        tokenHandler._tokens.verify(tokenId, phone, (tokenIsvalid) => {
                            if(tokenIsvalid){
                                let userObj = parseJSON(user)
                                let userChecks = typeof userObj.checks === 'object'
                                                 && userObj.checks instanceof Array
                                                 ? userObj.checks
                                                 : []
                                if(userChecks.length < maxChecks){
                                    let checkId = randStr(20)
                                    let checkObj = {
                                        checkId, phone, protocol, url, method, successCodes, timeoutSeconds
                                    }
                                    data.create('checks', checkId, checkObj, (err3) => {
                                        if(!err3){
                                            userObj.checks = userChecks
                                            userObj.checks.push(checkId)

                                            // update the new user checks
                                            data.update('users', phone, userObj, (err4) => {
                                                if(!err3){
                                                    callback(200, {
                                                        data: "Update user checks!"
                                                    })
                                                }else{
                                                    callback(500, {
                                                        error: "Failed to update checks on user table!"
                                                    })
                                                }
                                            })
                                        }else{
                                            callback(500, {
                                                error: "Failed to saved check!"
                                            })
                                        }
                                    })
                                }else{
                                    callback(401, {
                                        error: "User max check reached"
                                    })
                                }
                            }else{
                                callback(403, {
                                    error: "Authentication failed"
                                })
                            }
                        })
                    }else{
                        callback(404, {
                            error: "User nopt found"
                        })
                    }
                })
            }else{
                callback(403, {
                    error: "Authentication failed"
                })
            }
        })
    }else{
        callback(400, {
            error: 'Data is invalid'
        })
    }
}

handler._check.get = (reqProperties, callback) => {
    const checkId = handler._validations.checkId(reqProperties)
    const phone = handler._validations.phone(reqProperties)
    const tokenId = handler._validations.tokenId(reqProperties)

    if(checkId){
        data.read('checks', checkId, (err, check) => {
            if(!err && check){
                tokenHandler._tokens.verify(tokenId, phone, (tokenIsvalid) => {
                    if(tokenIsvalid){
                        callback(404, {
                            data: parseJSON(check)
                        })
                    }else{
                        callback(401, {
                            error: 'Token is not valid'
                        })
                    }
                })
            }else{
                callback(404, {
                    error: 'Check not found'
                })
            }
        })
    }else{
        callback(400, {
            error: 'Unauthenticated'
        })
    }
}

handler._check.put = (reqProperties, callback) => {
    handler._check._putOrPatch(reqProperties, callback)
}

handler._check.patch = (reqProperties, callback) => {
    handler._check._putOrPatch(reqProperties, callback)
}

handler._check._putOrPatch = (reqProperties, callback) => {
}

handler._check.delete = (reqProperties, callback) => {
}

handler._validations = {}

handler._validations.protocol = (reqProperties) => {
    return typeof reqProperties.body.protocol === 'string' && ['http', 'http'].indexOf(reqProperties.body.protocol) > -1
           ? reqProperties.body.protocol
           : false
}

handler._validations.url = (reqProperties) => {
    return typeof reqProperties.body.url === 'string' && reqProperties.body.url.trim().length > 0
           ? reqProperties.body.url
           : false
}

handler._validations.method = (reqProperties) => {
    return typeof reqProperties.body.method === 'string' && ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].indexOf(reqProperties.body.method) > -1
           ? reqProperties.body.method
           : false
}

handler._validations.successCodes = (reqProperties) => {
    return typeof reqProperties.body.successCodes === 'object' && reqProperties.body.successCodes instanceof Array
           ? reqProperties.body.successCodes
           : false
}

handler._validations.timeoutSeconds = (reqProperties) => {
    return typeof (reqProperties.body.timeoutSeconds === 'number'
           &&
           reqProperties.body.timeoutSeconds % 1 === 0
           &&
           reqProperties.body.timeoutSeconds >= 1
           &&
           reqProperties.body.timeoutSeconds <= 5)
           ? reqProperties.body.timeoutSeconds
           : false
}

handler._validations.tokenId = (reqProperties) => {
    return typeof reqProperties.body.tokenId === 'string'
           ? reqProperties.body.tokenId
           : false
}

handler._validations.phone = (reqProperties) => {
    return (typeof reqProperties.body.phone === 'string') && (reqProperties.body.phone.trim().length === 11)
            ? reqProperties.body.phone
            : false
}

handler._validations.checkId = (reqProperties) => {
    return typeof reqProperties.body.checkId === 'string'
           ? reqProperties.body.checkId
           : false
}

module.exports = handler