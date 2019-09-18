const http = require("http");
const express = require("express");
const cors = require("cors");
const parser = require("body-parser");
const app = express();
const server = http.createServer(app);
const socketIo = require("socket.io");
const io = socketIo(server);

const config = {
    PORT: process.env.PORT || 4000,
    DB_ADDRESS: process.env.MONGODB_URI || "mongodb://localhost:27017/messenger",
    JWT_SECRET_KEY: "1q7PmGH04phLl5k6c2AisEda2y286UtKPxwrCz3T1M",
    JWT_EXPIRE_TIME: 60 * 60 * 24,
    app,
    server,
    io,
};

module.exports = config;
