import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { isLoggedIn } from "../middleware/auth.middleware";
import expressAsyncHandler from "express-async-handler";
const authRouter = Router();

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: true,
    failureRedirect: "/auth/failed",
    successRedirect: "/auth/success",
  })
);

authRouter.get(
  "/logout",
  isLoggedIn,
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      await req.logout((err) => {
        if (err) {
          throw err;
        }
      });

      res.json({ message: "Successfully logged out" });
    }
  )
);

authRouter.get("/failed", (req: Request, res: Response, next: NextFunction) => {
  res.status(401);
  return next(new Error("Failed to authenticate"));
});

authRouter.get(
  "/success",
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      res.redirect(process.env.POST_AUTH_REDIRECT_URL);
      return;
    }
  )
);

export default authRouter;
