const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const { connectDB } = require('./config/database')
const routes = require('./routes')
const AppError = require('./utils/AppError')
const globalErrorController = require('./../src/controllers/errorController')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const xss = require('xss-clean')
const hpp = require('hpp')
const helmet = require('helmet')

const rateLimitingOptions = {
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from same API. Please try again in a hour',
}

// middleware
// security http headers
app.use(helmet())

app.use(morgan('dev'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// sanitize xss
app.use(xss())

// sanitize query mongo
app.use(mongoSanitize())

// preventing parameter pollution
app.use(
    hpp({
        whitelist: [],
    })
)

// rate limit from same api
app.use('/api', rateLimit(rateLimitingOptions))

app.use(cors())

// static file
app.use(express.static('public'))

// connect db
connectDB()

// routes
app.use('/api/v1', routes)

// not find route
app.all('*', (req, res, next) => {
    next(new AppError(`Can not find ${req.originalUrl} on the request`, 404))
})

// middleware error
app.use(globalErrorController)

module.exports = app
