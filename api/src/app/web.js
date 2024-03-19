import express from "express";
import {errorMiddleware} from "../middleware/error-middleware.js";
import {publicRouter} from "../routes/public-api.js";
import {userRouter} from "../routes/api.js";
import { config as dotenvConfig } from "dotenv";

export const web = express();
web.use(express.json());

web.use(express.static('public'));
web.use(publicRouter);
web.use(userRouter);
dotenvConfig();

web.use(errorMiddleware);