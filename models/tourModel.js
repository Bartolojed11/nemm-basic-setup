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
});

const Tour = mongoose.model('Tour', TourSchema);

module.exports = Tour;
