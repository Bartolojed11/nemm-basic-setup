const mongoose = require('mongoose');

const TourSchema = mongoose.Schema({
  price: {
    type: Number,
    required: [true, 'A Tour must have a price'],
  },
  name: {
    type: String,
    required: [true, 'A Tour must have a name'],
    unique: true,
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
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    // select: false
    // select: false means this should not be included on result set
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  summary : {
    type: String,
    required: true,
  },
  description : {
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
  }
}, {
  // Means it should show the virtuals when having a json and object result
  toJSON: { virtuals: true},
  toObject: { virtuals: true},
});

// virtual is a bit like the view on MySql Database
// Virtual can't be queried, (eg) Tour.find().where('durationWeeks', 1)
TourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
})

const Tour = mongoose.model('Tour', TourSchema);

module.exports = Tour;
