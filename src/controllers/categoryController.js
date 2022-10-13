const Category = require('../models/categoryModel')
const {
    getAll,
    createOne,
    deleteOne,
    updateOneBySlug,
    getOneBySlug,
} = require('./handleFactory')

exports.getAllCategories = getAll(Category)

exports.getCategory = getOneBySlug(Category)

exports.createCategory = createOne(Category)

exports.updateCategory = updateOneBySlug(Category)

exports.deleteCategory = deleteOne(Category)
