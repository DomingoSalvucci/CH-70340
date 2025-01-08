import { userModel } from "../models/user.model.js";
import { Router } from "express";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { auth } from "../middlewares/auth.middleware.js";
import passport from "passport";

const sessionRouter = Router()

sessionRouter.post("/login",
  passport.authenticate("login", { failureRedirect: "/api/session/fail-login" }),
  (req, res) => {
    // console.log(req.query);

    if (!req.user) return res.status(401).json({ message: "Unauthorized", detail: req.authInfo })

    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      age: req.user.age,
      email: req.user.email
    }

    return res.status(200).json({ message: "User logged in", user: req.session.user })

  })

sessionRouter.get("/fail-login", (req, res) => {
  return res.status(500).json({message: "Internal server error"} )
})


sessionRouter.get("/github", passport.authenticate("github"));

sessionRouter.get(
  "/github-callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
console.log("github-callback");
console.log(req.user);
    if (req.user) {
      req.session.user = req.user;
      return res.redirect("/");
    }

    res.redirect("/login");
  }
);
// // Se modifica por el uso de PASSPORT
// sessionRouter.post("/login", async (req, res) => {
//   const { email, password } = req.body

//   if (!email || !password) {
//     return res.status(400).json({ message: "email and password are required" })
//   }

//   try {
//     const user = await userModel.findOne({ email })

//     if (!user) return res.status(404).json({ message: "User not found" })

//     const isPasswordValid = await comparePassword(password, user.password)

//     if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" })

//     req.session.user = {
//       first_name: user.first_name,
//       last_name: user.last_name,
//       age: user.age,
//       email: user.email
//     }

//     return res.status(200).json({ message: "User logged in" })

//   }
//   catch (error) {
//     return res.status(500).json({ message: "Internal server error" })
//   }

// })


sessionRouter.post("/register",
  passport.authenticate("register", { failureRedirect: "/api/session/fail-register" }),
  (req, res) => {
    if (!req.user) return res.status(500).json({ message: "Internal server error", detail: req.authInfo })
    return res.status(201).json({ message: "User created", user: req.user })
  })

sessionRouter.get("/fail-register", (req, res) => {
  return res.status(500).json({ message: "Internal server error" })
})





// Se cdeja de utilizar para usar PASSPORT
// sessionRouter.post("/register", async (req, res) => {
//   const { first_name, last_name, age, email, password } = req.body

//   if (!first_name || !last_name || !age || !email || !password) {
//     return res.status(400).json({ message: "All fields are required" })
//   }

//   try {
//     const userExists = await userModel.findOne({ email })
//     if (userExists) {
//       return res.status(409).json({ message: "User already exists" })
//     }

//     const hashedPassword = await hashPassword(password)

//     const user = await userModel.create({
//       first_name,
//       last_name,
//       age,
//       email,
//       password: hashedPassword
//     })
//     return res.status(201).json({ message: "User created", user })

//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Internal server error" })
//   }
// })


sessionRouter.get("/profile", auth, (req, res) => {
  const isSession = req.session.user ? true : false;

  if (!isSession) {
    return res.redirect("/login");
  }
  res.render("profile", { title: "Profile", user: req.session.user });
});

sessionRouter.get("/logout", (req, res) => {
  req.session.destroy();
  return res.status(200).json({ message: "User logged out" })
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

export default sessionRouter