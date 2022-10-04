const express = require('express')
const router = express.Router()
const pinRoutes = require('./pinRoutes')
const userRoutes = require('./userRoutes')
const roleRoutes = require('./roleRoutes')
const categoryRoutes = require('./categoryRoutes')

const routes = [
    router.use('/pins', pinRoutes),
    router.use('/users', userRoutes),
    router.use('/roles', roleRoutes),
    router.use('/categories', categoryRoutes),
]

module.exports = routes
