import express from "express";
import morgan from "morgan";
import userRouter from "./routes/user.routes.js";
import { connectMongoDB } from "../config/mongoDb.config.js";
import envs from "../config/envs.config.js"
import cookieParser from "cookie-parser"
import session from "express-session"
// import FileStore from "session-file-store"
import MongoStore from "connect-mongo";

import __dirname from "./dirname.js";
import handlebars from "express-handlebars";
import path from "path";

import viewsRouter from "./routes/views.routes.js";
import sessionRouter from "./routes/session.routes.js";

import initializePassport from "../config/passport.config.js";
import passport from "passport";

const app = express();

// const fileStore= FileStore(session)

// inicializamos Cookie-parser. PAra firmar un cookie agrgamos SECRET
app.use(cookieParser(envs.SECRET));

// SESSION con File Store (guarda las sesiones en un archivo)
// app.use(session({
//   secret: envs.SECRET,
//   resave: false, // almacenamos en forma fisica, archivo
//   saveUninitialized: false,
//   store: new fileStore({
//     path: "./sessions",
//     ttl:120,
//     retries: 0
//   })
// }))

// SESSION con mongoDB (guarda las sesiones en la base de datos)
app.use(session({
  secret: envs.SECRET,
  resave: false, // almacenamos donde se defina, ahora con sotre
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: envs.MONGO_URL_SESSION, // Usamos una BD para SESSIONS
    ttl: 30
  }) 
}))

// Passport config
initializePassport()
app.use(passport.initialize())
app.use(passport.session())


// Configuracion de Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("dev"));

// Conexion con Mongo
connectMongoDB();

// HANDLEBARS Config
app.engine("hbs", handlebars.engine({
  extname: "hbs",
  defaultLayout: "main"
}))

app.set("view engine", "hbs")
app.set("views", path.join(__dirname, "views"))


// Rutas
app.use("/api/users", userRouter)
app.use("/api/session", sessionRouter)
app.use("/", viewsRouter)
 
// app.use("/file",(req, res) => {
//   if (req.session.views){
//     req.session.views++
//   }
//   else{
//     req.session.views=1
//   }

//   res.send(`Has visitado la pagina ${req.session.views} veces`)
// })


// Rutas de SESSION
// app.use("/session", (req, res) => {
//   if (req.session.counter) {
//     req.session.counter++
//     res.json({
//       message: `Has visitado la pagina ${req.session.counter} veces`
//     })
//   }
//   else {
//     req.session.counter = 1
//     res.json({ message: "Bienvenido a la pagina" })
//   }
// })

// app.use("/logout", (req, res) => {
//   req.session.destroy(
//     (error) => {
//       if (error) return res.json({ message: "Error al cerrar session" })

//       res.json({ message: "Session cerrada" })
//     }
//   )
// })

// app.use("/login", (req, res) => {
//   const { username, password } = req.query

//   if (username != "admin" || password != "1234") {
//     return res.status(401).json({ message: "Usuario o contraseña incorrectos" })
//   }

//   req.session.user = { username }
//   req.session.admin = username === "admin"
//   res.json({ message: "Session iniciada" })

// })

// app.use("/profile", auth,  (req, res) => {

//   res.json({ message: "Bienvenido a tu perfil", user: req.session.user, admin: req.session.admin })

//   })

// app.use("/private",auth, (req, res) => {
//   res.json({ message: "Bienvenido a la seccion privada" })
// })

// DEASAFIO EN CLASE
// app.use("/", (req, res) => {

//   const {nombre}=req.query

//   if (nombre && nombre != req.session.nombre){
//     req.session.nombre = nombre
//   }
//   if (!req.session.counter){
//     req.session.counter = 1
//     return res.json({ message: req.session.nombre ? `Bienvenido ${req.session.nombre}` : `Bienvenido a la pagina` })
//   }

//   req.session.counter++

//   res.json({
//     message: req.session.nombre 
//     ? `${req.session.nombre} has vistado esta pagina ${req.session.counter} veces` 
//     : `Has vistado esta pagina ${req.session.counter} veces`,
//   })
  
// })

// // COOKIES
// // Set Cookie
// const nombresBuscados = []
// app.get("/setCookie", (req, res) => {
//   // const {name}=req.query
//   // nombresBuscados.push(name);
//   // res.cookie("coderCookie", JSON.stringify(nombresBuscados), { maxAge: 10000 })
//   res.cookie("coderCookie", "Esto es una cookie", { maxAge: 10000 * 60 })

//   res.send()
// })
// // Get Cookie
// app.get("/getCookie", (req, res) => {
//   // cookies normales
//   const cookies = req.cookies
//   // cookies firmadas}
//   const signedCookies = req.signedCookies
//   res.json({ cookies, signedCookies })
// })
// // Clear Cookie
// app.get("/delCookie", (req, res) => {
//   res.clearCookie("coderCookie")
//   res.send({message: "Se elimino coderCookie"})
// })
// // Set Cookie firmada
// app.get("/setSignedCookie", (req, res) => {
//   res.cookie("coderSignedCookie", "Esto es una cookie firmada", { signed: true, maxAge: 10000 * 60 })
//   res.json({message: "Cookie firmada"})
// })



// Inicializacion del servidor
app.listen(envs.PORT, () => {
  console.log(`Server running on port http://localhost:${envs.PORT}`)
});







