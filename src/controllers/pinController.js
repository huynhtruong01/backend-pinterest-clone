const multer = require('multer')
const Pin = require('../models/pinModel')
const User = require('../models/userModel')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')
const { getAll, getOne, createOne, updateOne, deleteOne } = require('./handleFactory')
const sharp = require('sharp')

// upload image for pin: image
const storagePin = multer.memoryStorage()
const multerFilterPin = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(
            new AppError(
                'Must not file image to upload. Please choose image to upload.',
                400
            ),
            false
        )
    }
}

exports.uploadPin = multer({ storage: storagePin, fileFilter: multerFilterPin })

// resize image pin
exports.resizeImagePin = catchAsync(async (req, res, next) => {
    const filename = `pin-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
        .resize(508)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/pins/${filename}`)

    req.body.image = filename
    next()
})

// GET, POST, PATCH, DELETE
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
