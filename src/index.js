"use strict";
const cheerio = require("cheerio"),
    Promise = require("bluebird"),
    Url = require("url"),
    path = require("path"),
    Downloader = require(path.join(__dirname, "downloader"));
class ImgUrlToBase64Converter {
    constructor() {
        this.downloader = new Downloader();
    }
    replace(html, url) {
        const self = this;
        try {
            const $ = cheerio.load(html),
                promises = [],
                hasBody = html.indexOf("<body>") > -1;
            $("img")
                .each((index, img) => {
                    const $img = $(img),
                        src = $img.attr("src");
                    if (src.substring(0, 5) !== "data:") {
                        const downloadUrl = url ? Url.resolve(url, src) :
                            src;
                        promises.push(
                            self
                                .downloader
                                .get(downloadUrl)
                                .then(response => {
                                    $img.attr("src", "data:" +
                                    response.headers[
                                        "content-type"] +
                                    ";base64," + Buffer.from(
                                            response.body)
                                            .toString("base64"));
                                    return response;
                                })
                        );
                    }
                });
            return Promise
                .all(promises)
                .then(() => {
                    return !hasBody ? $("body")
                        .html() : $.html();
                });
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

module.exports = ImgUrlToBase64Converter;
