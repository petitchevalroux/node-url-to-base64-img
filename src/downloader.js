"use strict";
const got = require("got");

class Downloader {
    get(url) {
        return got(url);
    }
}
module.exports = Downloader;
