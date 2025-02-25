const express = require("express");
const cors = require("cors");
const jsforce = require("jsforce");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const SF_LOGIN_URL = "https://login.salesforce.com"; 
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const SF_USERNAME = process.env.SF_USERNAME;
const SF_PASSWORD = process.env.SF_PASSWORD;

let conn = new jsforce.Connection({ loginUrl: SF_LOGIN_URL });

// Salesforce Authentication
const loginToSalesforce = async () => {
  try {
    await conn.login(SF_USERNAME, SF_PASSWORD);
    console.log("✅ Connected to Salesforce");
  } catch (error) {
    console.error("❌ Salesforce Login Failed:", error);
  }
};

// Call login function on server startup
loginToSalesforce();

// Function to fetch opportunities from Salesforce
const fetchOpportunities = async (query) => {
  try {
    const result = await conn.query(query);
    return result.records;
  } catch (error) {
    console.error("❌ Salesforce Query Error:", error);
    return [];
  }
};

// API Endpoint to return JSON response
app.get("/opportunity-response", async (req, res) => {
  const userQuery = req.query.query;

  let sfQuery = "";
  let responseData = [];

  if (userQuery === "Get all my opportunities") {
    sfQuery = "SELECT Name, StageName, Amount FROM Opportunity WHERE IsClosed = false";
  } else if (userQuery === "Give all opportunities closing this month") {
    sfQuery = "SELECT Name, StageName, Amount, CloseDate FROM Opportunity WHERE CloseDate = THIS_MONTH";
  } else if (userQuery === "What is the biggest opportunity I am working on?") {
    sfQuery = "SELECT Name, Amount, StageName FROM Opportunity ORDER BY Amount DESC LIMIT 1";
  }

  if (sfQuery) {
    responseData = await fetchOpportunities(sfQuery);
  }

  res.json({ data: responseData });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
