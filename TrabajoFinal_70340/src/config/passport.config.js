import passport from "passport";
import localStrategy from "passport-local"
import githubStrategy from "passport-github2"
import envs from "./envs.config.js";
import { userModel } from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/hash.js";

import passportJWT from "passport-jwt"

// const localStrategy = local.Strategy
// const githubStrateg = github.Strategy

// Funcion para obtener el Token
const buscarToken = (req) => {
  let token = null

  if (req.cookies.currentUser) {
    token = req.cookies.currentUser
  }
  console.log(token)
  return token
}

// Middleware de aplicacion
const initializePassport = () => {
  // ----------------------------------------
  // Estrategia LOCAL
  // ----------------------------------------
  passport.use("register",
    new localStrategy(
      {
        usernameField: "email",
        passReqToCallback: true
      },
      async (req, username, password, done) => {
        try {
          let { first_name, last_name, age, email } = req.body

          if (!first_name) {
            return done(null, false)
          }
          const userExists = await userModel.findOne({ email })
          if (userExists) return done(null, false, { message: "Usuario ya existe" })
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
          return done(null, user)

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

          if (!user) return done(null, false);

          const isPasswordValid = await comparePassword(password, user.password);

          if (!isPasswordValid) return done(null, false);

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
  // ----------------------------------------
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
          console.log(email);
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
  // ----------------------------------------
  passport.use(
    "current",
    new passportJWT.Strategy(
      {
        secretOrKey: envs.SECRET,
        jwtFromRequest: new passportJWT.ExtractJwt.fromExtractors([buscarToken])
      },
      async (contenidoToken, done) => {
        try {

          // se devolvera el usuario
          return done(null, contenidoToken)

        } catch (error) {
          console.log(error);
          return done(error)
        }
      }



    )
  )

  // ----------------------------------------
  // serialize y deserialize
  // ----------------------------------------
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




