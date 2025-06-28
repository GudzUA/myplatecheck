import admin from "firebase-admin";

function decodeFirebaseKey() {
  const base64 = process.env.FIREBASE_KEY_BASE64;
  if (!base64) throw new Error("Missing FIREBASE_KEY_BASE64");
  const jsonString = Buffer.from(base64, "base64").toString("utf-8");
  return JSON.parse(jsonString);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(decodeFirebaseKey()),
    storageBucket: "myplatecheck-8b211.appspot.com",
  });
}

const bucket = admin.storage().bucket();

export { admin, bucket };
