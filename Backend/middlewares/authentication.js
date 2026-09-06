const { verifyTokenforUser } = require('../service/authentication');

function checkForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const token = req.cookies?.[cookieName];
        if (!token) {
            res.locals.user = null;
            return next();
        }

        try {
            const user = verifyTokenforUser(token);
            res.locals.user = user;
        } catch (error) {
            res.locals.user = null;
        }
        next();
    };
}

module.exports = { checkForAuthenticationCookie };

