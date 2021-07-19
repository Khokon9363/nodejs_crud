// Dependencies

// Module scaffolding
const environments = {}

environments.staging = {
    PORT: 3000,
    envName: 'staging',
    secretKey: '01234',
    maxChecks: 5
}

environments.production = {
    PORT: 5000,
    envName: 'production',
    secretKey: '56789',
    maxChecks: 10
}

// determine which environment was passed
const currentEnvvironment = (typeof(process.env.NODE_ENV) === 'string') ? process.env.NODE_ENV : 'staging'

// Export corresponding environment object
const environmentToExport = (typeof(environments[currentEnvvironment])) === 'object' ? environments[currentEnvvironment] : environments.staging


// Export module
module.exports = environmentToExport