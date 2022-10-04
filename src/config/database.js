const mongoose = require('mongoose')

exports.connectDB = async () => {
    try {
        const url = process.env.URL_MONGODB
        await mongoose.connect(url, {
            useNewUrlParser: true,
        })

        console.log('Connect DB successfully 😃😃')
    } catch (error) {
        console.log('Connect DB failed')
    }
}
