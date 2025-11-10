/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

//import {onRequest} from "firebase-functions/https";
//import * as logger from "firebase-functions/logger";

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

admin.initializeApp();
functions.setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const LANGFLOW_URL = process.env.LANGFLOW_URL;
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY;

export const chatWithLangFlow = functions.https.onRequest(async (req: any, res: any) => {
  // Log the start of the function
  console.log("=== chatWithLangFlow TRIGGERED ===");
  console.log("Method:", req.method);
  console.log("Origin:", req.headers.origin);

  try {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(204).send();

    // Validate environment variables
    if (!LANGFLOW_URL || !LANGFLOW_API_KEY) {
      console.error("=== MISSING ENV VARS ===");
      console.error("Has URL:", !!LANGFLOW_URL);
      console.error("Has Key:", !!LANGFLOW_API_KEY);
      return res.status(500).json({
        error: "Server configuration error: Missing LangFlow credentials",
      });
    }

    console.log("=== ENV VARS LOADED ===");
    console.log("URL length:", LANGFLOW_URL?.length);
    console.log("Key length:", LANGFLOW_API_KEY?.length);

    // Validate request body
    if (!req.body || !req.body.message) {
      console.warn("=== INVALID REQUEST ===");
      console.warn("Body:", req.body);
      return res.status(400).json({
        error: "Missing 'message' in request body",
      });
    }

    const { message, user } = req.body;

    console.log("=== SENDING TO LANGFLOW ===");
    console.log("Message length:", message.length);
    console.log("User:", user?.name || "Guest");

    // Prepare LangFlow request
    const langflowPayload = {
      inputs: {
        input_text: message,
        name: user?.name || "Guest",
        user_id: user?.id || "anon",
      },
    };

    console.log("=== PAYLOAD ===");
    console.log(JSON.stringify(langflowPayload));

    // set API key as query parameter
    const langflowUrl = new URL(LANGFLOW_URL);
    langflowUrl.searchParams.append('api_key', LANGFLOW_API_KEY!);
    
    console.log("=== CALLING LANGFLOW ===");
    console.log("URL:", LANGFLOW_URL);
    
    const response = await fetch(langflowUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(langflowPayload),
    });

    console.log("=== LANGFLOW RESPONSE ===");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);

    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error("=== LANGFLOW ERROR ===");
      console.error("Status:", response.status);
      console.error("Error:", errorText);
      return res.status(response.status).json({
        error: `LangFlow error: ${response.statusText}`,
        details: errorText,
      });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error: any) {
    console.error("=== EXCEPTION ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    
    return res.status(500).json({
      error: "Error connecting to LangFlow",
      details: error.message,
    });
  }
});

/**
 * Get filtered resources from Firestore
 */
export const getResources = functions.https.onRequest(async (req: any, res: any) => {
  logger.info("getResources function triggered", {
    trimester: req.query.trimester,
    location: req.query.location,
  });

  try {
    // CORS headers
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(204).send();
    }

    const { trimester, location } = req.query;
    const db = admin.firestore();
    let query: any = db.collection("resources");

    if (trimester) {
      query = query.where("trimester", "array-contains", trimester);
    }
    if (location) {
      query = query.where("location", "==", location);
    }

    const snap = await query.get();
    const results = snap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    logger.info("Resources fetched successfully", {
      count: results.length,
    });

    return res.json(results);
    
  } catch (error: any) {
    logger.error("Error fetching resources", {
      error: error.message,
      stack: error.stack,
    });
    
    return res.status(500).json({
      error: "Error fetching resources",
      details: error.message,
    });
  }
});