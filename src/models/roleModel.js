const mongoose = require('mongoose')
const slugify = require('slugify')

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A role must have name'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
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

roleSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {
        lower: true,
    })

    next()
})

const Role = mongoose.model('Role', roleSchema)
module.exports = Role
