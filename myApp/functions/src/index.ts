/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const fetch = require("node-fetch");

;// import {onRequest} from "firebase-functions/https";
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

functions.setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.chatWithLangFlow = functions.https.onRequest(async (req: any, res: any) => {
  try {
    const { message, user } = req.body;
    const apiKey = functions.config().langflow.api_key;
    const langflowUrl = "http://localhost:7860/api/v1/run/adb0eec5-c7e1-49fe-a46d-be1e21880053"

    const response = await fetch(langflowUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: {
          input_text: message,
          name: user?.name || "Guest",
          user_id: user?.id || "anon",
        },
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("LangFlow proxy error:", error);
    res.status(500).send("Error connecting to LangFlow.");
  }
});
