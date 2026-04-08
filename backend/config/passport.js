import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config({ path: "backend/config/config.env" });
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

passport.use(new GoogleStrategy({
  
    clientID: (process.env.GOOGLE_CLIENT_ID || "").trim(),
    clientSecret: (process.env.GOOGLE_CLIENT_SECRET || "").trim(),
    callbackURL: "http://localhost:1551/api/v1/google/callback"
  },
  // Inside your passport.use(new GoogleStrategy(...))
async (accessToken, refreshToken, profile, cb) => {
  try {
    // 1. Try to find the user by googleId OR email
    let user = await User.findOne({
      $or: [{ googleId: profile.id }, { email: profile.emails[0].value }]
    });

    const googleAvatar = profile.photos && profile.photos[0] ? profile.photos[0].value : "";

    if (!user) {
      // 2. Create NEW user if they don't exist
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        provider: "google",
        isVerified: true,
        avatar: {
          public_id: `google_${profile.id}`,
          url: googleAvatar
        }
      });
    } else {
      // 3. If user exists but has no avatar or googleId (Hybrid Login)
      // This fixes the record you showed me in your screenshot!
      user.googleId = profile.id;
      user.provider = "google";

      // Only update avatar if they don't have a custom Cloudinary one yet
      if (!user.avatar || !user.avatar.url) {
        user.avatar = {
          public_id: `google_${profile.id}`,
          url: googleAvatar
        };
      }
      await user.save();
    }
    return cb(null, user);
  } catch (error) {
    return cb(error, null);
  }
}
));
