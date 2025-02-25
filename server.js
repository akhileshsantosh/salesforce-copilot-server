const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Salesforce Credentials from .env
const SF_CLIENT_ID = process.env.SALESFORCE_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET;
const SF_USERNAME = process.env.SALESFORCE_USERNAME;
const SF_PASSWORD = process.env.SALESFORCE_PASSWORD;
const SF_LOGIN_URL = process.env.SALESFORCE_LOGIN_URL;

// Function to get Salesforce Access Token
async function getSalesforceToken() {
  try {
    const response = await axios.post(`${SF_LOGIN_URL}/services/oauth2/token`, null, {
      params: {
        grant_type: "password",
        client_id: SF_CLIENT_ID,
        client_secret: SF_CLIENT_SECRET,
        username: SF_USERNAME,
        password: SF_PASSWORD
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Salesforce Authentication Error:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with Salesforce");
  }
}

// Route to fetch Salesforce Opportunities
app.get("/opportunities", async (req, res) => {
  try {
    const token = await getSalesforceToken();
    const response = await axios.get(
      "https://your-salesforce-instance.salesforce.com/services/data/v52.0/query/?q=SELECT Name,StageName,CloseDate FROM Opportunity",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(response.data.records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(5000, () => console.log("Backend running on port 5000"));
