import { Router } from "express";
import { handleGoogleConsentScreen, onSuccessGoogleOAuth, verifyToken, signout } from "../controllers/oauth.controller.js";

const oauthRouter = Router();

oauthRouter.get('/google', handleGoogleConsentScreen);
oauthRouter.get('/google/success', onSuccessGoogleOAuth);
oauthRouter.get('/verify/:token', verifyToken);
oauthRouter.get('/signout', signout);
export { oauthRouter }