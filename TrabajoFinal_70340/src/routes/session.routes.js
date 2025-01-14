import { userModel } from "../models/user.model.js";
import { Router } from "express";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { auth, authorizationRole } from "../middlewares/auth.middleware.js";
import passport from "passport";
import { authentication, generateToken } from "../utils/utils.js";
import { passportCall } from "../middlewares/passport.middleware.js"
const sessionRouter = Router()

sessionRouter.post("/login",
  // passport.authenticate("login", { failureRedirect: "/api/session/fail-login" }),
  passportCall("login"),
  (req, res) => {

    const { email, password } = req.body

    if (!req.user) return res.status(401).json({ message: "Unauthorized in Login", detail: req.authInfo })

    const payload = { email, role: req.user.role }

    const token = generateToken(payload)

    res.cookie("token", token, {
      maxAge: 100000, // 10 minutos
      httpOnly: true
    })

    if (req.user) {
      req.session.user = req.user;
      return res.redirect("/");
    }

    res.redirect("/login");
    
  })

sessionRouter.post("/register",
  // passport.authenticate("register", { failureRedirect: "/api/session/fail-register" }),
  passportCall("register"),
  (req, res) => {
    // if (!req.user) return res.status(500).json({ message: "Internal server error", detail: req.authInfo })
    return res.status(201).json({ message: "Usuario Creado", user: req.user })
  })

sessionRouter.get("/current",
  passportCall("current"),
  authorizationRole("admin"),
  (req, res) => {
    res.status(200).json({ message: "Usuario actual", user: req.user })

  })

sessionRouter.get("/protected",
  passportCall("jwt"),
  authorizationRole("admin"),
  (req, res) => {
    // if (!req.cookies.token) return res.status(401).json({ message: "Unauthorized" })
    res.status(200).json({ message: "Ruta protegida, tu perfil permite ver este mensaje" })

  })

sessionRouter.get("/fail-login", (req, res) => {
  return res.status(500).json({ message: "Internal server error" })
})

sessionRouter.get("/fail-register", (req, res) => {
  return res.status(500).json({ message: "Internal server error" })
})

sessionRouter.get("/profile", auth, (req, res) => {
  const isSession = req.session.user ? true : false;

  if (!isSession) {
    return res.redirect("/login");
  }
  res.render("profile", { title: "Profile", user: req.session.user });
});

sessionRouter.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
  // return res.status(200).json({ message: "User logged out" })
})

sessionRouter.post("/restorePassword", async (req, res) => {

  const { email, password } = req.body

  try {
    const user = await userModel.findOne({ email });
    const id = user._id

    if (!user) return res.status(404).json({ message: "User not found" })

    const hashedPassword = await hashPassword(password)
    const userUpd = await userModel.findByIdAndUpdate(id, { password: hashedPassword }, { new: true })
    return res.status(200).json(userUpd);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" })
  }

})

sessionRouter.get("/github", passport.authenticate("github"));

sessionRouter.get("/github-callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    // console.log(req.user);
    if (req.user) {
      req.session.user = req.user;
      return res.redirect("/");
    }

    res.redirect("/login");
  }
);

export default sessionRouter