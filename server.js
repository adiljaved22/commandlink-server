const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://commandlink-b3dc3-default-rtdb.firebaseio.com"
  //               ☝️ YAHAN apna Firebase project ID daalo
});

console.log("✅ Firebase initialized");

app.get("/", (req, res) => res.send("WORKING ✔️"));

app.post("/send", async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).send("message required");

  try {
    // Token khud Firebase se read karega
    const snapshot = await admin.database().ref("servant_token").get();

    if (!snapshot.exists()) {
      return res.status(404).send("Token nahi mila — Servant app pehle open karo");
    }

    const token = snapshot.val();

    await admin.messaging().send({
      token: token,
      notification: {
        title: "⚡ Boss Command",
        body: message
      },
      data: {
        body: message
      },
      android: {
        priority: "high",
        notification: {
          channelId: "cmd_sound",
          sound: "default"
        }
      }
    });

    res.send("Sent ✔️");

  } catch (e) {
    console.log("ERROR:", e.message);
    res.status(500).send("Error: " + e.message);
  }
});

app.listen(3000, () => console.log("Server running on 3000"));