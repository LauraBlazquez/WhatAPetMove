// Modules: npm install pg
const { Client } = require("pg");
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

module.exports = class databaseHandler {
    constructor() {
        this.sessionTokens = [];

        // PGSQL setup
        this.client = new Client({
            user: "ddmacujb",
            password: "xo6UE4ti6QBUhHXQmUdNp5imIrMZOtKj",
            host: "fanny.db.elephantsql.com",
            database: "ddmacujb",
        });
        // Connection
        (async function (client) {
            await client.connect();
        })(this.client);
    }
    // Token generation
    async generateRandomString() {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `${result.slice(0, 4)}-${result.slice(4, 8)}-${result.slice(8, 12)}-${result.slice(12, 16)}`;
    }

    // Login/Logout Function
    async webLogin(name, pass) {
        const res = await this.client.query(
            "SELECT password FROM USERS WHERE name=$1",
            [name],
        );
        if (res.rowCount > 0) {
            if (bcrypt.compareSync(pass, res.rows[0].password)) {
                return true;
            }
        }
        return false;
    }
    async gameLogin(name, pass) {
        const res = await this.client.query(
            "SELECT * FROM USERS WHERE name=$1",
            [name],
        );
        console.log(res.rows);
        if (!bcrypt.compareSync(pass, res.rows[0].password)) {
            return { success: false, message: "Password incorrect" };
        }
        if (res.rowCount <= 0) {
            return { success: false, message: "User not found" };
        } else {
            var result = await this.chargeGame(res.rows[0].game_id);
            return { success: true, message: "Game charged", body: result };
        }
    }
    async logout(sessionToken) {
        const tokenIndex = this.sessionTokens.findIndex(
            (tokenObj) => tokenObj.token === sessionToken,
        );
        if (tokenIndex !== -1) {
            this.sessionTokens.splice(tokenIndex, 1);
            return { success: true, message: "Logged out successfully" };
        } else {
            return { success: false, message: "Session token not found" };
        }
    }

    // Game Sign Up Function
    async signup(name, pass) {
        var gameId = await this.newGame();
        pass = bcrypt.hashSync(pass, 10);
        await this.client.query(
            "INSERT INTO USERS (game_id, name, password) VALUES ($1, $2, $3)",
            [gameId.rows[0].game_id, name, pass],
        );
        const res = await this.client.query(
            "SELECT * FROM USERS WHERE name=$1 AND password=$2",
            [name, pass],
        );
        if (res.rowCount > 0) {
            var result = await this.chargeGame(res.rows[0].game_id);
            return {
                success: true,
                message: "Sign up successfully",
                body: result,
            };
        } else {
            return { success: false, message: "Error:" };
        }
    }
    // Game Charge User Game
    async chargeGame(gameId) {
        const res = await this.client.query(
            "SELECT * FROM GAME WHERE game_id = $1",
            [gameId],
        );
        const result = new GameData(
            res.rows[0].game_id,
            res.rows[0].currentlevel,
            res.rows[0].discoveredanimals,
            res.rows[0].coins,
            res.rows[0].fruits,
            res.rows[0].maxcoins,
        );
        return result;
    }
    // Game Create a new Game
    async newGame() {
        const res = await this.client.query(
            "INSERT INTO GAME (currentlevel,discoveredanimals,coins,fruits,maxcoins) VALUES (1,1,0,0,0) RETURNING game_id",
        );
        return res;
    }
    // Game Save the progress
    async saveGame(game) {
        const res = await this.client.query(
            "UPDATE GAME SET currentlevel=$1,discoveredanimals=$2,coins=$3,fruits=$4,maxcoins=$5 WHERE game_id=$6 RETURNING *",
            [
                game.currentlevel,
                game.discoveredanimals,
                game.coins,
                game.fruits,
                game.maxcoins,
                game.game_id,
            ],
        );
        if (res.rowCount > 0) {
            return { success: true, message: "Game saved successfully" };
        } else {
            return { success: false, message: "Error:" };
        }
    }

    // Ranking Function
    async ranking() {
        const res = await this.client.query(
            "SELECT u.name, g.maxcoins FROM USERS u JOIN GAME g ON u.game_id = g.game_id ORDER BY g.maxcoins DESC",
        );
        return res.rows;
    }
};
