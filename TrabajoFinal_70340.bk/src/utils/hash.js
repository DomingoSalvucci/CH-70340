import bcrypt from "bcrypt";

export async function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(password, hashedPassword) {  
  return await bcrypt.compare(password, hashedPassword);
}