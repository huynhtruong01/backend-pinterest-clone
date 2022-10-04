const Category = require('../models/categoryModel')
const { getAll, getOne, createOne, deleteOne } = require('./handleFactory')

exports.getAllCategories = getAll(Category)

exports.getCategory = getOne(Category)

exports.createCategory = createOne(Category)

exports.updateCategory = updateOne(Category)

exports.deleteCategory = deleteOne(Category)
