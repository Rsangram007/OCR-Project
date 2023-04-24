const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const app = express();
// Set up file storage using Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
// Define the API endpoint
app.post("/process-id", upload.single("file"), async (req, res) => {
  try {
   Tesseract.recognize("uploads/" + req.file.filename, "eng").then(({ data: { text } }) => {
    console.log(text);
    // Extracting the PAN number using a regular expression
    const panRegex = /([A-Z]{5}[0-9]{4}[A-Z])/g;
    const panNumber = text.match(panRegex)[0];
    // Extracting the name, father's name and date of birth using regular expressions
    const nameRegex = /Name\s+([\w\s]+)/gi;
    const dobRegex = /DOB\s+([\d]{2}\/[\d]{2}\/[\d]{4})/gi;
    const fatherNameRegex = /(?<=Father :\s)[A-Z\s]+(?=\s\|)/;

    const nameMatch = nameRegex.test(text);
    const dobMatch = dobRegex.exec(text);
    const fatherNameMatch = fatherNameRegex.exec(text);

    const name = nameMatch ? nameMatch[1].trim() : "";
    const dob = dobMatch ? dobMatch[1].trim() : "";
    const fatherName = fatherNameMatch ? fatherNameMatch[1].trim() : "";

    // Creating the response object
    const responseObject = {
      idType: "panCard",
      idNumber: panNumber,
      info: {
        name: name,
        fatherName: fatherName,
        dob: dob,
      },
    };
    
    // Sending the response object
    res.status(200).json(responseObject);
  });
  } catch (error) {
    return res.send(error);
  }
});
// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
