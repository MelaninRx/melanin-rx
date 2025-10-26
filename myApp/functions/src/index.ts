/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
// import {onRequest} from "firebase-functions/https";
// import * as logger from "firebase-functions/logger";

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
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


import * as functions from "firebase-functions/v2";
import admin from "firebase-admin";
import fetch from "node-fetch";

admin.initializeApp();
const db = admin.firestore();

const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY;

export const getResources = functions.https.onRequest(
  { region: "us-central1", maxInstances: 10 },
  async (req, res) => {
    res.set({
      "Access-Control-Allow-Origin": "http://localhost:8100",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    });

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      const { trimester, location, interests = [] } = req.body;

      // 1️⃣ Query Firestore
      const snapshot = await db
        .collection("resources")
        .where("location", "in", [location, "national"])
        .get();

      const allResources = snapshot.docs.map((doc) => doc.data());
      const filtered = allResources.filter(
        (r: any) => Array.isArray(r.trimester) && r.trimester.includes(trimester)
      );

      const payload = { trimester, location, interests, resources: filtered };

      // 2️⃣ Call LangFlow
      const lfResponse = await fetch(
        "https://langflow.sail.codes/api/v1/run/5ac1f0f4-84b8-4ee1-935b-c7991eea1fb5?stream=false",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LANGFLOW_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input_value: JSON.stringify(payload),
            input_type: "text",
            output_type: "json",
          }),
        }
      );

      const data = await lfResponse.json();

      // 3️⃣ Extract the JSON text safely
      let uiLayout = {};

      const textOutput =
        data.outputs?.[0]?.outputs?.[0]?.results?.message?.text ??
        data.outputs?.[0]?.outputs?.[0]?.results?.message?.data;

      if (textOutput) {
        try {
          uiLayout = JSON.parse(textOutput);
        } catch (parseErr) {
          console.warn("⚠️ Could not parse LangFlow JSON:", parseErr);
        }
      } else {
        console.warn("⚠️ LangFlow returned no message text:", data);
      }

      // 4️⃣ Return generated layout
      res.status(200).json(uiLayout);
    } catch (err: any) {
      console.error("Error in getResources:", err);
      res.status(500).json({ error: err.message || "Unexpected error" });
    }
  }
);











