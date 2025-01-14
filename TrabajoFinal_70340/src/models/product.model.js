import { Schema, model } from 'mongoose';
import mongoosePaginate from "mongoose-paginate-v2";

const productCollection = "products"; // nombre de la coleccion

//Modelo de Schema
const productSchema = new Schema({
  title: { type: String, require: true },
  description: { type: String },
  code: { type: String, unique: true },
  stock: { type: Number },
  status: { type: Boolean, default: true },
  category: { type: String },
  price: { type: Number, default: 0 },
  thumbnail: { type: Array, default: [] }

});

productSchema.plugin(mongoosePaginate);

// exportamos el modelo que vamos a utilizar
export const productModel = model(productCollection, productSchema);

