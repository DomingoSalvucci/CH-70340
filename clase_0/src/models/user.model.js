import {Schema, model} from 'mongoose';

const userColection='users';

const useerSchema= new Schema({
  name: {
    type: String,
    unique: true,
    required: [true, `Nombre del Usuario es obligatorio`]
  },
  age: {
    type: Number,
    required: true
  },
  email:{
    type: String,
    required: true,
    unique: true
  }

});

export const userModel=model(userColection, useerSchema);

