const mongoose = require('mongoose');

let connectionPromise;

const mongoDbConnect = (url) => {
    if (!url) return Promise.reject(new Error('MONGODB_URL is not configured'));
    if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
    if (!connectionPromise) {
        connectionPromise = mongoose.connect(url, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            socketTimeoutMS: 5000,
        }).catch((error) => {
            connectionPromise = null;
            throw error;
        });
    }
    return connectionPromise;
};

module.exports = mongoDbConnect