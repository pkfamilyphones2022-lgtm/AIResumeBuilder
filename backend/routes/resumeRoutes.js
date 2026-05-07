import express from "express";
import multer from "multer";
import {
  generateResume,
  uploadResume,
  atsScore,
  suggestKeywords,
  improveResume
} from "../controllers/resumeController.js";
import {
  createPaymentOrder,
  verifyPayment,
  checkPaymentToken
} from "../controllers/paymentController.js";

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
router.post("/upload", upload.single("resume"), uploadResume);
router.post("/ats", atsScore);
router.post("/suggest", suggestKeywords);
router.post("/improve", improveResume);
router.post("/payment/order", createPaymentOrder);
router.post("/payment/verify", verifyPayment);
router.post("/payment/check", checkPaymentToken);

export default router;
