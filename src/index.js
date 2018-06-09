"use strict";
const cheerio = require("cheerio"),
    Promise = require("bluebird"),
    Url = require("url"),
    imageDataURI = require("image-data-uri");
class ImgUrlToBase64Converter {
    constructor(options) {
        if (options && options.htmlParserOptions) {
            this.htmlParserOptions = options.htmlParserOptions;
        }
        // default decodeEntities = false in order to avoid non ascii chars to entities conversion
        this.htmlParserOptions = options && options.htmlParserOptions ?
            options.htmlParserOptions : {
                decodeEntities: false
            };
    }
    replace(html, url) {
        try {
            const $ = cheerio.load(html, this.htmlParserOptions),
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
                            imageDataURI.encodeFromURL(downloadUrl)
                                .then(dataUri => {
                                    $img.attr("src", dataUri);
                                    return dataUri;
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
