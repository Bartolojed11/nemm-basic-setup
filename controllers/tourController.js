const Tour = require('./../models/tourModel')
const Filtering = require('./../helpers/Filtering')
const catchAsync = require('../handlers/CatchAsync')
const AppError = require('../handlers/AppError')

// validator middlewares

// exports.checkBody = (req, res, next) => {
//   const { name, price } = req.body
//   if (name === undefined || price === undefined) {
//     return res.status(400).json({
//       "status": "Error",
//       "message": "Please fill all required fields"
//     })
//   }
//   next()
// }

exports.topCheapestTours = (req, res, next) => {
  req.query.limit = process.env.TOP_CHEAPEST_LIMIT
  req.query.sort = 'price'
  next()
}

exports.checkPrice = (req, res, next) => {
  const { price } = req.body

  if (typeof price != 'number' && isNaN(price)) {
    return res.status(400).json({
      status: 'error',
      message: 'Price should be a decimal or an integer.',
    })
  }
  next()
}

exports.createTour = catchAsync(async (req, res, next) => {

  // No need to manually assign key value pairs, columns not declared on schema will not be saved.
  const tour = await Tour.create(req.body)

  res.status(200).json({
    success: true,
    message: 'Tour created successfully!',
    data: {
      tour
    }
  })
})

exports.getTours = catchAsync(async (req, res, next) => {
  let model = new Filtering(Tour, req).filter().selectedFields().sort()
  let tours = await model.query

  res.status(200).json({
    success: true,
    results: tours.length,
    data: {
      tours
    }
  })
})

exports.getTourById = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const tour = await Tour.findById(id)

  if (!tour) {
    return next(new AppError('No tour found!', 404))
  }

  res.status(200).json({
    success: true,
    data: {
      tour
    }
  })
})

exports.getTourInACity = (req, res) => {
  const { id, cityId } = req.params
}

exports.deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const tour = await Tour.findByIdAndDelete(id)
  if (!tour) {
    return next(new AppError('No tour found!', 404))
  }

  res.status(200).json({
    success: true,
    message: 'Tour deleted successfully!'
  })
})

exports.updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params

  // new : true means that it will return the updated tour
  // runValidators : Means it should apply the validators on the model
  const tour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  })

  if (!tour) {
    return next(new AppError('No tour found!', 404))
  }

  res.status(200).json({
    success: true,
    message: 'Tour updated successfully!',
    data: {
      tour
    }
  })
})

// exports.checkId = (req, res, next, val) => {
//   if (isNaN(val)) {
//    return res.status(500).json({
//        message : 'Invalid ID. ID must be an integer'
//    })
//   }
//    next()
// }

exports.getTourStats = catchAsync(async function (req, res, next) {

  /**
   * aggregate() can be found on mongo db and it supports queries which 
   * are not found on mongoose documentation.
   * (eg) Group, average, etc
   */
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        //_id: null, // we want verything in one group, so null is the value for achieving it
        _id: '$difficulty', // We want to group it by difficulty
        numTours: { $sum: 1 }, // This means add 1 to each documents
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 } // 1 means ascending, -1 means descending.
    },
    // {
    //   $match: { _id: { $ne: 'easy' } } // This will exclude the easy difficulty
    // }
  ])

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

  const year = req.params.year
  /**
   * $unwind: '$startDates' - This will create separate document per value on startDate
   * (eg)
   * From : [{id: 1, startDates : ['Jan 01 2021', 'Feb 01 2021']}]
   * To : [{id: 1, startDates : 'Jan 01 2021'} , {id: 1:, 'Feb 01 2021']}]
   */
  let monthlyPlan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        // $month aggragation will extract month from date
        //  see monggo db documentation
        _id: { $month: '$startDates' },
        // $sum: 1 means add document per group, same as count(id) GROUP BY id of MySql
        //  see monggo db documentation
        numTourStats: { $sum: 1 },
        // $push aggragation will push data to tours, use to have array values
        //  see monggo db documentation
        tours: { $push: '$name' },
      }
    },
    {
      $addFields: { Month: '$_id' }
    },
    {
      // 0 means to not show the _id, 1 means the oposite
      $project: { _id: 0 }
    },
    {
      $sort: {
        numTourStats: -1
      }
    },
    {
      $limit: 6
    }
  ])

  res.status(200).json({
    success: true,
    data: {
      monthlyPlan
    }
  })
})