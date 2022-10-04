const mongoose = require('mongoose')
const slugify = require('slugify')

const pinSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: [true, 'A pin must have information of user'],
            trim: true,
        },
        image: {
            type: String,
            required: [true, 'A pin must have image'],
        },
        link: {
            type: String,
        },
        title: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        likes: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
        ],
        numLikes: {
            type: Number,
            default: 0,
        },
        category: {
            type: mongoose.Types.ObjectId,
            ref: 'Category',
        },
        slug: String,
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

pinSchema.pre('save', function (next) {
    this.slug = slugify(this.title, {
        lower: true,
    })

    next()
})

pinSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: '-passwordChangedAt -passwordResetToken -passwordResetExpire -gender -email -description -link',
    })
        .populate({
            path: 'likes',
        })
        .populate({
            path: 'category',
        })

    next()
})

const Pin = mongoose.model('Pin', pinSchema)
module.exports = Pin
