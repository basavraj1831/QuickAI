import express from "express";
import { auth } from "../middlewares/auth.js";
import { upload } from "../configs/multer.js";
import { createResume, deleteResume, getAllResumes, getPublicResumeById, getResumeById, updateResume, updateResumeVisibility } from "../controllers/resumeController.js";

const resumeRouter = express.Router();

resumeRouter.post("/create-resume", auth, createResume);
resumeRouter.get("/get-resume/:resumeId", auth, getResumeById);
resumeRouter.get("/get-all-resumes", auth, getAllResumes);
resumeRouter.delete("/delete-resume/:resumeId", auth, deleteResume);
resumeRouter.put("/update-resume",upload.single("image"),auth,updateResume);
resumeRouter.delete("/delete-resume/:resumeId", auth, deleteResume);
resumeRouter.put("/update-resume-visible", auth, updateResumeVisibility );
resumeRouter.get("/get-public-resume/:resumeId", getPublicResumeById);


export default resumeRouter;
