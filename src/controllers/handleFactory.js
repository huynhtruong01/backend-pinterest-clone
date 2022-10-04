const ApiFeatures = require('../utils/ApiFeatures')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        const features = new ApiFeatures(Model.find(), req.query)
            .filters()
            .sort()
            .fields()
            .paginate()
        if (req.query.page) {
            const page = (req.query.page * 1 - 1) * (req.query.limit * 1)
            const numPins = await Model.countDocuments()
            if (page > numPins) return next(new AppError('This page is not exits.', 404))
        }

        const docs = await features.query

        res.status(200).json({
            status: 'success',
            results: docs.length,
            data: {
                data: docs,
            },
        })
    })

exports.getOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findOne({ slug: req.params.slug })

        if (!doc) return next(new AppError('Not found data with ID.', 404))

        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        })
    })

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const newDoc = await Model.create(req.body)

        res.status(201).json({
            status: 'success',
            data: {
                data: newDoc,
            },
        })
    })

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const updateDoc = await Model.findOneAndUpdate(
            { slug: req.params.slug },
            req.body,
            {
                new: true,
                runValidators: true,
            }
        )

        if (!updateDoc) return next(new AppError('Not found data with ID.', 404))

        res.status(201).json({
            status: 'success',
            data: {
                data: updateDoc,
            },
        })
    })

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findById(req.params.id)
        if (!doc) return next(new AppError('Not found data with ID to delete', 404))

        await Model.findByIdAndDelete(req.params.id)

        res.status(204).json({
            status: 'success',
            data: null,
        })
    })
