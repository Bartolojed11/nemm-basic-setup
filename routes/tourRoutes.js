const express = require('express')
// router is called mounting the router
const router = express.Router()
const tourController = require('./../controllers/tourController')

/**
 * This should be the place where checking params will happen
 * Checking of valid params should not be handled by the controller because it will go against
 * the standard of express
 */

router.param('id', tourController.checkId)

// because of router, this will be equivalent to /api/v1/tours
router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        // tourController.checkBody,
        // tourController.checkPrice,
        tourController.createTour
    )

    /**
    * .post(tourController.checkBody, tourController.createTour) => This is called method middleware chaining
    * first param of post is the middleware checker
    * the last params is the route
    */

router
    .route('/:id')
    .get(tourController.getTourById)
    .delete(tourController.deleteTour)
    .patch(tourController.updateTour)

// For optional parameters, check :cityId
router
.get('/:id/city/:cityId?', tourController.getTourInACity)

module.exports = router