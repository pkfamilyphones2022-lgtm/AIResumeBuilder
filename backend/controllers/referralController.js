import {
  createReferral,
  updateReferralStatus,
  wasFriendReferredRecently
} from "../db/queries.js";
import { sendReferralInvite, sendReferralConfirmation } from "../services/emailService.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const trim = (s, max) => String(s || "").trim().slice(0, max);

export const sendReferral = async (req, res) => {
  try {
    const referrerName  = trim(req.body?.referrerName,  120);
    const referrerEmail = trim(req.body?.referrerEmail, 254).toLowerCase();
    const friendName    = trim(req.body?.friendName,    120);
    const friendEmail   = trim(req.body?.friendEmail,   254).toLowerCase();
    const personalNote  = trim(req.body?.personalNote,  500);

    if (!referrerName)                  return res.status(400).json({ error: "Your name is required." });
    if (!EMAIL_RE.test(referrerEmail))  return res.status(400).json({ error: "Your email looks invalid." });
    if (!EMAIL_RE.test(friendEmail))    return res.status(400).json({ error: "Your friend's email looks invalid." });
    if (referrerEmail === friendEmail)  return res.status(400).json({ error: "You can't refer yourself." });

    // Spam guard — don't email the same friend more than once in 24h
    if (wasFriendReferredRecently(friendEmail, 24)) {
      return res.status(429).json({
        error: "Your friend was already invited in the last 24 hours. Give them a day to check their inbox before sending again."
      });
    }

    // Persist queued referral
    let referralId = null;
    try {
      referralId = createReferral({
        referrerName,
        referrerEmail,
        friendName,
        friendEmail,
        personalNote,
        ip: req.ip
      });
    } catch (dbErr) {
      console.error("[referral] DB insert failed:", dbErr.message);
    }

    // Send invite to friend (primary email)
    const inviteResult = await sendReferralInvite({
      referrerName,
      referrerEmail,
      friendName,
      friendEmail,
      personalNote
    });

    if (!inviteResult.sent) {
      if (referralId) {
        try { updateReferralStatus(referralId, "failed"); } catch {}
      }
      return res.status(502).json({
        error: "We couldn't send the invite right now. Please try again in a minute."
      });
    }

    if (referralId) {
      try { updateReferralStatus(referralId, "sent"); } catch {}
    }

    // Fire-and-forget confirmation to referrer (don't fail the request if it fails)
    sendReferralConfirmation({ referrerName, referrerEmail, friendName, friendEmail })
      .catch((err) => console.error("[referral] confirmation send error:", err.message));

    return res.json({
      ok: true,
      referralId,
      message: `Invite sent to ${friendEmail}. Thanks for spreading the word!`
    });
  } catch (err) {
    console.error("[sendReferral]", err.message);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};
