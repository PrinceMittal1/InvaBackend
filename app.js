const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const admin = require("firebase-admin");

// Load environment variables
dotenv.config();

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

// Middleware
app.use(cors({
  origin: "*", // or replace "*" with your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("✅ API is working!");
});

app.post("/send-notification", async (req, res) => {
  try {
    const { token, title, body } = req.body;

    const message = {
      notification: { title, body },
      token,
    };

    await admin.messaging().send(message);
    res.status(200).json({ success: true, message: "Notification sent!" });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoute");
const sellerRoutes = require("./routes/sellerRoute");
const contentRoutes = require("./routes/contentRoutes");

app.use("/.well-known", express.static(path.join(__dirname, ".well-known")));
app.get("/product/:id", (req, res) => {
  const { id } = req.params;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Product ${id}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script>
        // Try opening app via custom scheme
        window.location = "myapp://product/${id}";

        // Redirect to store after 1 second if app not installed
        setTimeout(() => {
          const ua = navigator.userAgent || navigator.vendor || window.opera;
          if (/android/i.test(ua)) {
            window.location = "https://play.google.com/store/apps/details?id=com.invaID";
          } else if (/iPad|iPhone|iPod/.test(ua)) {
            window.location = "https://apps.apple.com/app/idYOUR_APPLE_ID";
          }
        }, 1000);
      </script>
    </head>
    <body>
      <h1>Product ${id}</h1>
      <p>Open in the app for full experience.</p>
      <a href="https://play.google.com/store/apps/details?id=com.invaID">Download for Android</a><br/>
      <a href="https://apps.apple.com/app/idYOUR_APPLE_ID">Download for iOS</a>
    </body>
    </html>
  `);
});
app.use("/api/users", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/content", contentRoutes);


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// app.listen(PORT, "0.0.0.0", () => 
//   console.log(`🚀 Server running on http://0.0.0.0:${PORT}`)
// );
module.exports = app;
