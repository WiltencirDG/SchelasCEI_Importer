const port = process.env.PORT || 5000;
const express = require("express");
const cors = require("cors");
const chrome = require("./chrome.js");

async function robot() {
  const app = express();

  app.use(cors());

  await createServer(app);
  await apiCalls(app);

  async function createServer(app) {
    return new Promise((resolve, reject) => {
      const server = app.listen(port, (error) => {
        if (error) {
          reject(error);
        }
        console.log(
          `> Server now running on: ${server.address().address}:${port}`
        );
        resolve(server);
      });
    });
  }

  async function apiCalls(app) {
    app.get("/index.js", async (req, res) => {
      if (
        !req.headers.authorization ||
        req.headers.authorization.indexOf("Basic ") === -1
      ) {
        return res
          .status(401)
          .json({ message: "Missing Authorization Header" });
      }

      const base64Credentials = req.headers.authorization.split(" ")[1];
      const credentialsApi = Buffer.from(base64Credentials, "base64").toString(
        "ascii"
      );

      const credentials = {
        cpf: credentialsApi.split(":")[0],
        pass: credentialsApi.split(":")[1],
      };
      let content;
      let broker;
      try {
        broker = req.query.broker != null ? req.query.broker : null;
        content = await chrome(credentials, broker);
        res.set({ "content-type": "application/json; charset=utf-8" });
        res.statusCode = 200;
        res.end(JSON.stringify(content));
      } catch (error) {
        console.log(`Error: ${error}`);
        return res.status(503).json({ message: "Service unavailable" });
      }
    });
  }
}

module.exports = robot;
