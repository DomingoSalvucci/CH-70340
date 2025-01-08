import passport from "passport";
import local from "passport-local"
import UsuariosManager from "../dao/UsuariosManager.js";
import { createHash, isValidPassword } from '../utils.js';
import github from "passport-github2"
import passportJWT from "passport-jwt"
import envs from "./envs.config.js";

const usuariosDao = new UsuariosManager()


// Funcion para obtener el Token
const buscarToken = (req)=>{
  let token=null

  if(req.cookies.currentUser){
     token = req.cookies.currentUser
  }
  console.log(token)
  return token
}


export const initPassport=()=>{

  //Estrategia LOCAL
  passport.use("registro",
    new local.Strategy(
      {
        usernameField:"email",
        passReqToCallback: true
      },
      async (req, username, password, done) => {

        try {

          let {first_name, 
            last_name,
            age,
            cart,
            role}=req.body

          if(!first_name){
            return done(null, false)
          }
          
          let existe = await usuariosDao.getBy({email: username})

          if (existe){
            return done(null, false)
          }

          // validaciones pertinentes
          let nuevoUsuario= await usuariosDao.create(
            {first_name, 
             last_name,
             email:username,
             age,
             password:createHash(password),
             cart,
             role})
          return done(null, nuevoUsuario)

        } catch (error) {
          return done(error)
        }
      }
    )
  )

  // Estrategia LOCAL
  passport.use( "login",
    new local.Strategy(
      {
        usernameField:"email"
      },
      async (username, password, done)=>{

        try {

          let usuario = await usuariosDao.getBy({email:username})

          if(!usuario || !password){
            return done(null, false)
          }

          if(!isValidPassword(password, usuario.password)){
            return done(null, false)
          }
          
          // Borrar datos sensibles o confidenciales
          delete usuario.password
          return done(null, usuario)
        
        } catch (error) {
          return done(error)          
        }
      }
    )
  )

  // Estrategaia GITHUB
  passport.use("github",
    new github.Strategy(
      {
        clientID:"Iv23lik40qYvrrF3DnEa",
        clientSecret: "7539eaac1600d504d9a0bf482f48fda025dcea19",
        callbackURL: "http://localhost:3000/api/session/callbackGithub"
      },
    async(token, refreshtoken, profile, done)=>{
      try {
        // console.log(profile);
        let {name, email}=profile._json

        if(!email){
          return done(null, false)
        }
        let usuario=await usuariosDao.getBy({email})

        if(!usuario){
          let usuario = await usuariosDao.create({first_name:name, email, profile})
        }

        return done(null, usuario)

      } catch (error) {
        return done(error)
      }
    }

  ))

  passport.use(
      "current",
      new passportJWT.Strategy(
        {
          secretOrKey: envs.SECRET,
          jwtFromRequest: new passportJWT.ExtractJwt.fromExtractors([buscarToken])
        },
        async (contenidoToken,done)=>{
          try {

            // se devolvera el usuario
            return done(null, contenidoToken)
            
          } catch (error) {
            return done(error)
          }
        }



      )
  )

  // Solo cuando estemos usando SESSION
  // passport.serializeUser(function(usuario, done) {
  //   done(null, usuario);
  // })

  // passport.deserializeUser(async function(usuario, done) {
  //   // let usuario = await usuariosDao.getBy({_id:id})
  //   return done(null, usuario)
  //   });


}



