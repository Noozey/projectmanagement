import express from "express";
import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;

const tokenRouter = express.Router();

const nocache = (req, resp, next) => {
  resp.header("Cache-Control", "private,no-cache,no-store,must-revalidate");
  resp.header("Expires", -1);
  resp.header("Pragma", "no-cache");
  next();
};

export const generateAccessToken = (req, res) => {
  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERT;

  if (!appID || !appCertificate) {
    console.error("Missing AGORA_APP_ID or AGORA_APP_CERT");
    return res.status(500).json({
      error: "Agora APP ID or Certificate missing -- check .env file",
    });
  }

  const channelName =
    req.query.channelName || Math.random().toString(36).substring(2, 10);

  const uid = Math.floor(Math.random() * 10000);
  const role = RtcRole.PUBLISHER;

  const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + 3600;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uid,
    role,
    expirationTimeInSeconds,
  );

  return res.json({ channelName, uid, token });
};

tokenRouter.get("/", nocache, generateAccessToken);

export { tokenRouter };
