
import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import cors from 'cors';
import express from 'express';
import admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

const app = express();

app.use(express.json());
app.use(cors({ origin: true }));
app.use((req, res, next) => {
    if (req.url.indexOf('/api/') === 0) {
        req.url = req.url.substring('/api'.length);
    }
    next();
});

export { app, db, logger, onRequest, setGlobalOptions };