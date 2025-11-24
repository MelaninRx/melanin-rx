/**
* Import function triggers from their respective submodules:
*
* import {onCall} from "firebase-functions/v2/https";
* import {onDocumentWritten} from "firebase-functions/v2/firestore";
*
* See a full list of supported triggers at https://firebase.google.com/docs/functions
*/


const functions = require("firebase-functions");


functions.setGlobalOptions({ maxInstances: 10 });


exports.chatWithLangFlow = functions.https.onRequest(
 { secrets: ["LANGFLOW_API_KEY"] },
 async (req: any, res: any) => {
   console.log("=== FUNCTION TRIGGERED ===");
   console.log("Method:", req.method);
   console.log("Origin:", req.headers.origin);


   // Enable CORS
   res.set('Access-Control-Allow-Origin', '*');
   res.set('Access-Control-Allow-Methods', 'GET, POST');
   res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  
   // Handle preflight requests
   if (req.method === 'OPTIONS') {
     console.log("OPTIONS request handled");
     res.status(204).send('');
     return;
   }
  
   try {
     const { message } = req.body;
     const apiKey = process.env.LANGFLOW_API_KEY;
     const langflowUrl = "https://langflow.sail.codes/api/v1/run/6d64c638-920e-4156-a6de-54b5a7b69c93";


     // Log environment variables
     console.log("=== ENV VARS CHECK ===");
     console.log("API Key exists:", !!apiKey);
     console.log("API Key length:", apiKey?.length);
     console.log("First 10 chars:", apiKey?.substring(0, 10));
     console.log("Last 5 chars:", apiKey?.substring(apiKey.length - 5));


     // Log request details
     console.log("=== REQUEST DETAILS ===");
     console.log("Message:", message);
     console.log("Message length:", message?.length);
     console.log("Langflow URL:", langflowUrl);


     console.log("=== CALLING LANGFLOW ===");


     const response = await fetch(langflowUrl, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         "x-api-key": apiKey || ""
       },
       body: JSON.stringify({
         input_value: message,
         output_type: "chat",
         input_type: "chat"
       }),
     });


     console.log("=== LANGFLOW RESPONSE ===");
     console.log("Status:", response.status);
     console.log("Status Text:", response.statusText);


     const data = await response.json();
     console.log("Response data keys:", Object.keys(data as any));
    
     res.status(200).json(data);
   } catch (error: any) {
     console.error("=== ERROR OCCURRED ===");
     console.error("LangFlow proxy error:", error);
     console.error("Error message:", error?.message);
     console.error("Error stack:", error?.stack);
     res.status(500).json({ error: error?.message || "Error connecting to LangFlow." });
   }
 }
);
