import express from "express";
import env from 'dotenv';
import { oauthRouter } from "./routes/oauth.route.js";

env.config();

const server = express();

server.use('/api/oauth', oauthRouter);

server.listen(8080, () => {
    console.log('Server listening ...')
})