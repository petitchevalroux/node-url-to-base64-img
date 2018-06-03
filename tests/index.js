"use strict";
const path = require("path"),
    Converter = require(path.join(__dirname, "..")),
    assert = require("assert"),
    cheerio = require("cheerio"),
    sinon = require("sinon"),
    nock = require("nock");

describe("ImgUrlToBase64Converter", () => {
    const sandbox = sinon.sandbox.create();
    afterEach(() => {
        sandbox.restore();
    });
    const converter = new Converter();

    function getParsedContent(html, url) {
        return converter
            .replace(html, url)
            .then(html => {
                return cheerio.load(html);
            });
    }
    it("replace absolute image url with base64", () => {
        nock("http://example.com")
            .get("/img/1.jpg")
            .reply(200, "jpg", {
                "Content-Type": "image/jpeg"
            })
            .get("/img/2.png")
            .reply(200, "png", {
                "Content-Type": "image/png"
            });
        return getParsedContent(
            "<h1>Title 1</h1><div><img src='http://example.com/img/1.jpg'></div>" +
                "<h1>Title 2</h1><div><img src='http://example.com/img/2.png'></div>"
        )
            .then($ => {
                const imageSources = $("img")
                    .map((index, img) => {
                        return $(img)
                            .attr("src");
                    })
                    .get();
                assert.equal(imageSources[0],
                    "data:image/jpeg;base64,anBn");
                assert.equal(imageSources[1],
                    "data:image/png;base64,cG5n");
                return $;
            });
    });

    it("replace relative image url with base64", () => {
        nock("http://example.com")
            .get("/img/3.jpg")
            .reply(200, "foo", {
                "Content-Type": "image/jpeg"
            });
        return getParsedContent(
            "<h1>Title 1</h1><div><img src='/img/3.jpg'></div>",
            "http://example.com"
        )
            .then($ => {
                const imageSources = $("img")
                    .map((index, img) => {
                        return $(img)
                            .attr("src");
                    })
                    .get();
                assert.equal(imageSources[0],
                    "data:image/jpeg;base64,Zm9v");

                return $;
            });
    });

    it("doesnt add body if body is not in original fragment", () => {
        return converter
            .replace("<h1>Title 1</h1>")
            .then(html => {
                assert.equal(html.indexOf("<body>"), -1);
                return html;
            });

    });

    it("leave body if body is in original fragment", () => {
        return converter
            .replace(
                "<html><body><h1>Title 1</h1></body></html>")
            .then(html => {
                assert(html.indexOf("<body>") > -1);
                return html;
            });
    });

});
