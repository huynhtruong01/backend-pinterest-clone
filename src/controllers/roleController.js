const ApiFeatures = require('../utils/ApiFeatures')
const Role = require('../models/roleModel')

exports.getAllRoles = async (req, res) => {
    try {
        const features = new ApiFeatures(Role.find(), req.query)
            .filters()
            .sort()
            .fields()
            .paginate()
        if (req.query.page) {
            const page = (req.query.page * 1 - 1) * (req.query.limit * 1)
            const numRoles = await Role.countDocuments()
            if (page > numRoles) throw new Error('This page is not exits')
        }

        const roles = await features.query

        res.status(200).json({
            status: 'success',
            results: roles.length,
            data: {
                roles,
            },
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message || error,
        })
    }
}

exports.getRole = async (req, res) => {
    try {
        const role = await Role.findOne({ slug: req.params.slug })

        res.status(200).json({
            status: 'success',
            data: {
                role,
            },
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message || error,
        })
    }
}

exports.createRole = async (req, res) => {
    try {
        const newRole = await Role.create(req.body)

        res.status(201).json({
            status: 'success',
            data: {
                role: newRole,
            },
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message || error,
        })
    }
}

exports.updateRole = async (req, res) => {
    try {
        const newRole = await Role.findOneAndUpdate({ slug: req.params.slug }, req.body, {
            new: true,
            runValidators: true,
        })

        res.status(201).json({
            status: 'success',
            data: {
                role: newRole,
            },
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message || error,
        })
    }
}

exports.deleteRole = async (req, res) => {
    try {
        await Role.findByIdAndDelete(req.params.id)

        res.status(204).json({
            status: 'success',
            data: null,
        })
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message || error,
        })
    }
}
