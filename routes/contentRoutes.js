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

    <p>This Privacy Policy describes how Inva collects, uses, and protects personal information of users in India.
    By using the Inva app, you agree to this Privacy Policy.</p>

    <h2>Information We Collect</h2>
    <ul>
      <li>Name, email, phone number, and profile details provided during Google Sign-In or Phone OTP login</li>
      <li>User activity such as likes, comments, shares, saved items, and chats with shopkeepers</li>
      <li>Device information, IP address, crash logs, and usage data</li>
      <li>Location data (only if you grant permission)</li>
    </ul>

    <h2>How We Use Your Information</h2>
    <ul>
      <li>To allow users to browse products posted by local shopkeepers</li>
      <li>To enable likes, comments, sharing, saving items, and chatting with shopkeepers</li>
      <li>To improve app performance and user experience</li>
      <li>To maintain the security of user accounts</li>
      <li>To send important updates, alerts, or notifications</li>
      <li>To comply with Indian laws including the DPDP Act 2023 and IT Act 2000</li>
    </ul>

    <h2>Data Sharing</h2>
    <p>We do not sell your personal data. We only share information with:</p>
    <ul>
      <li>Trusted service providers such as Firebase for authentication and security</li>
      <li>Local shopkeepers (only your likes, comments, messages, and profile name visible to them)</li>
      <li>Law enforcement if legally required under Indian laws</li>
    </ul>

    <h2>Data Security</h2>
    <p>We use reasonable security measures to protect your data. However, no system is fully secure, and you use the app at your own risk.</p>

    <h2>Your Rights</h2>
    <ul>
      <li>Access your data</li>
      <li>Edit your profile</li>
      <li>Delete your account anytime</li>
      <li>Request full data deletion under the DPDP Act 2023</li>
    </ul>

    <h2>Contact Us</h2>
    <p>Email: info@inva.com</p>
  `,

  terms_conditions: `
    <h1>Terms & Conditions for Inva</h1>
    <p><strong>Effective Date:</strong> ${today}</p>
    <p><strong>Last Updated:</strong> ${today}</p>

    <p>By using Inva, you agree to these Terms & Conditions, which are applicable only within India.</p>

    <h2>Use of Inva</h2>
    <ul>
      <li>You may browse, like, comment, share, save products, and chat with shopkeepers</li>
      <li>You must provide accurate account information when logging in using Google or Phone Number OTP</li>
      <li>You agree not to upload abusive, illegal, harmful, or offensive content</li>
      <li>You must not use the app for harassment, impersonation, fraud, or any activity prohibited under Indian law</li>
      <li>You must not attempt to hack, disrupt, or interfere with the app</li>
    </ul>

    <h2>No Financial Transactions</h2>
    <p>Inva does not support purchases, payments, or financial transactions of any kind. Any offline deal between a user and shopkeeper is not our responsibility.</p>

    <h2>Content Responsibility</h2>
    <ul>
      <li>Product images and descriptions belong to respective shopkeepers</li>
      <li>Users must not copy or misuse content from the app</li>
    </ul>

    <h2>Liability</h2>
    <p>We are not responsible for damages, losses, disputes, or issues caused by misuse of the app, incorrect information uploaded by shopkeepers, or interactions between users and shopkeepers.</p>

    <h2>Termination</h2>
    <p>We may suspend or terminate accounts that violate these terms or Indian laws. Users may delete their accounts anytime.</p>

    <h2>Governing Law</h2>
    <p>These Terms are governed by the laws of India. Any disputes will be resolved in the courts of your local jurisdiction.</p>

    <h2>Contact Us</h2>
    <p>Email: info@inva.com</p>
  `,

  delete_account_content: `
    <h1>Delete Your Inva Account</h1>
    <p><strong>Effective Date:</strong> ${today}</p>
    <p><strong>Last Updated:</strong> ${today}</p>

    <h2>How to Delete Your Account</h2>
    <p>You can delete your Inva account and all associated data at any time by following these steps:</p>
    <ol>
      <li>Open the Inva app</li>
      <li>Go to <strong>Profile → Delete Account</strong></li>
      <li>Confirm the deletion request</li>
    </ol>

    <h2>Alternative Method</h2>
    <p>If you are unable to delete your account through the app, you can request deletion manually:</p>
    <ul>
      <li>Email: <a href="mailto:info@inva.com">info@inva.com</a></li>
      <li>Please include your registered mobile number or email for verification</li>
    </ul>

    <h2>Important Note</h2>
    <p>Once deleted, your account and all associated data will be permanently removed from our systems and cannot be recovered. This includes your profile, comments, likes, saved items, and chat history.</p>
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
  `,
  delete_account_content: `
    <h1>Delete Your Inva Business Account</h1>
    <p><strong>Effective Date:</strong> ${today}</p>
    <p><strong>Last Updated:</strong> ${today}</p>

    <h2>How to Delete Your Account</h2>
    <p>To delete your Inva Business account and all associated data, follow these steps:</p>
    <ol>
      <li>Open the Inva Business app.</li>
      <li>Go to <strong>Profile → Delete Account</strong>.</li>
      <li>Confirm deletion.</li>
    </ol>

    <h2>Alternative Method</h2>
    <p>If you cannot delete your account through the app, you can send a request manually:</p>
    <ul>
      <li>Email: <a href="mailto:info@inva.com">info@inva.net.in</a></li>
      <li>Include your registered email to process the account deletion.</li>
    </ul>

    <h2>Note</h2>
    <p>Once deleted, all your account data will be permanently removed and cannot be recovered.</p>
  `
};


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
