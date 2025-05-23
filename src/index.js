const express = require("express");
const { generateCertificate } = require("./generateCertificate");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
app.post("/generate-certificate", async (req, res) => {
  try {
    const pdfBuffer = await generateCertificate(req.body);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=certificate.pdf"); // or "attachment;" to download
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Certificate generation error:", err);
    res.status(500).json({ error: "Failed to generate certificate" });
  }
});

app.listen(3000, () => console.log("Certificate service running on port 3000"));
