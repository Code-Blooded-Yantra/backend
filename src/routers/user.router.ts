import { Router } from "express";
import { User } from "../models/user.model";
const { spawn } = require("child_process");

// comment
const userRouter = Router();

userRouter.post("/summarize", async (req, res) => {
  const inputText = req.body.text;

  // Spawn a child process to run your Python script
  const pythonProcess = spawn("python3", ["main_deploy_github.py", inputText]);

  pythonProcess.stdout.on("data", (data: any) => {
    const summary = data.toString().trim();
    console.log(summary);
    console.log(JSON.parse(summary));

    return res.json(summary);
  });

  pythonProcess.stderr.on("data", (data: any) => {
    console.error(data.toString());
    return res
      .status(500)
      .json({ error: "An error occurred during summarization" });
  });
});

userRouter.post("/", async (req, res) => {
  try {
    const user = new User({
      email: req.body.email,
      keywords: req.body.keywords,
    });
    const createdUser = await user.save();
    return res.json(createdUser);
  } catch (err) {
    return res.status(500).json({ msg: "Error" });
  }
});

userRouter.get("/matches", async (req, res) => {
  User.find({
    _id: { $ne: req.body.id },
    keywords: { $in: req.body.keywords },
    $and: [{ keywords: { $all: req.body.keywords } }],
  });
});

export default userRouter;
