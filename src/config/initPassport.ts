import GoogleStrategy from "passport-google-oauth20";
import dotenv from "dotenv";
import { User } from "../models/user.model";
import { Request } from "express";
import passport from "passport";

dotenv.config();

export const initPassport = () => {
  passport.serializeUser((user: any, done) => {
    console.log("Serializing user");
    return done(null, user._id);
  });

  passport.deserializeUser(async (_id, done) => {
    const user = await User.findById(_id);
    console.log("Deserializing user");

    done(null, user);
  });

  passport.use(
    new GoogleStrategy.Strategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        passReqToCallback: true,
      },
      async (
        request: Request,
        accessToken: string,
        refreshToken: string,
        profile,
        done
      ) => {
        console.log(profile);

        const newUser = {
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
        };

        const existingUser = await User.findOne({ googleId: newUser.googleId });

        if (existingUser) {
          return done(null, existingUser);
        }

        // User doesn't exist already, so create one
        const user = await User.create(newUser);
        console.log("creating user");

        return done(null, user);
      }
    )
  );
};
