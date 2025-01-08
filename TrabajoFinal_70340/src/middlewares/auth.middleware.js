
export function auth(req, res, next) {
  // console.log(req.session.user);
  if (!req.session.user && !req.session.admin) {
    return res.status(404).json({ message: "No has iniciado sesion" })
  }
  next()
}