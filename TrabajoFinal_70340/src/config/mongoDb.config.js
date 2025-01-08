import mongoose from "mongoose";
import envs from "./envs.config.js"
 
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(envs.MONGO_URL);
    console.log("Mongo DB conectado");

  } catch (error) {
    console.log(`Error al conectar a DB: ${error.message}`);
  }
  
}


