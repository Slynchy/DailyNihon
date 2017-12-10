let KatakanaBot = require('./bots/katakana.js');
let HiraganaBot = require('./bots/hiragana.js');
let KanjiBot = require('./bots/kanji.js');
let kanjidic = require('kanjidic');
let fs = require('fs');

global.gl = {
    CLOSING: false,
    debugMode: true,
    mainDict: null,
    kanjiDict: null,
    DOMParser: null,
    bots: {},
    completedSaveDataJson: null
};

gl.bots.katakana = null;
gl.bots.n5kanji = null;
function init(){
    //let twitterBot = new KatakanaBot();
    gl.completedSaveDataJson = JSON.parse(fs.readFileSync("botSettings.json", "utf8"));

    gl.bots.katakana = new KatakanaBot();
    gl.bots.katakana.initialize();
    gl.bots.katakana.update();

    gl.bots.hiragana = new HiraganaBot();
    gl.bots.hiragana.initialize();
    gl.bots.hiragana.update();

    gl.bots.n5kanji = new KanjiBot(4);
    gl.bots.n5kanji.initialize(gl.kanjiDict);
    gl.bots.n5kanji.update();

    gl.bots.n4kanji = new KanjiBot(3);
    gl.bots.n4kanji.initialize(gl.kanjiDict);
    gl.bots.n4kanji.update();

    gl.bots.n3kanji = new KanjiBot(2);
    gl.bots.n3kanji.initialize(gl.kanjiDict);
    gl.bots.n3kanji.update();

    gl.bots.n2kanji = new KanjiBot(1);
    gl.bots.n2kanji.initialize(gl.kanjiDict);
    gl.bots.n2kanji.update();
}

function loadDictionaries(){
    let dictExists = true;//fs.existsSync("dict.json");
    let kanjiExists = (typeof(kanjidic) !== "undefined");

    if (dictExists && kanjiExists) {
        // fs.readFile("dict.json", function(err, data){
        //     if(err) console.log(err);
        //
        //     console.log("Loaded dict.json, parsing...");
        //     gl.mainDict = JSON.parse(data);
        //     console.log("Parsed!");

            loadKanjiDict();

            init();
        //});
    } else {
        //loadMainDict(loadKanjiDict);
        // never get here
        init();
    }
}

function loadMainDict(callback){
    "use strict";
    console.log("Loading dictionary XML file...");
    fs.readFile('JMdict_e', 'utf8', function(err, data){
        if(err) console.log(err);
        console.log("Converting dictionary to JSON... (this takes a while!)");

        //let doc = xml2js.xml2json(data, {compact: true, spaces: 4});
        fs.writeFileSync("dict.json", doc, "utf8");

        console.log("Successfully initialised dictionary 1!");
        if(callback)
            callback();
    });
}

function loadKanjiDict(callback){
    "use strict";
    console.log("Loading kanjidic json file...");
    gl.kanjiDict = kanjidic.toJSON();
    if(callback)
        callback();
    console.log("Loaded!");
}

loadDictionaries();

function exitHandler(){
    if(gl.CLOSING) return;
    gl.CLOSING = true;

    console.log("\n\nSaving completed's & schedules...");
    let completedOutput = {};
    for(let k in gl.bots){
        if(gl.bots.hasOwnProperty(k)){
            let bot = gl.bots[k];
            completedOutput[bot.name] = {};
            completedOutput[bot.name].completed = bot.completed;
            completedOutput[bot.name].lastTweetStamp = bot._lastTweetTimestamp;
            completedOutput[bot.name].nextTweetSchedule = (bot._nextTweetTimestamp);
            completedOutput[bot.name].cfg = (bot._cfg);
        }
    }
    fs.writeFileSync("botSettings.json", JSON.stringify(completedOutput), "utf8");

    console.log('Exiting...');
    process.exit();
}

process.on('uncaughtException', function(e) {
    console.log('\nUncaught Exception!!\n');
    console.log(e.stack);
    process.exit();
});
process.on('exit', exitHandler.bind(null, null));
process.on('SIGINT', exitHandler.bind(null, null));