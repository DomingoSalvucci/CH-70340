import { Router } from "express";

const viewsRouter = Router()

viewsRouter.get("/", (req, res) => {
  const isSession = req.session.user ? true : false
  res.render("index",
    {
      title: "Home",
      isSession
    })
})

viewsRouter.get("/login", (req, res) => {
  const isSession = req.session.user ? true : false

  if (isSession){
    return res.redirect("/")
  }

  res.render("login", {title: "Login"})
})

viewsRouter.get("/register", (req, res) => {
  const isSession = req.session.user ? true : false

  if (isSession){
    return res.redirect("/")
  }

  res.render("register", {title: "Register"})
})

viewsRouter.get("/profile", (req, res) => {
  const isSession = req.session.user ? true : false

  if (isSession){
    return res.redirect("/login")
  }

  res.render("profile", {title: "Profile"})
})

viewsRouter.get("/restorePassword", (req, res) => {
  res.render("restorePassword", {title: "reset"})
})

export default viewsRouter