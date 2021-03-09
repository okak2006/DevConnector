const mongoose = require('mongoose');
const config = require('config');

//Grab parameters stored in default.json using config package
const db = config.get('mongoURI');

//Db connect - returns promise
const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
            useCreateIndex: true
        });
        console.log('MongoDB connected')
    } catch (err) {
        console.error(err.message);
        //exit process on fail
        process.exit(1)
    }
}

module.exports = connectDB;