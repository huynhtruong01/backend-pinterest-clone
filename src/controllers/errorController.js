module.exports = (err, req, res, next) => {
    // console.log(err.message)
    // console.log(err.stack)
    // console.log(err.statusCode)

    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message || 'Send request error',
        stack: err.stack,
    })

    next()
}
