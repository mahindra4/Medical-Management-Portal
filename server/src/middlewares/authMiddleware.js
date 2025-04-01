//utils
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const { verifyToken } = require("../utils/handleJWT");
const ExpressError = require('../utils/ExpressError');

const authMiddleware = (desiredRoles, flag=true) => {
    return async (req, res, next) => {
        try {
            console.log(desiredRoles)
            console.log("accessing the token")
            const token = req.cookies.token;
            if (!token) {
                const error = new ExpressError("Token not found", 401);
                next(error);
                return ;
            }
            console.log("its fine")
            const data = verifyToken(token);
            console.log(`data: ${data}`)
            if (!data) {
                const error = new ExpressError(
                    "Request is not authorized",
                    401
                );
                next(error);
                return ;
            }

            const { email } = data;
            req.user = await prisma.user.findUnique({
                where: {
                    email,
                },
            });
            req.recievedToken = token;
            req.role = req.user?.role;

            if (!desiredRoles) {
                desiredRoles = [];
            }

            if (!req.user) {
                const error = new ExpressError(
                    "User does not exist",
                    404
                );
                console.log('error in middleware')
                next(error);
                return ;
            } else if (!desiredRoles.includes(req.role) && flag) {
                const error = new ExpressError(
                    "User is not authorized to access this route",
                    401
                );
                next(error);
                return ;
            } else {
                console.log('success')
                next();
                return ;
            }
        } catch (err) {
            const error = new ExpressError(err.message, 401);
            console.log('error in middleware')
            next(error);
            return ;
        }
    };
}

module.exports = authMiddleware;