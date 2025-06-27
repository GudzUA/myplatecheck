import admin from "firebase-admin";
import fs from "fs";

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || "";
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "myplatecheck-8b211.firebasestorage.app", 
  });
}

const bucket = admin.storage().bucket();

export { admin, bucket };
