
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import { DocumentData } from "firebase-admin/firestore";
import { PROJECTS } from "./constant/collections";

import express from "express";
import admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const app = express();

app.use(express.json());

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//     logger.info("Hello logs!", { structuredData: true });
//     response.send("Hello from Firebase!");
// });


// // READ (GET by ID)
// custom API to get projects by user ID

app.get("/", async (req, res) => {
    logger.info("Hello logs!", { structuredData: true });
    res.send("Hello from Firebase!");
    return
});

app.get("/projects", async (req, res) => {
    const doc = await db.collection(PROJECTS).get();
    if (doc.empty) {
        res.status(404).send({ error: "Project not found" });
        return
    } else {
        const items: DocumentData[] = [];
        doc.forEach((document) => {
            items.push({
                uid: document.id,
                ...document.data()
            });
        });
        res.status(200).send(items);
        return
    }
});

app.get("/projects/user/:userId", async (req, res) => {
    const uid = req.params.userId;

    if (!uid){
        res.status(404).send({ error: "user id not found" });
        return
    }

    const projectRef = await db.collection(PROJECTS);
    const snapshot = await projectRef.where("ownerId", "==", uid).get();
    if (snapshot.empty) {
        res.status(404).send({ error: "Project not found" });
        return
    } else {
        const items: DocumentData[] = [];
        snapshot.forEach((doc) => {
            items.push({
                uid: doc.id,
                ...doc.data()
            });
        });
        res.status(200).send(items);
        return
    }
});


app.get("/project/:projectId", async (req, res) => {
    const projectId = req.params.projectId;
    
    if (!projectId){
        res.status(404).send({ error: "Project id not found" });
        return
    }
    
    const snapshot = await db.collection(PROJECTS).doc(projectId).get();
    if (!snapshot.exists) {
        res.status(404).send({ error: "Project not found" });
    } else {
        res.status(200).send(snapshot.data());
    }
});

// Expose the Express API as a single Cloud Function
exports.api = onRequest(app);
