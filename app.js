const express = require('express')
const res = require('express/lib/response')
const morgan = require('morgan')

const app = express()

// Middlewares
// morgan > Will log the endpoint on console or terminal and how long a response is sent back
// NODE_ENV is accessible here because it's on server.js and it only needs to run once
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(express.json()) //middleware
// it stands between middle of request and response
// express.json() middle ware, adds body to the request containing the request data

app.use((req, res, next) => {
    // req and res, is needed here
    // console.log('custom route!!!')
    next()
    // next() is used here so that it will process the next middlewares
})

app.use((req, res, next) => {
    req.requestTimeout = new Date().toISOString()
    // requestTimout can be accessed using req on any route after this middleware
    next()
    // next() is used here so that it will process the next middlewares
})

// Homepage
app.get('/', (req, res) => {
    res.status(200).send({
        message: "Hello from the home page",
        app: "natours"
    })
})

/**
 * routes => mounting routes
 * tourRoutes is called tourRoutes because it's inside routes (Convention)
 */
const tourRouter = require('./routes/tourRoutes')
app.use('/api/v1/tours', tourRouter)

module.exports = app