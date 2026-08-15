//middleware to protect protected/private routes
export const isAuthenticated = (req, res, next) => {
    //verify that req.session exists and contains user data
    if (req.session && req.session.user) {
        // allow request to proceed i.e. run next piece of middlewares
        return next();
    }

    return res.status(401).json({
        message: "Unauthorized, please login",
    })
}