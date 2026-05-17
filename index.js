const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

app.post("/log", (req, res) => {
  const data = {
    time: new Date().toISOString(),
    body: req.body,
  };

  fs.appendFileSync("logs.json", JSON.stringify(data) + "\n");

  res.send({ status: "ok" });
});

app.get("/health", (req, res) => {
  res.send("backend running");
});

app.listen(3001, () => {
  console.log("Backend running on port 3001");
});
