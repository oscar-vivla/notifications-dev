/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const serviceAccount = require("./config/serviceAccountKey.json");
const { credential } = require("firebase-admin");
// initializeApp();

initializeApp({
  credential: credential.cert(serviceAccount),
});

const db = getFirestore();
const messaging = getMessaging();

exports.registerDeviceToken = onRequest(async (req, res) => {
  const token = req.query.token;

  try {
    const tokenDevice = await db.collection("devices").add({ token: token });
    return res
      .status(200)
      .json({ result: `Token ${tokenDevice.id} stored successfully` });
  } catch (error) {
    console.error("Error storing token:", error);
    return res.status(500).send("Internal Server Error");
  }
});

exports.onRegisterTokens = onDocumentCreated(
  "devices/{deviceId}",
  async (event) => {
    const tokenSnapshot = await db.collection("devices").get();
    try {
      console.log("is listener correctly");
      tokenSnapshot.forEach((doc) => {
        const token = doc.data().token;
        // TODO: send notificacions to list of tokens
      });
      return event.data.ref.set(
        { createdAt: serverTimestamp() },
        { merge: true }
      );
    } catch (error) {
      console.error("Error retrieving tokens:", error);
    }
  }
);

/**
 *
 * @param {string} token
 * @param {string} txtmessage
 */
function sendNotification(token, txtmessage) {
  try {
    const message = {
      data: {
        title: "notification",
        body: txtmessage,
      },
      token: token,
    };

    messaging.send(message);
    console.log(
      `send notification title: ${message.notification.title},
      body: ${message.notification.body} to token: ${token}`
    );
  } catch (error) {
    console.error("Error sending the notification:", error);
  }
}

exports.TEST = onRequest(async (req, res) => {
  sendNotification("hola", "adios");
  return res.status(200).send({ rsult: "exito" });
});

exports.sendBroadcastNotification = onRequest(async (req, res) => {
  console.log("entroo");
  const message = req.query.message;
  const tokenList = await db.collection("devices").get();
  try {
    tokenList.forEach((doc) => {
      const token = doc.data().token;
      // TODO: send notificacions to list of tokens
      sendNotification(token, message);
    });
    // return event.data.ref.set({ triggerWorking: "yes" }, { merge: true });
    return res.status(200).send({ result: "Send message sucessfully" });
  } catch (error) {
    console.error("Error retrieving tokens:", error);
    return res.status(500).send("Error to list tokens and send message");
  }
});
