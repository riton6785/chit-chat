const mongoose = require("mongoose");

const connectDB = async () => {
    try {   
    const conn = await mongoose.connect(process.env.MONGOURI, {
    });
    console.log(`MongoDb connected: ${conn.connection.host}`.cyan.underline)
    } catch (error) {
        console.log(`Error ${error.message}`.red.bold)
        process.exit()
    }
}

module.exports = connectDB