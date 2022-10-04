const Pin = require('../models/pinModel')
const User = require('../models/userModel')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')
const { getAll, getOne, createOne, updateOne, deleteOne } = require('./handleFactory')

exports.getAllPins = getAll(Pin)

exports.getPin = getOne(Pin)

exports.createPin = createOne(Pin)

exports.updatePin = updateOne(Pin)

exports.deletePin = deleteOne(Pin)

// save pin
exports.savePin = catchAsync(async (req, res, next) => {
    const newUser = await User.findByIdAndUpdate(
        req.body.userId,
        {
            $set: {
                saves: {
                    $push: req.body.pinId,
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )

    if (!newUser) return next(new AppError('Not found data with ID.'))

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser,
        },
    })
})

// unsave pin
exports.unsavePin = catchAsync(async (req, res, next) => {
    const newUser = await User.findByIdAndUpdate(
        req.body.userId,
        {
            $set: {
                saves: {
                    $pull: req.body.pinId,
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )

    if (!newUser) return next(new AppError('Not found data with ID.'))

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser,
        },
    })
})

// like pin
exports.likePin = catchAsync(async (req, res, next) => {
    const newPin = await Pin.findByIdAndUpdate(
        req.body.pinId,
        {
            $set: {
                likes: {
                    $push: req.body.userId,
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )

    if (!newPin) return next(new AppError('Not found data with ID'))

    res.status(201).json({
        status: 'success',
        data: {
            pin: newPin,
        },
    })
})

// unlike pin
exports.unlikePin = catchAsync(async (req, res, next) => {
    const newPin = await Pin.findByIdAndUpdate(
        req.body.pinId,
        {
            $set: {
                likes: {
                    $pull: req.body.userId,
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )

    if (!newPin) return next(new AppError('Not found data with ID'))

    res.status(201).json({
        status: 'success',
        data: {
            pin: newPin,
        },
    })
})
