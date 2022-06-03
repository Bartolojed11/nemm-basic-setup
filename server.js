const mongoose = require('mongoose')
const dotenv = require('dotenv')


// This will handle all uncaughtException
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION')
    console.log(err.name, err.message)

    process.exit(1)
})

dotenv.config({
    path: './config.env'
})

const app = require('./app')



// For deprecation purposes
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log('connected to database')
})


// dotenv => npm install dotenv
// it will append the config variables of config.env to process.env

const port = process.env.PORT

const server = app.listen(port, () => {
    console.log(`App running on port ${port}`)
})

// This will handle all unhandled exceptions (eg) Async without catch
process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message)
    console.log('UNHANDLED EXCEPTION')
    // Close the server first before exit()
    // This way, it lets the server finish all the requests before shutting down
    server.close(() => {
        // 1 is for unhandled rejection
        process.exit(1)
    })
})