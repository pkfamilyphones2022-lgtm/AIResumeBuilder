import express from "express";
import multer from "multer";
import {
  generateResume,
  generationChallenge,
  uploadResume,
  atsScore,
  suggestKeywords,
  improveResume
} from "../controllers/resumeController.js";
import {
  createPaymentOrder,
  getPaymentQuote,
  verifyPayment,
  checkPaymentToken,
  recordResumeDownload,
  emailResumeAttachments,
  getSubscriptionStatus,
  useSubscriptionDownload
} from "../controllers/paymentController.js";
import { adminDeleteUserData, adminOverview, adminSendResume, adminTriggerBackup, requireAdmin } from "../controllers/adminController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF resumes are supported."));
      return;
    }
    cb(null, true);
  }
});

router.post("/generate", generateResume);
router.get("/challenge", generationChallenge);
router.post("/upload", upload.single("resume"), uploadResume);
router.post("/ats", atsScore);
router.post("/suggest", suggestKeywords);
router.post("/improve", improveResume);
router.post("/payment/quote", getPaymentQuote);
router.post("/payment/order", createPaymentOrder);
router.post("/payment/verify", verifyPayment);
router.post("/payment/check", checkPaymentToken);
router.post("/payment/download", recordResumeDownload);
router.post("/payment/email-attachments", emailResumeAttachments);
router.post("/payment/subscription/status", getSubscriptionStatus);
router.post("/payment/subscription/use", useSubscriptionDownload);
router.get("/admin/overview", requireAdmin, adminOverview);
router.post("/admin/resumes/:resumeId/send", requireAdmin, adminSendResume);
router.post("/admin/users/delete-by-email", requireAdmin, adminDeleteUserData);
router.post("/admin/backup", requireAdmin, adminTriggerBackup);

export default router;
