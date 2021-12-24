require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
    res.json({ greeting: "hello API" });
});

app.listen(3000, function () {
    console.log(`Listening on port ${port}`);
});

//db
const mongoose = require("mongoose");
mongoose.connect(
    process.env.DB,
    (err) => {
        if (err) return console.error("failed to connect to db: ", err);
    }
);
const LinkShortener = new mongoose.Schema({
    original_url: String,
});
const shortenURL = mongoose.model("shortenURL", LinkShortener);

//get link from html button
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const dns = require("dns");

//push data to db
app.post("/api/shorturl", (req, res) => {
    //test exclude invalid link
    if (!req.body.url.match("http(s*)://.*")) {
        return res.json({ error: "invalid url" });
    }

    let url = new URL(req.body.url);
    dns.lookup(url.hostname, (err, address, family) => {
        if (err) return res.json({ error: "invalid url" });
        let document = new shortenURL({ original_url: url });
        document.save();
        res.json({ original_url: url, short_url: document["_id"] });
        console.log({ original_url: url.href, short_url: document["_id"] });
    });
});

//open shortened link
app.get("/api/shorturl/:shortURL", (req, res) => {
    //find link
    shortenURL.findOne({ _id: req.params.shortURL }, (err, link) => {
        if (err) return res.json({ error: "invalid url" });
        console.log("redirect to ", link.original_url);
        res.redirect(link.original_url);
    });
});
