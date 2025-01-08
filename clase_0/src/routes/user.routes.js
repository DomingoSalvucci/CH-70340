import { Router } from 'express';
import { userModel } from '../models/user.model.js';

export const userRouter = Router()

userRouter.get('/', async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" })
  }
})

userRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const users = await userModel.findById(id);

    if (!users) return res.status(404).jason({ message: "User not foumd" })
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" })
  }
})

userRouter.post("/", async (req, res) => {
  const { name, age, email } = req.body;
  try {
    const user = await userModel.create({
      name, age,
      email
    });
    res.status(201).json(user);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error"
    })
  }
})

userRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body
  try {
    const user = await userModel.findById(id).lean();

    if (!user) return res.status(404).json({ message: "User not foumd" })

    const product = await userModel.findByIdAndUpdate(id, body, { new: true } )
    res.status(200).json(product);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error"
    })
  }
})

userRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.findByIdAndDelete(id);

    if (!user) return res.status(404).json({message: "User not found"})

    res.status(200).json(user);
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error"
    })
  }
})