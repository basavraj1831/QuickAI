import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import fs from "fs";
import imagekit from "../configs/imagekit.js";

export const createResume = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { title } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached.! Upgrade to continue.",
      });
    }

    const result =
      await sql`INSERT INTO resumes (user_id, title) VALUES (${userId}, ${title}) RETURNING *;`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, resume: result });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { resumeId } = req.params;

    const [resume] = await sql`
      SELECT * FROM resumes WHERE user_id = ${userId} AND id = ${resumeId} LIMIT 1;
    `;

    if (!resume) {
      return res.json({ success: false, message: "Resume not found" });
    }

    return res.json({
      success: true,
      resume,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllResumes = async (req, res) => {
  try {
    const { userId } = req.auth();

    const resumes = await sql`
      SELECT * FROM resumes WHERE user_id = ${userId};
    `;

    return res.json({
      success: true,
      resumes,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const updateResume = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    let { resumeId, resumeData, removeBackground } = req.body;

    resumeData = JSON.parse(resumeData);
    
    if (image) {
      const imageBufferData = fs.createReadStream(image.path);
      const response = await imagekit.files.upload({
        file: imageBufferData,
        fileName: "resume.png",
        folder: "user-resumes",
        transformation: {
          pre:
            "w-300, h-300, fo-face, z-0.75" +
            (removeBackground ? ",e-bgremove" : ""),
        },
      });
      resumeData.personal_info.image = response.url;
    }

    const [resume] = await sql`
      UPDATE resumes
      SET
        personal_info = ${JSON.stringify(resumeData.personal_info)},
        professional_summary = ${resumeData.professional_summary},
        experience = ${JSON.stringify(resumeData.experience)},
        education = ${JSON.stringify(resumeData.education)},
        project = ${JSON.stringify(resumeData.project)},
        skills = ${resumeData.skills},
        template = ${resumeData.template},
        accent_color = ${resumeData.accent_color},
        public = ${resumeData.public},
        updated_at = NOW()
      WHERE id = ${resumeId} AND user_id = ${userId}
      RETURNING *;
      `;

    if (!resume) {
      return res.json({ success: false, message: "Resume not found" });
    }

    res.json({ success: true, resume, message: "Resume saved successfully." });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const updateResumeVisibility = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { visible, resumeId } = req.body;

    const [resume] = await sql`
      UPDATE resumes
      SET
        public = ${visible}
      WHERE id = ${resumeId} AND user_id = ${userId}
      RETURNING *;
      `;

    if (!resume) {
      return res.json({ success: false, message: "Resume not found" });
    }

    res.json({ success: true, resume });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { resumeId } = req.params;

    await sql`
      DELETE FROM resumes
      WHERE id = ${resumeId} AND user_id = ${userId}
    `;

    res.json({ success: true, message: "Resume Deleted Successfully" });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const [resume] = await sql`
      SELECT * FROM resumes WHERE public = true AND id = ${resumeId} LIMIT 1;
    `;

    if (!resume) {
      return res.json({ success: false, message: "Resume not found" });
    }

    return res.json({
      success: true,
      resume,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
