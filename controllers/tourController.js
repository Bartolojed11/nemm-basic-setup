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
    return response(res, 500, error.message, 'Error creating tour!')
  }
};

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find()
    return response(res, 200, {}, 'success', tours)
  } catch(error) {
    return response(res, 500, error, 'Error getting tours!')
  }
};

exports.getTourById = async (req, res) => {
  const { id } = req.params;
  try {
    const tour = await Tour.findById(id)
    return response(res, 200, {}, 'success', tour)
  } catch(error) {
    return response(res, 500, error, 'Error getting tours!')
  }
};

exports.getTourInACity = (req, res) => {
  const { id, cityId } = req.params;
};

exports.deleteTour = async (req, res) => {
  const { id } = req.params;

  try {
    const tour = await Tour.findByIdAndDelete(id);
    return response(res, 204, 'Tour deleted successfully!', 'success')
  } catch (error) {
    return response(res, 500, error, 'Failed to delete tour!')
  }
};

exports.updateTour = async (req, res) => {
  const { id } = req.params;

  try {
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true
    });

    // new : true means that it will return the updated tour

    return response(res, 200, 'Tour updated successfully!', 'success', tour)
  } catch (error) {
    return response(res, 500, error, 'Error updating tours')
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

const response = (res, statusCode = 200, message = {}, status = 'success', data = {}) => {
  let responseBody = {
    status: status
  }

  if (message.length > 0) {
    responseBody.message = message
  }

  /**
   * https://www.samanthaming.com/tidbits/94-how-to-check-if-object-is-empty/
   * Object.keys(data).length !== 0 && data.constructor !== Object
   * Will check if object is empty
   */

  if (statusCode === 200 && (Object.keys(data).length !== 0 && data.constructor !== Object)) {
    const tourData = {
     'tours' : data
    }
    responseBody.data = tourData
  }

  return res.status(statusCode).send(responseBody);
}