import { Schema, model } from 'mongoose';

const userColection = 'users';

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true, },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ["admin", "user"], default: 'user' },
  github: { type: String }
});

export const userModel = model(userColection, userSchema);

