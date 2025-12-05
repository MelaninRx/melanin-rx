/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");

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

exports.chatWithLangFlow = functions.https.onRequest(
  { secrets: ["LANGFLOW_API_KEY"] },
  async (req: any, res: any) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    try {
      const { message,stylePreference  } = req.body;
      const apiKey = process.env.LANGFLOW_API_KEY;
  
      // Debug logging
      console.log("API Key exists:", !!apiKey);
      console.log("API Key length:", apiKey?.length);
  
      const langflowUrl = "https://langflow.sail.codes/api/v1/run/6d64c638-920e-4156-a6de-54b5a7b69c93";
      console.log("Full URL:", `${langflowUrl}?api_key=${apiKey}`);
      console.log("Style Preference:", stylePreference);

    const response = await fetch(langflowUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey || ""
      },
      body: JSON.stringify({
        input_value: message,
        output_type: "chat",
        input_type: "chat",
        tweaks: {
          "TextInput-g8vVr": {
            "input_value": stylePreference || "standard"
          }
        }
      })
    });

      const data = await response.json();
      res.status(200).json(data);
    } catch (error: any) {
      console.error("LangFlow proxy error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      res.status(500).json({ error: error?.message || "Error connecting to LangFlow." });
    }
  }
);