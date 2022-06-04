const express = require('express')

const tourController = require('../controllers/TourController')
const authController = require('../controllers/AuthController')

// router is called mounting the router
const router = express.Router()


// route aliasing
router
  .route('/top-cheapest-tours')
  .get(tourController.topCheapestTours, tourController.getTours)
/**
 * This should be the place where checking params will happen
 * Checking of valid params should not be handled by the controller because it will go against
 * the standard of express
 */

// router.param('id', tourController.checkId)

/**
 * .post(tourController.checkBody, tourController.createTour) => This is called method middleware chaining
 * first param of post is the middleware checker
 * the last params is the route
 * 
 * ------------------------------------------------------------
 * This router will be equivalent to /api/v1/tours or route specified on app.use()
 */
router
  .route('/')
  .get(authController.protect, tourController.getTours)
  .post(
    // tourController.checkBody,
    // tourController.checkPrice,
    tourController.createTour
  )

/**
 * For some reason, this method will only work before /:id
 * https://stackoverflow.com/questions/61229252/cast-to-objectid-failed-for-value-at-path-id-for-model-modelname
 * TODO: Find the additional reason for this
 */
router.route('/tour-stats').get(tourController.getTourStats)
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)


router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour)

// For optional parameters, check :cityId
router.get('/:id/city/:cityId?', tourController.getTourInACity)

module.exports = router
