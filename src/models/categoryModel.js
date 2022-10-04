const mongoose = require('mongoose')
const slugify = require('slugify')

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A category must have name'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        pins: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'Pin',
            },
        ],
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

categorySchema.pre('save', function (next) {
    this.slug = slugify(this.name, {
        lower: true,
    })

    next()
})

categorySchema.pre(/^find/, function (next) {
    this.populate({
        path: 'pins',
    })

    next()
})

const Category = mongoose.model('Category', categorySchema)
module.exports = Category
