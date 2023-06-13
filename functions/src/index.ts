// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const functions = require("firebase-functions")

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

export const onMessageUpdate = functions.firestore.document("/events/{docID}")
.onWrite(async (change: any, context: any) => {
    const after = change.after.data();
    const d = after.accepted_id;
    console.log(d);
    return db.doc(`/users/${d}`).set({ dummy_message: "You were accepted for event {docID}" });
})