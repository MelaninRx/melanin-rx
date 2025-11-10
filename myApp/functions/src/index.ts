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

const LANGFLOW_URL = process.env.LANGFLOW_URL!;
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY;

exports.chatWithLangFlow = functions.https.onRequest(async (req: any, res: any) => {
    // Log the start of the function
    logger.info("chatWithLangFlow function triggered", {
      method: req.method,
      origin: req.headers.origin,
    });
  try {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(204).send();

    // Validate environment variables
    if (!LANGFLOW_URL || !LANGFLOW_API_KEY) {
      logger.error("Missing environment variables", {
        hasUrl: !!LANGFLOW_URL,
        hasKey: !!LANGFLOW_API_KEY,
      });
      return res.status(500).json({
        error: "Server configuration error: Missing LangFlow credentials",
      });
    }

    logger.info("Environment variables loaded", {
      urlLength: LANGFLOW_URL?.length,
      keyLength: LANGFLOW_API_KEY?.length,
    });

    // Validate request body
    if (!req.body || !req.body.message) {
      logger.warn("Invalid request body", { body: req.body });
      return res.status(400).json({
        error: "Missing 'message' in request body",
      });
    }

    const { message, user } = req.body;

    logger.info("Sending request to LangFlow", {
      messageLength: message.length,
      userName: user?.name || "Guest",
      userId: user?.id || "anon",
    });

    // Prepare LangFlow request
    const langflowPayload = {
      inputs: {
        input_text: message,
        name: user?.name || "Guest",
        user_id: user?.id || "anon",
      },
    };

    logger.info("LangFlow payload prepared", {
      payload: JSON.stringify(langflowPayload),
    });

    const response = await fetch(LANGFLOW_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LANGFLOW_API_KEY}`,
      },
      body: JSON.stringify(langflowPayload),
    });

    logger.info("LangFlow response received", {
      status: response.status,
      statusText: response.statusText,
    });

    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      logger.error("LangFlow returned error", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return res.status(response.status).json({
        error: `LangFlow error: ${response.statusText}`,
        details: errorText,
      });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error: any) {
    logger.error("Exception in chatWithLangFlow", {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    
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