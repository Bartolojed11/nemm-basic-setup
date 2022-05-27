const mongoose = require('mongoose')
const fs = require('fs')
const dotenv = require('dotenv')

dotenv.config({
    path: './config.env'
})

mongoose.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log('connected to database')
})

let Tour = require(`${__dirname}/models/tourModel`)

let tourData = fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf8')
tourData = JSON.parse(tourData)

const importData = async () => {
    try {
        await Tour.create(tourData)
        console.log('created')
        process.exit() // force exit
    } catch (err) {
        console.log(err)
    }
}

const deleteData = async () => {
    try {
        await Tour.deleteMany()
        console.log('deleted')
        process.exit() // force exit
    } catch (err) {
        console.log(err)
    }
}

// Command line
// node import-dev.js --import
console.log(process.argv[2])
if (process.argv[2] == '--import') {
    importData()
} else if (process.argv[2] == '--delete') {
    deleteData()
}

console.log(process.argv)