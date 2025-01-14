import { Schema, model } from 'mongoose';
const cartCollection = "carts"; // nombre de la coleccion

//Modelo de Schema
const cartSchema = new Schema(
  {products:{
    type: [{product: {type: mongoose.Schema.Types.ObjectId, ref: "products"}, quantity: Number}],
    default: []
  }
});

cartSchema.pre("findOne", function () {
  this.populate("products.product");
});

// exportamos el modelo que vamos a utilizar
export const cartModel = model(cartCollection,cartSchema);

