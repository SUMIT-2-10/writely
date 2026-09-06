
const mongoose = require('mongoose');
const { createHmac, randomBytes } = require('node:crypto');
const bcrypt = require('bcrypt');
const { createTokenforUser } = require('../service/authentication');


const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    profileImageURL: {
        type: String,
        default: '/image/profile-icon-png-910.png'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }

}, { timestamps: true }
);

userSchema.pre('save', async function () {
    const user = this;
    if (!user.isModified('password')) return;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac('sha256', salt)
        .update(user.password)
        .digest("hex");
    
    user.salt = salt;
    user.password = hashedPassword;
});
//one way to do it 
// userSchema.methods.matchPassword = async function(enteredPassword) {
//     const hashedPassword = createHmac('sha256', this.salt)
//         .update(enteredPassword)
//         .digest("hex");
//     return hashedPassword === this.password;
// };



userSchema.static("mstchPasswordAndtokenGenerator", async function (email,password) {
    const user = await this.findOne({email});
    if(!user) throw new Error("Invalid email or password");

    const salt = user.salt;
    const hashedPassword = createHmac('sha256', salt)
    .update(password)
    .digest("hex");

    if(hashedPassword !== user.password) throw new Error("Invalid email or password");
    const token =createTokenforUser(user);
    return token;
})
const User = mongoose.model('User', userSchema);

module.exports = User;