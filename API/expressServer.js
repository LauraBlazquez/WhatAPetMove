// Modules: npm install express bcrypt
const express = require("express");
const path = require("path");
const databaseHandler = require("./database.js");
const bodyparse = require("body-parser");
const bcrypt = require("bcrypt");

class GameData {
    constructor(
        game_id,
        currentlevel,
        discoveredanimals,
        coins,
        fruits,
        maxcoins,
    ) {
        this.game_id = game_id;
        this.currentlevel = currentlevel;
        this.discoveredanimals = discoveredanimals;
        this.coins = coins;
        this.fruits = fruits;
        this.maxcoins = maxcoins;
    }
}

module.exports = class expressServer {
    constructor(host = "0.0.0.0", port = 80) {
        this.host = host;
        this.port = port;
        this.bbdd = new databaseHandler();

        // Express config
        const app = express();
        app.use(express.static(path.join(__dirname, "Web")));
        app.use(bodyparse.json());
        app.use(bodyparse.urlencoded({ extended: true }));

        //Cargar WEB
        app.get("/", (req, res) => {
            res.sendFile("index.html", { root: "Web" });
        });
        app.get("/contact", (req, res) => {
            res.sendFile("contact.html", { root: "Web" });
        });
        app.get("/gallery", (req, res) => {
            res.sendFile("gallery.html", { root: "Web" });
        });
        app.get("/login", (req, res) => {
            res.sendFile("logIn.html", { root: "Web" });
        });
        app.get("/ranking", (req, res) => {
            res.sendFile("ranking.html", { root: "Web" });
        });
        app.get("/wiki", (req, res) => {
            res.sendFile("wiki.html", { root: "Web" });
        });

        //Connexiones API
        app.post("/api/weblogin", async (req, res) => {
            var data = req.body;
            console.log(data);
            var queryRes = await this.bbdd.webLogin(
                data.username,
                data.password,
            );
            if (queryRes == true) {
                var newToken = await this.bbdd.generateRandomString();
                this.bbdd.sessionTokens.push({
                    token: newToken,
                    user: req.query["name"],
                });
                return res.send({
                    sessionToken: newToken,
                    username: data.username,
                });
            }
            return res.send({ error: "Invalid username or password!" });
        });
        app.post("/api/gamelogin", async (req, res) => {
            var data = req.body;
            var queryRes = await this.bbdd.gameLogin(
                data.username,
                data.password,
            );
            console.log(queryRes.body);
            res.send(queryRes);
        });
        app.post("/api/logout", async (req, res) => {
            const { sessionToken } = req.body;
            const result = await this.bbdd.logout(sessionToken);
            res.send(result);
        });
        app.get("/api/ranking", async (req, res) => {
            var rows = await this.bbdd.ranking();
            res.send(rows);
        });
        app.post("/api/signup", async (req, res) => {
            var data = req.body;
            var queryRes = await this.bbdd.signup(data.username, data.password);
            console.log(queryRes.body);
            res.send(queryRes);
        });
        app.post("/api/savegame", async (req, res) => {
            var data = req.body;
            console.log(data);
            var sendedGame = new GameData(
                data.game_id,
                data.currentlevel,
                data.discoveredanimals,
                data.coins,
                data.fruits,
                data.maxcoins,
            );
            console.log(sendedGame);
            var queryRes = await this.bbdd.saveGame(sendedGame);
            res.send(queryRes);
        });

        app.listen(80, "0.0.0.0", () => {
            console.log("Webserver started on http://localhost:80");
        });
    }
};
