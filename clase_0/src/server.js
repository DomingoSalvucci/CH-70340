import express from "express";
import { connect } from "mongoose";
import morgan from "morgan";
import { userRouter } from "./routes/user.routes.js";
import { connectMongoDB } from "../config/mongoDb.config.js";
import envs from "../config/envs.config.js"
 
const app = express();
// Configuracion de Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("dev"));

// Conexion con Mongo
connectMongoDB();

// connect(DB_URL)
//   .then(() => console.log("DB Connected"))
//   .catch((error) => console.log(error))

// Rutas
app.use("/api/users", userRouter)

// Inicializacion del servicor
app.listen(envs.PORT, ()=>{
  console.log(`Server running on port http://localhost:${envs.PORT}`)
});







