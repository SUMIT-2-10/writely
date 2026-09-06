const mongoose = require('mongoose');

const mongoDbConnect = (url) => {
    return mongoose.connect(url)
};

module.exports = mongoDbConnect