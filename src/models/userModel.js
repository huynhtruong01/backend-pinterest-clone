const mongoose = require('mongoose')
const slugify = require('slugify')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'A user must have username.'],
            trim: true,
            unique: true,
        },
        firstName: {
            type: String,
            required: [true, 'A user must have first name.'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'A user must have last name.'],
            trim: true,
        },
        gender: {
            type: String,
            enum: {
                values: ['male', 'female', 'other'],
                message: 'A user is either: Male, Female, Other.',
            },
        },
        email: {
            type: String,
            required: [true, 'A user must have email.'],
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'A user must have password.'],
            minLength: [6, 'A password at least six characters.'],
            select: false,
        },
        passwordConfirm: {
            type: String,
            required: [true, 'A user must have password confirm.'],
            validate: {
                validator: function (val) {
                    return val === this.password
                },
                message: 'Not match password. Please enter match.',
            },
            select: false,
        },

        avatar: {
            type: String,
            default:
                'https://scontent.fsgn13-4.fna.fbcdn.net/v/t1.30497-1/143086968_2856368904622192_1959732218791162458_n.png?_nc_cat=1&ccb=1-7&_nc_sid=7206a8&_nc_ohc=KGMN7pZGaI8AX_JTm5k&_nc_ht=scontent.fsgn13-4.fna&oh=00_AT9yJU9mTNZjoHFxIM-LjIpKDa3CEqfV2bp-MzmiSnakhw&oe=634CFC78',
        },
        avatarCover: {
            type: String,
            default:
                'https://i.picsum.photos/id/112/4200/2800.jpg?hmac=8Qhr0ehkFOnlKO__aKhLMQTu2qzcAten9LHpBO6uk-k',
        },
        description: {
            type: String,
            trim: true,
        },
        link: {
            type: String,
            trim: true,
        },
        followers: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
        ],
        numFollowers: {
            type: Number,
            default: 0,
        },
        followings: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
        ],
        numFollowings: {
            type: Number,
            default: 0,
        },
        saves: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'Pin',
            },
        ],
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
        },
        active: {
            type: Boolean,
            default: true,
        },
        slug: String,
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpire: Date,
    },
    {
        timestamps: true,
        toObject: {
            virtuals: true,
        },
        toJSON: {
            virtuals: true,
        },
    }
)

userSchema.index({ username: 1 })

userSchema.pre('save', async function (next) {
    this.slug = slugify(this.username, {
        lower: true,
    })
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined

    next()
})

userSchema.pre('save', function (next) {
    if (!this.isModified('password')) return next()

    this.passwordChangedAt = Date.now()
    next()
})

userSchema.pre(/^find$/, function (next) {
    this.find({
        active: {
            $ne: false,
        },
    })

    next()
})

userSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'followers',
        select: '-passwordChangedAt -passwordResetToken -passwordResetExpire -gender -email -description -link -slug',
    })
        .populate({
            path: 'followings',
            select: '-passwordChangedAt -passwordResetToken -passwordResetExpire -gender -email -description -link -slug',
        })
        .populate({
            path: 'saves',
        })

    next()
})

// defined method
userSchema.methods.comparePassword = async (currentPassword, userPassword) => {
    return await bcrypt.compare(currentPassword, userPassword)
}

userSchema.methods.changePasswordAfter = (JWTTimestamp) => {
    if (this.passwordChangedAt) {
        const passwordChangedAt = parseInt(this.passwordChangedAt / 1000, 10)
        return passwordChangedAt > JWTTimestamp
    }

    return false
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpire = Date.now() + 10 * 60 * 1000
    console.log({ resetToken }, this.passwordResetToken)

    return resetToken
}

const User = mongoose.model('User', userSchema)
module.exports = User
