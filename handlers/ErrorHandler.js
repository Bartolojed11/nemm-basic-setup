const AppError = require('./../handlers/AppError')

const sendDevErrors = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendProdErrors = (err, res) => {
    // Operational error
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    } else {
        // Programming or other unknown error
        console.error('ERROR', err)
        res.status(500).json({
            'status': 'error',
            'message': 'Something went wrong!'
        })
    }
}

const handleCastErrorDB = (err) => {
    // path: where the error occurred
    // value: the value that cause the error
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateDB = (err) => {
    // path: where the error occurred
    // value: the value that cause the error
    const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]
    const message = `Duplicate field value :  ${value}`
    return new AppError(message, 400)
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message)

    const message = `Invalid input data. ${errors.join('. ')}`
    return new AppError(message, 400)
}

const handleJWTError = () => new AppError('Invalid Token', 401)
const handleJWTTokenExpired = () => new AppError('Token Expired!', 401)

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'production') {
        let error = { ...err }

        if (err.name === 'CastError') error = handleCastErrorDB(err)
        if (err.code === 11000) error = handleDuplicateDB(err)
        if (err.name === 'ValidationError') error = handleValidationErrorDB(err)
        if (err.name === 'JsonWebTokenError') error = handleJWTError()
        if (err.name === 'TokenExpiredError') error = handleJWTTokenExpired()

        sendProdErrors(error, res)
    } else {
        sendDevErrors(err, res)
    }
}