const Tour  = require('./../models/tourModel')

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

exports.checkPrice = (req, res, next) => {
  const { price } = req.body
  
  if (typeof price != 'number' && isNaN(price)) {
    return res.status(400).json({
      "status" : "error",
      "message": "Price should be a decimal or an integer."
    })
  }
  next()
}

exports.createTour = async (req, res) => {
  try {
    // No need to manually assign key value pairs, columns not declared on schema will not be saved.
    const tour =  await Tour.create(req.body)

    return response(res, 200, 'Tour created successfully!', 'success', tour)
  } catch (error) {    
    return response(res, 500, error, 'Error creating tour!')
  }
};

exports.getAllTours = (req, res) => {

};

exports.getTourById = (req, res) => {
  const { id } = req.params;

};

exports.getTourInACity = (req, res) => {
  const { id, cityId } = req.params;
};

exports.deleteTour = (req, res) => {
  const { id } = req.params;
};

exports.updateTour = (req, res) => {
  const { id } = req.params;
};

exports.checkId = (req, res, next, val) => {
  if (isNaN(val)) {
   return res.status(500).json({
       'message' : 'Invalid ID. ID must be an integer'
   })
  }
   next()
}

const response = (res, statusCode = 200, message, status = 'success', data = {}) => {
  let responseBody = {
    status: status,
    message: message
  }

  if (statusCode === 200) {
    let tourData = {
      'tour' : data
    }
    responseBody.data = tourData
  }

  return res.status(statusCode).send(responseBody);
}