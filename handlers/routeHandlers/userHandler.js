// Dependencies
const data = require('../../lib/data')
const { hash, parseJSON } = require('../../helpers/utilities')
const tokenHandler = require('./tokenHandler')

// Module scaffolding
const handler = {}

handler.userHandler = (reqProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'patch', 'delete']

    if(acceptedMethods.indexOf(reqProperties.method) > -1){
        handler._users[reqProperties.method](reqProperties, callback)
    }else{
        callback(405)
    }
}

handler._users = {}

handler._users.post = (reqProperties, callback) => {

    const firstName = handler._validations.firstName(reqProperties)
    const lastName = handler._validations.lastName(reqProperties)
    const phone = handler._validations.phone(reqProperties)
    const password = handler._validations.password(reqProperties)
    const tos = handler._validations.tos(reqProperties)

    if(firstName && lastName && phone && password && tos){
        data.read('users', phone, (err, user) => {
            if(err){
                let userObj = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tos
                }
                // store the user to db
                data.create('users', phone, userObj, (err) => {
                    if(!err){
                        callback(200, {
                            data: "User created successfully"
                        })
                    }else{
                        callback(500, {
                            error: 'Could not create user!'
                        })
                    }
                })
            }else{
                callback(500, {
                    error: 'User already exist!'
                })
            }
        })
    }else{
        callback(400, {
            error: 'Input is not correct'
        })
    }
}

handler._users.get = (reqProperties, callback) => {
    // check the phone if valid or not
    const phone = handler._validations.phone(reqProperties)

    if(phone){
        // verify token
        let token = typeof reqProperties.body.tokenId === 'string' ? reqProperties.body.tokenId : false

        tokenHandler._tokens.verify(token, phone, (validToken) => {
            if(validToken){
                data.read('users', phone, (err, user) => {
                    if(!err && user){
                        let userObj = parseJSON(user)
                            delete userObj.password
                        callback(200, {
                            data: userObj
                        })
                    }else{
                        callback(404, {
                            error: 'User not exist!'
                        })
                    }
                })
            }else{
                callback(403, {
                    error: 'Unauthenticated'
                })
            }
        })
    }else{
        callback(404, {
            error: "Phone number is not valid"
        })
    }
}

handler._users.put = (reqProperties, callback) => {
    handler._users._putOrPatch(reqProperties, callback)
}

handler._users.patch = (reqProperties, callback) => {
    handler._users._putOrPatch(reqProperties, callback)
}

handler._users._putOrPatch = (reqProperties, callback) => {
    const phone = handler._validations.phone(reqProperties)
    const firstName = handler._validations.firstName(reqProperties)
    const lastName = handler._validations.lastName(reqProperties)
    const password = handler._validations.password(reqProperties)

    if((firstName || lastName || password) && phone){
        data.read('users', phone, (err, user) => {
            if(!err && user){
                let userObj = parseJSON(user)
                if(firstName) userObj.firstName = firstName
                if(lastName) userObj.lastName = lastName
                if(password) userObj.password = hash(password)

                let token = typeof reqProperties.body.tokenId === 'string' ? reqProperties.body.tokenId : false

                tokenHandler._tokens.verify(token, phone, (validToken) => {
                    if(validToken){
                        // update
                        data.update('users', phone, userObj, (err) => {
                            if(!err){
                                delete userObj.password
                                callback(200, {
                                    data: userObj
                                })
                            }else{
                                callback(405, {
                                    data: 'Failed to update user!'
                                })
                            }
                        })
                    }else{
                        callback(403, {
                            error: 'Unauthenticated'
                        })
                    }
                })

            }else{
                callback(500, {
                    error: 'User not exist!'
                })
            }
        })
    }else{
        callback(400, {
            error: 'Input is not correct'
        })
    }
}

handler._users.delete = (reqProperties, callback) => {
    // check the phone if valid or not
    const phone = handler._validations.phone(reqProperties)

    if(phone){
        data.read('users', phone, (err, user) => {
            if(!err && user){

                let token = typeof reqProperties.body.tokenId === 'string' ? reqProperties.body.tokenId : false

                tokenHandler._tokens.verify(token, phone, (validToken) => {
                    if(validToken){
                        // delete
                        data.delete('users', phone, (err) => {
                            if(err){
                                callback(200, {
                                    data: 'User deleted successfully'
                                })
                            }else{
                                callback(500, {
                                    data: 'Failed to delete the user'
                                })
                            }
                        })
                    }else{
                        callback(403, {
                            error: 'Unauthenticated'
                        })
                    }
                })

            }else{
                callback(404, {
                    error: 'User not exist!'
                })
            }
        })
    }else{
        callback(404, {
            error: "Phone number is not valid"
        })
    }
}

handler._validations = {}

handler._validations.firstName = (reqProperties) => {
    return (typeof reqProperties.body.firstName === 'string') && (reqProperties.body.firstName.trim().length > 0)
            ? reqProperties.body.firstName
            : false
}

handler._validations.lastName = (reqProperties) => {
    return (typeof reqProperties.body.lastName === 'string') && (reqProperties.body.lastName.trim().length > 0)
            ? reqProperties.body.lastName
            : false
}

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

handler._validations.tos = (reqProperties) => {
    return (typeof reqProperties.body.tos === 'boolean') && (reqProperties.body.tos === true)
            ? reqProperties.body.tos
            : false
}

module.exports = handler