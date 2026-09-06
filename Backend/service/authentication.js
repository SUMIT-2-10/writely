const JWT = require('jsonwebtoken');

const secretKey = "your-very-secure-secret-key"; // Use a strong secret key in production

const createTokenforUser = (user) => {
    const payload = {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        profileImageURL: user.profileImageURL,
    };
    return JWT.sign(payload, secretKey, );
}

const verifyTokenforUser = (token) => {
    try {
        const payload = JWT.verify(token, secretKey);
        return payload;
    } catch (error) {
        throw new Error("Invalid token");
    }}


module.exports = { createTokenforUser, verifyTokenforUser };