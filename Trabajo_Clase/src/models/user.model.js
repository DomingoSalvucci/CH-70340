import { Schema, model } from 'mongoose';

const userColection = 'users';

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true, },
  age: { type: Number, required: true },
  password: { type: String },
  email: { type: String, required: true, unique: true, },
  github: { type: String }
});

export const userModel = model(userColection, userSchema);

