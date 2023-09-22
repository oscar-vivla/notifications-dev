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
initializeApp();

const db = getFirestore();

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

exports.listenDevicesTokens = onDocumentCreated(
  "devices/{deviceId}",
  async (event) => {
    const tokenSnapshot = await db.collection("devices").get();
    try {
      console.log("is listener correctly");
      tokenSnapshot.forEach((doc) => {
        const token = doc.data().token;
        console.log(token);
      });
      return event.data.ref.set({ isListen: true }, { merge: true });
    } catch (error) {
      console.error("Error retrieving tokens:", error);
    }
  }
);

// export const listDeviceTokens = onRequest(async (req, res) => {
//     try {
//         const devicesSnapshot = await db.collection('devices').get();
//         const tokens = [];

//         devicesSnapshot.forEach(doc => {
//             const token = doc.data().token;
//             tokens.push(token);
//             console.log(tokens);
//             // TODO: send message to all tokens
//         });

//         return res.status(200).json({ tokens });
//     } catch (error) {
//         console.error('Error listing tokens:', error);
//         return res.status(500).send('Internal Server Error');
//     }
// });

// async function sendNotification(token) {
//     try {
//         const message = {
//             notification: {
//                 title: 'New Token Registered',
//                 body: 'A new token has been registered in the database.'
//             },
//             token: token
//         };

//         await messaging().send(message);
//         console.log('Notification sent to:', token);
//     } catch (error) {
//         console.error('Error sending the notification:', error);
//     }
// }

// _________________ FUNCION TOKENS DE PRUEBA
// export const addTokenToCollection = onRequest(async (req, res) => {
//     const token = req.query.token;

//     if (!token) {
//         return res.status(400).send('Token not provided');
//     }

//     try {
//         const tokenRef = db.collection('tokens_test').doc();
//         await tokenRef.set({ token: token });
//         return res.status(200).send('Token stored successfully');
//     } catch (error) {
//         console.error('Error storing token:', error);
//         return res.status(500).send('Internal Server Error');
//     }
// });
