// Dependencies
const crypto = require('crypto')
const environments = require('../helpers/environments')

// Module scaffolding
const utilities = {}

// parse JSON string to object
utilities.parseJSON = (jsonString) => {
    let output = {}

    try {
        output = JSON.parse(jsonString)
    } catch (error) {
        output = {}
    }
    return output
}

// hash a string to password
utilities.hash = (str) => {
    if(typeof(str) === 'string' && str.length > 0){
        const hash = crypto.createHmac('sha256', environments.secretKey)
                           .update(str)
                           .digest('hex')
        return hash
    }else{
        return false
    }
}

// create random string
utilities.randStr = (strLength) => {
    let length = typeof strLength === 'number' && strLength > 0 ? strLength : false

    if(length){
        const psblCharacter = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let output = ''

        for (let i = 0; i < length; i++) {
            output += psblCharacter.charAt(Math.floor(Math.random() * psblCharacter.length))
        }
        return output
    }else{
        return false
    }
}

// Export module
module.exports = utilities