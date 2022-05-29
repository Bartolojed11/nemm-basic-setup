const mongoose = require('mongoose')
const dotenv = require('dotenv')

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

app.listen(port, () => {
    console.log(`App running on port ${port}`)
})

