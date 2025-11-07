## Imports
```
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import { setGlobalOptions } from "firebase-functions/v2";
```

* For cost control, limit maximum instances for V2 functions (V1 handles this differently)
* NOTE: setGlobalOptions does not apply to functions using the v1 API used below.
* V1 functions should each use functions.runWith({ maxInstances: 10 }) instead.
* setGlobalOptions({ maxInstances: 10 }); 

admin.initializeApp();
const db = admin.firestore();
const app = express();

## Automatically allow cross-origin requests
```
app.use(cors({ origin: true }));
app.use(express.json());
```
---
## Read All (GET)
```
app.get("/items", async (req, res) => {
  try {
    const snapshot = await db.collection("items").get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(items);
  } catch (error) {
    res.status(500).send(error);
  }
});
```

## Create (POST)
```
app.post("/items", async (req, res) => {
  try {
    const newItem = req.body;
    const docRef = await db.collection("items").add(newItem);
    res.status(201).json({ id: docRef.id, ...newItem });
  } catch (error) {
    res.status(500).send(error);
  }
});
```

## Read One (GET by ID)
```
app.get("/items/:id", async (req, res) => {
  const itemId = req.params.id;
  try {
    const doc = await db.collection("items").doc(itemId).get();
    if (!doc.exists) {
      res.status(404).send("Item not found");
    } else {
      res.status(200).json({ id: doc.id, ...doc.data() });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
```


## Update (PUT)
```
app.put("/items/:id", async (req, res) => {
  const itemId = req.params.id;
  try {
    await db.collection("items").doc(itemId).update(req.body);
    res.status(200).send(`Item ${itemId} updated`);
  } catch (error) {
    res.status(500).send(error);
  }
});
```

## Delete (DELETE)
```
app.delete("/items/:id", async (req, res) => {
  const itemId = req.params.id;
  try {
    await db.collection("items").doc(itemId).delete();
    res.status(200).send(`Item ${itemId} deleted`);
  } catch (error) {
    res.status(500).send(error);
  }
});
```

# Expose the Express app as a single Cloud Function named 'api'
```
export const api = functions.https.onRequest(app);
```
