const express = require('express')
const {
    register,
    login,
    protect,
    restrictTo,
    forgotPassword,
    resetPassword,
    updatePassword,
    updateMe,
    deleteMe,
} = require('../controllers/authController')
const {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    followUser,
    unfollowUser,
    getMe,
} = require('../controllers/userController')
const router = express.Router()

router.route('/register').post(register)
router.route('/login').post(login)

router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password/:token').patch(resetPassword)

// protect
router.use(protect)

router.route('/update-password').patch(updatePassword)
router.route('/update-me').patch(updateMe)
router.route('/delete-me').delete(deleteMe)

router.route('/me').get(getMe, getUser)

router.route('/follow').post(followUser)
router.route('/unfollow').post(unfollowUser)

// permission for admin
router.use(restrictTo('admin'))

router.route('/').get(getAllUsers).post(createUser)
router.route('/:slug').get(getUser).patch(updateUser)
router.route('/:id').delete(deleteUser)

module.exports = router
