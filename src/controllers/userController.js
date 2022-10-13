const User = require('../models/userModel')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')
const {
    getAll,
    createOne,
    deleteOne,
    getOneBySlug,
    updateOneBySlug,
} = require('./handleFactory')
const multer = require('multer')
const sharp = require('sharp')

// upload image for user: avatar
const storageUser = multer.memoryStorage()
const multerFilterUser = (req, file, cb) => {
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

exports.uploadUser = multer({ storage: storageUser, fileFilter: multerFilterUser })

// resize avatar user
exports.resizeUser = catchAsync(async (req, res, next) => {
    // image avatar
    if (req.files.avatar) {
        const filenameAvatar = `user-${req.user.id}-${Date.now()}.jpeg`
        await sharp(req.files.avatar[0].buffer)
            .resize(280, 280)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/images/users/avatar/${filenameAvatar}`)

        req.body.avatar = filenameAvatar
    }

    // image avatar cover
    if (req.files.avatarCover) {
        const filenameAvatarCover = `user-${req.user.id}-${Date.now()}-cover.jpeg`
        await sharp(req.files.avatarCover[0].buffer)
            .resize(656, 370)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/images/users/avatar-cover/${filenameAvatarCover}`)

        req.body.avatarCover = filenameAvatarCover
    }

    next()
})

// GET, POST, PATCH, DELETE
exports.getAllUsers = getAll(User)

exports.getUser = getOneBySlug(User)

exports.createUser = createOne(User)

exports.updateUser = updateOneBySlug(User)

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
    const user = await User.findById(req.user.id)
    if (!user) return next(new AppError('Not found data with ID.', 404))

    req.params.slug = req.user.slug
    next()
})
