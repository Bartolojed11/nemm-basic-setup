const Tour = require('./../models/tourModel');

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
  req.query.sort = '-price'
  next()
}

exports.checkPrice = (req, res, next) => {
  const { price } = req.body;

  if (typeof price != 'number' && isNaN(price)) {
    return res.status(400).json({
      status: 'error',
      message: 'Price should be a decimal or an integer.',
    });
  }
  next();
};

exports.createTour = async (req, res) => {
  try {
    // No need to manually assign key value pairs, columns not declared on schema will not be saved.
    const tour = await Tour.create(req.body);

    return response(res, 200, 'Tour created successfully!', 'success', tour);
  } catch (error) {
    return response(res, 500, error.message, 'Error');
  }
};

exports.getTours = async (req, res) => {
  console.log(req.query)
  try {
    let query = Tour
    let hasFilter = false

    if (req.query.name) {
      hasFilter = true
      query = query.where('name', req.query.name)
    }

    if (req.query.difficulty) {
      hasFilter = true
      query = query.where('difficulty', req.query.difficulty)
    }

    if (req.query.duration) {
      hasFilter = true
      query = query.where('duration').gte(req.query.duration)
    }

    /**
     * If no where clause or find({}), it will throw an error for the code below the query.find({}).
     * With this, it will prevent it and run the query as intended.
     */
    if (! hasFilter) {
      query = query.find({})
    }
    
    /**
     * This getting of selected fields only should be after where clauses
     * To exlclude some fields, append minus on the column
     * (eg) -__v
     * -__v is used by mongoose
     */
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ')
      query = query.select(fields)
    } else {
      query = query.select('-__v')
    }

    /**
     * To sort descending, just append a minus sign on the column
     * (eg) sort=-price
     * */

    if (req.query.sort) {
      /**
       * For sorting multiple columns
       * On the payload, it should be like this: sort=-price,ratingsAverage
       */
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy)
    }

    // Pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || process.env.PAGINATION_LIMIT

    // Index starts at 0, so we need to -1
    const skip = (page - 1) * limit
    query = query.skip(skip).limit(limit)

    if (req.query.page) {
      let tourPagesCount = await Tour.countDocuments()
      
      tourPagesCount = tourPagesCount / process.env.PAGINATION_LIMIT
      tourPagesCount = Math.ceil(tourPagesCount)
      if (page > tourPagesCount) {
        throw new Error("This page doesn't exist")
      }
    }

    const tours = await query;

    return response(res, 200, {}, 'success', tours);
  } catch (error) {
    console.log(error.message)
    return response(res, 500, error, 'Error');
  }
};

exports.getTourById = async (req, res) => {
  const { id } = req.params;
  try {
    const tour = await Tour.findById(id);
    return response(res, 200, {}, 'Success', tour);
  } catch (error) {
    return response(res, 500, error, 'Error');
  }
};

exports.getTourInACity = (req, res) => {
  const { id, cityId } = req.params;
};

exports.deleteTour = async (req, res) => {
  const { id } = req.params;

  try {
    const tour = await Tour.findByIdAndDelete(id);
    return response(res, 204, 'Tour deleted successfully!', 'success');
  } catch (error) {
    return response(res, 500, error, 'Error');
  }
};

exports.updateTour = async (req, res) => {
  const { id } = req.params;

  try {
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    // new : true means that it will return the updated tour

    return response(res, 200, 'Tour updated successfully!', 'success', tour);
  } catch (error) {
    return response(res, 500, error, 'Error');
  }
};

// exports.checkId = (req, res, next, val) => {
//   if (isNaN(val)) {
//    return res.status(500).json({
//        'message' : 'Invalid ID. ID must be an integer'
//    })
//   }
//    next()
// }

const response = (
  res,
  statusCode = 200,
  message = {},
  status = 'success',
  data = {}
) => {
  let responseBody = {
    status: status,
  };

  if (message.length > 0) {
    responseBody.message = message;
  }

  /**
   * https://www.samanthaming.com/tidbits/94-how-to-check-if-object-is-empty/
   * Object.keys(data).length !== 0 && data.constructor !== Object
   * Will check if object is empty
   */

  if (
    statusCode === 200 &&
    Object.keys(data).length !== 0 &&
    data.constructor !== Object
  ) {
    const tourData = {
      tours: data,
    };
    responseBody.results = data.length;
    responseBody.data = tourData;
  }

  return res.status(statusCode).send(responseBody);
};
