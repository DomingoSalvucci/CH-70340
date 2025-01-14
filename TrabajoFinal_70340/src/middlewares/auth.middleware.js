export function auth(req, res, next) {
  // console.log(req.session.user);
  if (!req.session.user && !req.session.admin) {
    return res.status(404).json({ message: "No has iniciado sesion" })
  }
  next()
}

export function authorizationRole(...roles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Credenciales incorrectas in Middleware Authoriztion" })
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Sin acceso al recurso" })
    }

    next()
  }
}