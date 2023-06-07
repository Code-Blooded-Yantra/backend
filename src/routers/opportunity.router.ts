import { NextFunction, Request, Response, Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { isLoggedIn } from "../middleware/auth.middleware";
import { Opportunity } from "../models/opportunity.model";
import { Types } from "mongoose";
const opportunityRouter = Router();

opportunityRouter.get(
  "/",
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      let opportunities = Opportunity.find({});

      if (!req.isAuthenticated()) {
        opportunities = opportunities.select(["-emailAddress", "-link"]);
      }

      res.json(await opportunities);
    }
  )
);

opportunityRouter.get(
  "/user",
  isLoggedIn,
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // @ts-ignore
      const userID = new Types.ObjectId(req.user._id);

      let opportunity = Opportunity.find({ createdBy: userID });

      if (!req.isAuthenticated()) {
        opportunity = opportunity.select(["-emailAddress", "-link"]);
      }

      const opportunityData = await opportunity;

      res.json(opportunityData);
    }
  )
);

opportunityRouter.get(
  "/:id",
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      let opportunity = Opportunity.findById(req.params.id);

      if (!req.isAuthenticated()) {
        opportunity = opportunity.select(["-emailAddress", "-link"]);
      }

      const opportunityData = await opportunity;

      res.json(opportunityData);
    }
  )
);

opportunityRouter.post(
  "/",
  isLoggedIn,
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const opportunity = new Opportunity({
        ...req.body,
        // @ts-ignore
        createdBy: req.user._id,
      });
      const createdOpportunity = await opportunity.save();
      res.json(createdOpportunity);
    }
  )
);

opportunityRouter.delete(
  "/:id",
  isLoggedIn,
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const opportunity = await Opportunity.findById(req.params.id);
      if (opportunity) {
        await Opportunity.deleteOne({ _id: req.params.id });
        res.json({ message: "Opportunity removed" });
      } else {
        res.status(404);
        throw new Error("Opportunity not found");
      }
    }
  )
);

opportunityRouter.put(
  "/:id",
  isLoggedIn,
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const opportunity = await Opportunity.findById(req.params.id);
      if (opportunity) {
        const updatedOpportunity = await Opportunity.findOneAndUpdate(
          { _id: req.params.id },
          { $set: req.body },
          { new: true }
        );
        res.status(200).json(updatedOpportunity);
      } else {
        res.status(404);
        throw new Error("Opportunity not found");
      }
    }
  )
);

export default opportunityRouter;
