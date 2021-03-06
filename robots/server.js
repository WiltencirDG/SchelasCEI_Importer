const port = process.env.PORT || 5000;
const state = require("./state.js");
const express = require("express");
const cors = require("cors");
const chrome = require("./chrome.js");
const scheduler = require("./scheduler.js");

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

      console.log(req.headers.authorization)
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
        if (req.query.cache == true || req.query.cache == "true") {
          content = state.load_api(base64Credentials);
          console.log("> Loading from cache...");
        } else {
          throw new Error("server file");
        }
      } catch (error) {
        try {
          content = await chrome(credentials, broker);
          state.save_api(content, base64Credentials);
          await scheduler(base64Credentials);
        } catch (error) {
          console.log(`Error: ${error}`);
          return res.status(401).json({ message: "Service unavailable" });
        }
      }

      res.set({ "content-type": "application/json; charset=utf-8" });
      res.statusCode = 200;
      res.end(JSON.stringify(content));
    });
  }
}

module.exports = robot;
