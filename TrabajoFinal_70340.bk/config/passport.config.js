import passport from "passport";
import local from "passport-local"
import { userModel } from "../src/models/user.model.js";
import { hashPassword, comparePassword } from "../src/utils/hash.js";
import github from "passport-github2"
import passportJWT from "passport-jwt"
import envs from "./envs.config.js";

const localStrategy = local.Strategy

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
    new localStrategy.Strategy(
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
    new localStrategy.Strategy(
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
          return done(`Hubo un error: ${error}`);
        }
      }
    )
  );

  // ----------------------------------------
  // Estrategia GITHUB
  // ----------------------------------------
  passport.use("github",
    new github.Strategy(
      {
        clientID: envs.GITHUB_CLIENT_ID,
        clientSecret: envs.GITHUB_CLIENT_SECRET,
        callbackURL: envs.GITHUB_CALLBACK_URL,
      },
      async (token, refreshtoken, profile, done) => {
        try {
          console.log(profile);
          let { name, email } = profile._json
console.log(profile._json);
          if (!email) {
            return done(null, false)
          }
          let usuario = await usuariosDao.getBy({ email })

          if (!usuario) {
            let usuario = await usuariosDao.create({ first_name: name, email, profile })
          }

          return done(null, usuario)

        } catch (error) {
          console.log(error);
          return done(error)
        }
      }

    ))

  // ----------------------------------------
  // Estrategia CURRENT
  // ----------------------------------------
  passport.use("current",
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




