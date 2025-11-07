
import { DocumentData } from "firebase-admin/firestore";
import { PROJECTS } from "./constant/collections";

import { app, db, logger, onRequest, setGlobalOptions } from "./imports";

setGlobalOptions({ maxInstances: 10 });

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

app.get("/projects-user/:userId", async (req, res) => {
  const uid = req.params.userId;

  if (!uid) {
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

  if (!projectId) {
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

// Expose the Express app as a single Cloud Function
exports.api = onRequest(app);
