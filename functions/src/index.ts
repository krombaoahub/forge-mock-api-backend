
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
// app.get("/projects/:id", async (req, res) => {
//     console.log(req, res)
//     const projectId = req.params.id; // Access parameters from the URL
//     const doc = await db.collection("projects").doc(projectId).get();
//     if (!doc.exists) {
//         res.status(404).send({ error: "Project not found" });
//     } else {
//         res.status(200).send(doc.data());
//     }
// });

// custom API to get projects by user ID

app.get("/", async (req, res) => {
    logger.info("Hello logs!", { structuredData: true });
    res.send("Hello from Firebase!");
});

app.get("/projects/user/:userId", async (req, res) => {
    const uid = req.params.userId;
    const projectRef = await db.collection(PROJECTS);
    const snapshot = await projectRef.where("ownerId", "==", uid).get();
    if (snapshot.empty) {
        res.status(404).send({ error: "Project not found" });
    } else {
        const items: DocumentData[] = [];
        snapshot.forEach((doc) => {
            items.push({
                uid: doc.id,
                ...doc.data()
            });
        });
        res.status(200).send(items);
    }
});

// Expose the Express API as a single Cloud Function
exports.api = onRequest(app);
