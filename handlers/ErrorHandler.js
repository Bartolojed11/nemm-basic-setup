const Response = require('./../helpers/Response')

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    console.log(err.stack)
    return new Response(res, err.statusCode, err.message, err.status)
}