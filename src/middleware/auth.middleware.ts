import { NextFunction, Request, Response } from "express";

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  // Checking if user is authenticated
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401);
    next(new Error("User not authenticated"));
  }
};
