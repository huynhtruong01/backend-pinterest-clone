const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')
const { filterObj } = require('../utils/common')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_IN,
    })
}

const checkToken = async (token) => {
    return await jwt.verify(token, process.env.JWT_SECRET)
}

const resTokenData = (user, statusCode, res) => {
    const token = signToken(user._id)

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    })
}

exports.register = catchAsync(async (req, res, next) => {
    // username, firstName, lastName, gender, email, password

    const newUser = await User.create(req.body)
    resTokenData(newUser, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    // 1. check email and password exits
    if (!email || !password) {
        return next(new AppError('Please enter email and password', 400))
    }

    // 2. user exits? and password is correct
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
        return next(new AppError('This user not exits! Please register to login', 404))
    }

    const isCorrect = await user.comparePassword(password, user.password)
    if (!isCorrect) {
        return next(new AppError('Incorrect password! Please try again', 401))
    }

    // 3. if everything ok, send `token` to client
    resTokenData(user, 200, res)
})

exports.protect = catchAsync(async (req, res, next) => {
    // 1. getting token and check token
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    if (!token) {
        return next(new AppError('Token is not exits. Please login again.', 401))
    }

    // 2. check valid token? and user still exits
    const isValidToken = await checkToken(token)
    if (!isValidToken) {
        return next(new AppError('Invalid token! Please login again', 401))
    }

    const user = await User.findById(isValidToken.id)
    if (!user) {
        return next(new AppError('The user is not exits! Please register to login', 401))
    }

    // 3. check user changed password after token is issued
    const isChangePassword = user.changePasswordAfter(isValidToken.iat)
    if (isChangePassword) {
        return next(
            new AppError('User recently change password! Please login again', 401)
        )
    }

    req.user = user

    next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('User can not permission to perform this feature', 403)
            )
        }

        next()
    }
}

// forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
    // check email
    const { email } = req.body
    if (!email) {
        return next(new AppError('Email not input. Please enter email', 401))
    }

    // user is still exits
    const user = await User.findOne({ email })
    if (!user) {
        return next(new AppError('Not found this user', 404))
    }

    // generate token, not JWT and save
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })

    // send email
    const url = `${req.protocol}://${req.get('host')}/api/v1/reset-password/${resetToken}`
    const message = `Please verify here: ${url}`

    try {
        const optionsMail = {
            email: user.email,
            subject: 'Verify email here.',
            text: message,
        }
        await sendEmail(optionsMail)

        res.status(200).json({
            status: 'success',
            message: 'Token send to email.',
        })
    } catch (error) {
        console.log(error)
        user.passwordResetToken = undefined
        user.passwordResetExpire = undefined
        await user.save({ validateBeforeSave: false })

        next(new AppError('Error when send email.', 500))
    }
})

// reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
    // check token and valid token?
    if (!req.params.token) {
        return next(new AppError('Token is not exits.', 401))
    }
    const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    // check user still exits
    const user = await User.findOne({
        passwordResetToken: hashToken,
        passwordResetExpire: {
            $gt: Date.now(),
        },
    })

    if (!user) {
        return next(new AppError('Not found this user.', 401))
    }

    // update password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetExpire = undefined
    user.passwordResetToken = undefined
    await user.save()

    // generate token jwt
    const token = signToken(user._id)

    res.status(200).json({
        status: 'success',
        token,
        message: 'Reset password success.',
    })
})

// update password
exports.updatePassword = catchAsync(async (req, res, next) => {
    if (
        !req.body.currentPassword ||
        !req.body.newPassword ||
        !req.body.newPasswordConfirm
    ) {
        return next(
            new AppError(
                'Please enter current password, new password, new password confirm',
                400
            )
        )
    }

    const user = await User.findById(req.user._id).select('+password')
    if (!user) {
        return next(new AppError('Not found this user', 404))
    }
    const isCorrectPassword = await user.comparePassword(
        req.body.currentPassword,
        user.password
    )
    if (!isCorrectPassword) {
        return next(
            new AppError('Incorrect password. Please enter correct password', 401)
        )
    }

    user.password = req.body.newPassword
    user.passwordConfirm = req.body.newPasswordConfirm
    await user.save()

    const token = signToken(user._id)
    res.status(201).json({
        status: 'success',
        token,
    })
})

// update me, no password
exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('Not update password or password confirm', 400))
    }

    const filterValues = filterObj(
        [
            'username',
            'firstName',
            'lastName',
            'gender',
            'email',
            'link',
            'description',
            'avatar',
            'avatarCover',
        ],
        req.body
    )
    const newUser = await User.findByIdAndUpdate(req.user._id, filterValues, {
        new: true,
        runValidators: true,
    })

    res.status(201).json({
        status: 'success',
        data: {
            data: newUser,
        },
    })
})

// delete me
exports.deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id)
    if (!user) {
        return next(new AppError('Not found this user', 404))
    }

    await User.findByIdAndUpdate(req.user._id, {
        active: false,
    })

    res.status(204).json({
        status: 'success',
        data: null,
    })
})
