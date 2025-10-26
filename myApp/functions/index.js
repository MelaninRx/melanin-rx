// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.getResources = functions.https.onRequest(async (req, res) => {
  const { trimester, location } = req.query;
  const db = admin.firestore();
  let query = db.collection("resources");

  if (trimester) query = query.where("trimester", "array-contains", trimester);
  if (location) query = query.where("location", "==", location);

  const snap = await query.get();
  const results = snap.docs.map(doc => doc.data());
  res.json(results);
});
