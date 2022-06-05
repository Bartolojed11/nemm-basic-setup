const mongoose = require('mongoose')
const slugify = require('slugify')

const TourSchema = mongoose.Schema({
  price: {
    type: Number,
    required: [true, 'A Tour must have a price'],
  },
  priceDiscount: {
    type: Number,
    default: 0,
    validate: {
      validator: function (priceDisc) {
        /**
         * return True : Passed
         * return False : Failed
         * ({VALUE}) : This is internal to mongoose, it is the inputted value
         * "this" will only be availble on create, and not on update
         */
        return priceDisc < this.price
      },
      message: 'Price Discount ({VALUE}) should be less than the regular price',
    }
  },
  name: {
    type: String,
    required: [true, 'A Tour must have a name'],
    unique: true,
    maxlength: [255, 'A Tour must have a maximum length of 255 characters'],
    minlength: [10, 'A Tour must have a minimum length of 5 characters'],
  },
  slug: {
    type: String,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  images: [String],
  duration: {
    required: true,
    type: Number,
  },
  maxGroupSize: {
    required: true,
    type: Number,
  },
  difficulty: {
    type: String,
    required: true,
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either easy, medium or difficult',
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0']
    // select: false
    // select: false means this should not be included on result set
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  summary: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageCover: {
    type: String,
    required: true,
  },
  startDates: {
    required: true,
    type: [Date],
  },
  secretTour: {
    type: Boolean,
    default: false
  },
  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  // Embed
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]
}, {
  // Means it should show the virtuals when having a json and object result
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

// virtual is a bit like the view on MySql Database
// Virtual can't be queried, (eg) Tour.find().where('durationWeeks', 1)
TourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7
})

/**
 * Document Middleware start : runs before/after of .save() and .create() but not on .insertMany()
 * Document Middleware are like Observers in Laravel
 * 'save' is called a hook
 */
TourSchema.pre('save', function (next) {
  console.log(this)
  this.slug = slugify(this.name, { lower: true })
  next()
})

// Loding reference relationship for every find query
TourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -name' // means to exlude on response
  })

  next()
})

TourSchema.post('save', function (doc, next) {
  next()
})
// Document Middleware end

/**
 * Query Middleware : Runs before/after a query hook is executed
 * /^find/ : Regexp means it will match all query that start with find
 * (eg) : findById, findOn
 */
TourSchema.pre(/^find/, function (next) {
  // This here now returns the query object, so we can append a new query
  this.find().where('secretTour').ne(true)
  next()
})




const Tour = mongoose.model('Tour', TourSchema)

module.exports = Tour
