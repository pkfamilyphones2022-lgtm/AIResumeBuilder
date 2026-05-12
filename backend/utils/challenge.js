import crypto from "crypto";

const getSecret = () => {
  const secret = process.env.ACCESS_TOKEN_SECRET || process.env.ADMIN_ACCESS_TOKEN;
  if (!secret) {
    if (process.env.NODE_ENV === "production")
      throw new Error("ACCESS_TOKEN_SECRET must be set in production");
    return "dev-challenge-secret";
  }
  return secret;
};

const sign = (payload) =>
  crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");

const W = ["zero","one","two","three","four","five","six","seven","eight","nine",
           "ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen"];

// Each generator returns { question: string, answer: number }
const GENERATORS = [
  // Numeric addition
  () => {
    const a = Math.floor(Math.random() * 13) + 3;
    const b = Math.floor(Math.random() * 13) + 3;
    return { question: `${a} + ${b} = ?`, answer: a + b };
  },
  // Numeric subtraction (result always positive)
  () => {
    const b = Math.floor(Math.random() * 8) + 2;
    const a = b + Math.floor(Math.random() * 10) + 3;
    return { question: `${a} − ${b} = ?`, answer: a - b };
  },
  // Numeric multiplication (small numbers)
  () => {
    const a = Math.floor(Math.random() * 7) + 2;
    const b = Math.floor(Math.random() * 5) + 2;
    return { question: `${a} × ${b} = ?`, answer: a * b };
  },
  // Word-form addition
  () => {
    const a = Math.floor(Math.random() * 10) + 3;
    const b = Math.floor(Math.random() * 10) + 3;
    return { question: `What is ${W[a]} plus ${W[b]}?`, answer: a + b };
  },
  // Word-form subtraction
  () => {
    const b = Math.floor(Math.random() * 6) + 2;
    const a = b + Math.floor(Math.random() * 8) + 2;
    return { question: `What is ${W[a]} minus ${W[b]}?`, answer: a - b };
  },
  // Word-form multiplication
  () => {
    const a = Math.floor(Math.random() * 5) + 2;
    const b = Math.floor(Math.random() * 4) + 2;
    return { question: `What is ${W[a]} times ${W[b]}?`, answer: a * b };
  },
  // Word problem — buying items
  () => {
    const have = Math.floor(Math.random() * 9) + 4;
    const buy  = Math.floor(Math.random() * 6) + 2;
    return { question: `You have ${have} pens and buy ${buy} more. How many total?`, answer: have + buy };
  },
  // Word problem — items remaining
  () => {
    const take = Math.floor(Math.random() * 6) + 2;
    const total = take + Math.floor(Math.random() * 8) + 3;
    return { question: `A basket has ${total} apples. ${take} are removed. How many remain?`, answer: total - take };
  },
  // Word problem — students
  () => {
    const a = Math.floor(Math.random() * 10) + 5;
    const b = Math.floor(Math.random() * 6) + 2;
    return { question: `${a} students are in class. ${b} more join. How many now?`, answer: a + b };
  },
];

export const createChallenge = () => {
  const { question, answer } = GENERATORS[Math.floor(Math.random() * GENERATORS.length)]();

  // Store only the hashed answer — not the plaintext answer — so decoding the token
  // does not directly reveal it. Verification recomputes the same hash.
  const answerHash = crypto.createHash("sha256").update(String(answer)).digest("hex");

  const payload = Buffer.from(JSON.stringify({
    answerHash,
    expiresAt: Date.now() + 5 * 60 * 1000,
    nonce: crypto.randomBytes(8).toString("hex")
  })).toString("base64url");

  return {
    challengeId: `${payload}.${sign(payload)}`,
    question
  };
};

export const verifyChallenge = ({ challengeId, answer }) => {
  try {
    const [payload, signature] = String(challengeId || "").split(".");
    if (!payload || !signature || sign(payload) !== signature) return false;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (Date.now() > Number(parsed.expiresAt || 0)) return false;
    const submitted = crypto.createHash("sha256").update(String(answer || "").trim()).digest("hex");
    return submitted === parsed.answerHash;
  } catch {
    return false;
  }
};
