const mongoose = require('mongoose')

const TourSchema = mongoose.Schema({
    price : {
        type : Number,
        required : [true, "A Tour must have a price"]
    },
    name : {
        type : String,
        required : [true, "A Tour must have a name"],
        unique : true,
    },
    rating : {
        type : Number,
        default : 4.5
    }
})

const Tour = mongoose.model('Tour', TourSchema)


module.exports = Tour
