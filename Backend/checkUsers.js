require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./model/user');

mongoose.connect(process.env.MONGODB_URL)
    .then(async () => {
        console.log("Connected to MongoDB");
        const users = await User.find({});
        console.log("\nAll users and their profileImageURLs:");
        users.forEach(user => {
            console.log(`\nUser: ${user.fullname}`);
            console.log(`Email: ${user.email}`);
            console.log(`ProfileImageURL: "${user.profileImageURL}"`);
            console.log(`Char codes:`, user.profileImageURL.split('').map(c => c.charCodeAt(0)));
        });
        mongoose.connection.close();
    })
    .catch(err => {
        console.error("Error:", err);
    });
