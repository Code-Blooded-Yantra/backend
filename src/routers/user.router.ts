import { NextFunction, Request, Response, Router } from "express";
import { isLoggedIn } from "../middleware/auth.middleware";

const userRouter = Router();

userRouter.get(
  "/",
  isLoggedIn,
  (req: Request, res: Response, next: NextFunction) => {
    res.json(req.user);
  }
);

export default userRouter;
