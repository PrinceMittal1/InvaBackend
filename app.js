const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize express
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

// Import and use route files
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoute");
const sellerRoutes = require("./routes/sellerRoute");
const contentRoutes = require("./routes/contentRoutes");

app.use("/.well-known", express.static(path.join(__dirname, ".well-known")));
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
