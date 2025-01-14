import passport from "passport";
import localStrategy from "passport-local"
import githubStrategy from "passport-github2"
import envs from "./envs.config.js";
import { userModel } from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import passportJWT from "passport-jwt"

// const localStrategy = local.Strategy
// const githubStrategy = github.Strategy
const ExtractJWT = passportJWT.ExtractJwt
// Funcion para obtener el Token
// const buscarToken = (req) => {
const cookieExtractor = (req) => {

  let token = null

  // if (req.cookies.currentUser) {
  //   token = req.cookies.currentUser
  // }
  if (req && req.cookies) {
    token = req.cookies.token
  }

  return token
}

// Middleware de aplicacion
const initializePassport = () => {
  // ----------------------------------------
  // Estrategia LOCAL
  passport.use("register",
    new localStrategy(
      {
        usernameField: "email",
        passReqToCallback: true
      },
      async (req, username, password, done) => {
        try {
          let { first_name, last_name, age, email } = req.body
          // console.log(first_name, last_name, age, email, "username: "+ username, "password: "+ password);
          if (!first_name) {
            return done(null, false, { message: "Debe ingresar Nombre." })
          }
          if (!last_name) {
            return done(null, false, { message: "Debe ingresar Apellido." })
          }
          const userExists = await userModel.findOne({ email })
          if (userExists) return done(null, false, { message: "Usuario ya existe." })
          const hashedPassword = await hashPassword(password)
          // validaciones pertinentes
          const user = await userModel.create(
            {
              first_name,
              last_name,
              email: username,
              age,
              password: hashedPassword,
            })

          // Borrar datos sensibles o confidenciales
          delete user.password
          return done(null, user, {message: "Usuario creado con Existo"})

        } catch (error) {
          return done(error)
        }
      } // FIN CallBack
    ) //FIN localStrategy.Strategy
  )

  // ----------------------------------------
  // Estrategia LOGIN
  passport.use("login",
    new localStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {

        try {

          const user = await userModel.findOne({ email });
          //Si no existe el usuario en la BD
          if (!user) return done(null, false, { message: "Usuario no existe" });
          // Si el usuario no tiene definida una PASSWORD en la BD
          if(!user.password) return done(null, false, { message: "Clave no definida en el usuario" });
          
          const isPasswordValid = await comparePassword(password, user.password);
          // Verifico Si la contraseña es incorrecta
          if (!isPasswordValid) return done(null, false, { message: "Contraseña incorrecta" });

          // Borrar datos sensibles o confidenciales
          delete user.password

          return done(null, user);

        } catch (error) {
          console.log(error);
          return done(`Hubo un error: ${error}`);
        }
      }
    )
  );

  // ----------------------------------------
  // Estrategia GITHUB
  passport.use("github",
    new githubStrategy(
      {
        clientID: envs.GITHUB_CLIENT_ID,
        clientSecret: envs.GITHUB_CLIENT_SECRET,
        callbackURL: envs.GITHUB_CALLBACK_URL,
        // scope: ["user:email"],
      },
      async (token, refreshtoken, profile, done) => {
        try {

          let { email } = profile._json

          const user = await userModel.findOne({ email });

          if (user) {
            done(null, user)
            return
          }

          if (!user) {
            const user = await userModel.create(
              {
                first_name: profile.displayName,
                last_name: profile.displayName,
                email,
                age: profile.age || 1999,
                githubId: profile.id
              })

          }

          done(null, user)

        } catch (error) {
          console.log(error);
          return done(error)
        }
      }

    ))

  // ----------------------------------------
  // Estrategia CURRENT
  passport.use("current",
    new passportJWT.Strategy(
      {
        secretOrKey: envs.SECRET,
        jwtFromRequest: new passportJWT.ExtractJwt.fromExtractors([cookieExtractor])
      },
      async (payload, done) => {
        try {
          // se devolvera el usuario
          return done(null, payload)

        } catch (error) {
          console.log(error);
          return done(error)
        }
      }



    )
  )

  // ----------------------------------------
  // Estrategia JWT
  passport.use("jwt",
    new passportJWT.Strategy(
      {
        secretOrKey: envs.SECRET,
        jwtFromRequest: new passportJWT.ExtractJwt.fromExtractors([cookieExtractor])
      },
      async (payload, done) => {
        try {
          // se devolvera el token
          return done(null, payload)

        } catch (error) {
          console.log(error);
          return done(error)
        }
      }



    )
  )
  // ----------------------------------------
  // serialize y deserialize
  // Se crea dentro dela funcion initializePassport
  // Solo cuando estemos usando SESSION
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  })

  passport.deserializeUser(async function (id, done) {
    let user = await userModel.findById(id)
    done(null, user)
  });
}

export default initializePassport




