
let CANVAS = require('canvas');
let fs = require('fs');
let WKana = require('./wanakana.min.js');

let B64Renderer = function(bgPath){
    let self = this;

    if(typeof(bgPath) === "undefined"){
        throw "Failed!";
    }

    this._font = new CANVAS.Font('test', 'test.ttf');
    this._canvas = new CANVAS(440,220);
    this._ctx = this._canvas.getContext('2d');
    this._ctx.addFont(this._font);
    this._ctx.font = '42px test';

    this.bgImg = new CANVAS.Image();
    this.bgImg.src = fs.readFileSync(bgPath);

    this.GetKanjiB64 = function(kanji){
        "use strict";
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._ctx.drawImage(this.bgImg, 0, 0, this.bgImg.width, this.bgImg.height);

        let size = this._ctx.measureText( kanji["kanji"] );
        this._ctx.textAlign = "center";
        this._ctx.fillText( kanji["kanji"] , 440 / 2,  220 / 2);

        if(kanji["kunyomi"] && kanji["kunyomi"].length > 0) {
            this._ctx.font = '30px Arial';
            this._ctx.fillText(WKana.toRomaji(kanji["kunyomi"][0]), 440 / 2, 220 / 2 + size.height);
        }
        console.log("\n\n\n"+ kanji["kanji"]);
        return this._canvas.toDataURL();
    }
};

module.exports = B64Renderer;