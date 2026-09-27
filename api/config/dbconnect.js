const mongoose = require('mongoose');
const initBotAccount = require('./initBotAccount');

const dbConnect = async () => {
    try {
        const mongodbUri = process.env.MONGODB_URL;
        await mongoose.connect(mongodbUri);
        console.log('MongoDB connected successfully');
        await initBotAccount();
    } catch (error) {
        console.log('db connect error');
        throw new Error(error);
    }
}
module.exports = dbConnect;