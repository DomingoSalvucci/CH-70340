import jwt from "jsonwebtoken";
import envs from "../config/envs.config.js";

// export const generaJWT=usuario=>jwt.sign(usuario, envs.SECRET, {expiresIn:1800})
// export const validaJWT=token=>jwt.verify(token, envs.SECRET)

// -- JWT FUNCTION ------------------------------------------------
/**
 * 
 * @param {payload} payload --> Informacion que se va a encriptar
 * @returns {String} token - Token generado
 */
export function generateToken(payload){
  const token = jwt.sign(payload, envs.SECRET, {expiresIn:"30m"})
  return token
}


export function verifyToken(token){
  const payload = jwt.verify(token, envs.SECRET)
  return payload
}
// -- JWT FUNCTION ------------------------------------------------

// Auth Middleware
export function authentication(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Not authorized" });
  }

  // "Authorization: Bearer <token>"
  // Bearer --> Portador
  const token = authHeader.split(" ")[1];

  try{
    const payload = verifyToken(token);
    req.user = payload;
    next();
  }
  catch(error){
    console.log(error);
    return res.status(401).json({ message: "Not authorized" });
  } 
  
}
