import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  enhanceJobDescription,
  enhanceProfessionalSummary,
  generateArticle,
  generateImage,
  generateTitles,
  removeBackground,
  removeObject,
  reviewResume,
} from "../controllers/aiController.js";
import { upload } from "../configs/multer.js";

const aiRouter = express.Router();

aiRouter.post("/generate-article", auth, generateArticle);
aiRouter.post("/generate-titles", auth, generateTitles);
aiRouter.post("/generate-image", auth, generateImage);
aiRouter.post("/remove-background", upload.single("image"), auth, removeBackground);
aiRouter.post("/remove-object", upload.single("image"), auth, removeObject);
aiRouter.post("/resume-review", upload.single("resume"), auth, reviewResume);
aiRouter.post("/enhance-pro-sum", auth, enhanceProfessionalSummary);
aiRouter.post("/enhance-job-desc", auth, enhanceJobDescription);


export default aiRouter;
