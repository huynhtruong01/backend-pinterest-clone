const express = require('express')
const { protect, restrictTo } = require('../controllers/authController')
const {
    getAllPins,
    createPin,
    getPin,
    updatePin,
    deletePin,
    savePin,
    unsavePin,
    likePin,
    unlikePin,
} = require('../controllers/pinController')
const router = express.Router()

// protect
router.use(protect)

router.route('/save').post(savePin)
router.route('/unsave').post(unsavePin)

router.route('/like').post(likePin)
router.route('/unlike').post(unlikePin)

router.route('/').get(getAllPins).post(createPin)
router.route('/:slug').get(getPin).patch(updatePin)

// permission for admin
router.use(restrictTo('admin'))

router.route('/:id').delete(deletePin)

module.exports = router
