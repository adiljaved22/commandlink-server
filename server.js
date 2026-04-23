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
});

console.log("✅ Firebase initialized");

app.get("/", (req, res) => res.send("WORKING ✔️"));

app.post("/send", async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).send("message required");

  try {
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

// ✅ Railway ke liye PORT fix
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));