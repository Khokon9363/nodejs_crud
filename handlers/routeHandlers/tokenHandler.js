// Dependencies
const data = require('../../lib/data')
const { hash, parseJSON, randStr } = require('../../helpers/utilities')

// Module scaffolding
const handler = {}

handler.tokenHandler = (reqProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'patch', 'delete']

    if(acceptedMethods.indexOf(reqProperties.method) > -1){
        handler._tokens[reqProperties.method](reqProperties, callback)
    }else{
        callback(405)
    }
}

handler._tokens = {}

handler._tokens.post = (reqProperties, callback) => {

    const phone = handler._validations.phone(reqProperties)
    const password = handler._validations.password(reqProperties)

    if(phone && password){
        data.read('users', phone, (err, user) => {
            if(!err && user){
                if(hash(password) === parseJSON(user).password){
                    let tokenId = randStr(20)
                    let expired = Date.now() + (60 * 60 * 1000)
                    let tokenObj = {tokenId, phone, expired}
                    data.create('tokens', tokenId, tokenObj, (err) => {
                        if(!err){
                            callback(200, {
                                data: "Token created successfully"
                            })
                        }else{
                            callback(500, {
                                data: "failed to create token"
                            })
                        }
                    })
                }else{
                    callback(500, {
                        error: 'Password does not matched!'
                    })
                }
            }else{
                callback(500, {
                    error: 'User does not exist!'
                })
            }
        })
    }else{
        callback(400, {
            error: 'Input is not correct'
        })
    }
}

handler._tokens.get = (reqProperties, callback) => {
    // check the tokenId if valid or not
    const tokenId = handler._validations.tokenId(reqProperties)

    if(tokenId){
        data.read('tokens', tokenId, (err, token) => {
            if(!err && token){
                callback(200, {
                    data: parseJSON(token)
                })
            }else{
                callback(404, {
                    error: 'Token id is not exist!'
                })
            }
        })
    }else{
        callback(404, {
            error: "token id is not valid"
        })
    }
}

handler._tokens.put = (reqProperties, callback) => {
    handler._tokens._putOrPatch(reqProperties, callback)
}

handler._tokens.patch = (reqProperties, callback) => {
    handler._tokens._putOrPatch(reqProperties, callback)
}

handler._tokens._putOrPatch = (reqProperties, callback) => {
    const tokenId = handler._validations.tokenId(reqProperties)
    const extend = handler._validations.extend(reqProperties)

    if(tokenId && extend){
        data.read('tokens', tokenId, (err, token) => {
            let tokenObj = parseJSON(token)
            if(tokenObj.expired > Date.now()){
                // update
                tokenObj.expired = Date.now() + (60 * 60 * 1000)
                data.update('tokens', tokenId, tokenObj, (err) => {
                    if(!err){
                        callback(200, {
                            data: tokenObj
                        })
                    }else{
                        callback(405, {
                            data: 'Failed to update token!'
                        })
                    }
                })
            }else{
                callback(500, {
                    error: 'Token already expired!'
                })
            }
        })
    }else{
        callback(400, {
            error: 'Input is not correct'
        })
    }
}

handler._tokens.delete = (reqProperties, callback) => {
    // check the phone if valid or not
    const tokenId = handler._validations.tokenId(reqProperties)

    if(tokenId){
        data.read('tokens', tokenId, (err, token) => {
            if(!err && token){
                data.delete('tokens', tokenId, (err) => {
                    if(err){
                        callback(200, {
                            data: 'Token deleted successfully'
                        })
                    }else{
                        callback(500, {
                            data: 'Failed to delete the token'
                        })
                    }
                })
            }else{
                callback(404, {
                    error: 'Token not exist!'
                })
            }
        })
    }else{
        callback(404, {
            error: "Phone number is not valid"
        })
    }
}

handler._tokens.verify = (tokenId, phone, callback) => {
    data.read('tokens', tokenId, (err, token) => {
        if(!err && token){
            if(parseJSON(token).phone === phone && parseJSON(token).expired > Date.now()){
                callback(true)
            }
            else{
                callback(false)
            }
        }else{
            callback(false)
        }
    })
}

handler._validations = {}

handler._validations.phone = (reqProperties) => {
    return (typeof reqProperties.body.phone === 'string') && (reqProperties.body.phone.trim().length === 11)
            ? reqProperties.body.phone
            : false
}

handler._validations.password = (reqProperties) => {
    return (typeof reqProperties.body.password === 'string') && (reqProperties.body.password.trim().length > 0)
            ? reqProperties.body.password
            : false
}

handler._validations.tokenId = (reqProperties) => {
    return (typeof reqProperties.body.tokenId === 'string') && (reqProperties.body.tokenId.trim().length === 20)
            ? reqProperties.body.tokenId
            : false
}

handler._validations.extend = (reqProperties) => {
    return (typeof reqProperties.body.extend === 'boolean') && (reqProperties.body.extend === true)
            ? reqProperties.body.extend
            : false
}

module.exports = handler