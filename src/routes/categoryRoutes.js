const express = require('express')
const { restrictTo, protect } = require('../controllers/authController')
const {
    getAllCategories,
    createCategory,
    getCategory,
    deleteCategory,
    updateCategory,
} = require('../controllers/categoryController')
const router = express.Router()

// protect
router.use(protect)

router.route('/').get(getAllCategories)
router.route('/:slug').get(getCategory)

// permission for admin
router.use(restrictTo('admin'))

router.route('/').post(createCategory)
router.route('/:slug').patch(updateCategory)
router.route('/:id').delete(deleteCategory)

module.exports = router
