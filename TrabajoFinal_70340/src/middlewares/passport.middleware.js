import passport from "passport";
export function passportCall(strategy) {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (error, user, info) {

      if (error) return next(error)

      if (!user) return res.status(401).send({
        error: "Unauthorized (in Middleware)",
        details: info.message ? info.message : info.message.toString()
      })

      req.user = user
      next()

    })(req, res, next)
  }

}