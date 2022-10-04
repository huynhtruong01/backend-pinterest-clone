const User = require('../models/userModel')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')
const { getAll, getOne, createOne, updateOne, deleteOne } = require('./handleFactory')

exports.getAllUsers = getAll(User)

exports.getUser = getOne(User)

exports.createUser = createOne(User)

exports.updateUser = updateOne(User)

exports.deleteUser = deleteOne(User)

// follow
exports.followUser = catchAsync(async (req, res, next) => {
    // followers
    const user = await User.findByIdAndUpdate(
        req.body.pinUserId,
        {
            $set: {
                followers: {
                    $push: req.body.userId,
                },
                $inc: {
                    numFollowers: 1,
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )

    // following
    const newUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                followings: {
                    $push: req.body.pinUserId,
                },
                $inc: {
                    numFollowings: 1,
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )

    if (!user || !newUser) return next(new AppError('Not found data with ID.'))

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser,
        },
    })
})

// unfollow
exports.unfollowUser = catchAsync(async (req, res, next) => {
    // followers
    const user = await User.findByIdAndUpdate(
        req.body.pinUserId,
        {
            $set: {
                followers: {
                    $pull: req.body.userId,
                },
                $inc: {
                    numFollowers: -1,
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )

    // following
    const newUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                followings: {
                    $pull: req.body.pinUserId,
                },
                $inc: {
                    numFollowings: -1,
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )

    if (!user || !newUser) return next(new AppError('Not found data with ID.'))

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser,
        },
    })
})

// get me
exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ slug: req.user.slug })
    if (!user) return next(new AppError('Not found data with ID.', 404))

    req.params.slug = req.user.slug
    next()
})
