import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "myplatecheck-8b211.appspot.com",
  });
}

const bucket = admin.storage().bucket();

export { admin, bucket };
