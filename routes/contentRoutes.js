const express = require("express");
const router = express.Router();

// Today's Date
const today = new Date().toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric"
});

// ---------------------- Inva (User App) ----------------------
const invaContent = {
  privacy_policy: `
    <h1>Privacy Policy for Inva</h1>
    <p><strong>Effective Date:</strong> ${today}</p>
    <p><strong>Last Updated:</strong> ${today}</p>

    <p>This Privacy Policy explains how Inva collects, uses, and protects user information.
    By using the Inva app, you agree to this policy.</p>

    <h2>Information We Collect</h2>
    <ul>
      <li>Name, email, phone number, profile details</li>
      <li>Likes, comments, shares, and chats with businesses</li>
      <li>Device details, app activity, and location (if enabled)</li>
    </ul>

    <h2>How We Use Your Information</h2>
    <ul>
      <li>To help users browse business catalogues</li>
      <li>To enable likes, comments, sharing, and chats</li>
      <li>To provide updates, notifications, and secure services</li>
    </ul>

    <h2>Data Sharing</h2>
    <p>We do not sell personal data. We only share data with service providers or if required by law.</p>

    <h2>Contact Us</h2>
    <p>Email: info@inva.com</p>
  `,

  terms_conditions: `
    <h1>Terms & Conditions for Inva</h1>
    <p><strong>Effective Date:</strong> ${today}</p>
    <p><strong>Last Updated:</strong> ${today}</p>

    <h2>Use of Inva</h2>
    <ul>
      <li>Users may browse, like, comment, share, and chat with businesses</li>
      <li>You must provide accurate account details</li>
      <li>Do not use the app for illegal or harmful activity</li>
    </ul>

    <h2>Liability</h2>
    <p>We are not responsible for damages caused by misuse of the app.</p>

    <h2>Contact Us</h2>
    <p>Email: info@inva.com</p>
  `
};

// ---------------------- Inva Business (Business App) ----------------------
const invaBusinessContent = {
  privacy_policy: `
    <h1>Privacy Policy for Inva Business</h1>
    <p><strong>Effective Date:</strong> ${today}</p>
    <p><strong>Last Updated:</strong> ${today}</p>

    <p>This Privacy Policy explains how Inva Business collects, uses, and protects business user information.
    By using the Inva Business app, you agree to this policy.</p>

    <h2>Information We Collect</h2>
    <ul>
      <li>Business name, address, phone number, email</li>
      <li>Catalogues, product details, and pricing information</li>
      <li>Messages and interactions with Inva users</li>
      <li>Device and location data (if enabled)</li>
    </ul>

    <h2>How We Use Your Information</h2>
    <ul>
      <li>To allow you to upload and manage product catalogues</li>
      <li>To help users discover your business</li>
      <li>To enable chat, comments, and interactions with users</li>
      <li>To ensure security, compliance, and fraud prevention</li>
    </ul>

    <h2>Data Sharing</h2>
    <p>We do not sell business data. Information is shared only with users (when you publish it), 
    trusted service providers, or as required by law.</p>

    <h2>Contact Us</h2>
    <p>Email: info@inva.com</p>
  `,

  terms_conditions: `
    <h1>Terms & Conditions for Inva Business</h1>
    <p><strong>Effective Date:</strong> ${today}</p>
    <p><strong>Last Updated:</strong> ${today}</p>

    <h2>Use of Inva Business</h2>
    <ul>
      <li>You must provide accurate business details</li>
      <li>You are responsible for catalogues, prices, and business information you share</li>
      <li>Comply with local laws regarding sales and taxes</li>
      <li>Do not post illegal, harmful, or misleading content</li>
    </ul>

    <h2>Account Suspension</h2>
    <p>We may suspend or terminate accounts that violate these terms.</p>

    <h2>Liability</h2>
    <p>We are not responsible for losses or damages caused by incorrect catalogues, pricing, or misuse.</p>

    <h2>Contact Us</h2>
    <p>Email: info@inva.com</p>
  `
};

// ---------------------- Routes ----------------------

// Inva routes
router.get("/inva/:type", (req, res) => {
  const { type } = req.params;
  if (!invaContent[type]) {
    return res.status(404).send("<h1>404 - Page Not Found</h1>");
  }
  res.setHeader("Content-Type", "text/html");
  res.send(invaContent[type]);
});

// Inva Business routes
router.get("/inva-business/:type", (req, res) => {
  const { type } = req.params;
  if (!invaBusinessContent[type]) {
    return res.status(404).send("<h1>404 - Page Not Found</h1>");
  }
  res.setHeader("Content-Type", "text/html");
  res.send(invaBusinessContent[type]);
});

module.exports = router;
