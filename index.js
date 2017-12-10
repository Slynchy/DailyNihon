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
    bots: {
        hiragana: null,
        katakana: null,
        n5kanji: null,
        n4kanji: null,
        n3kanji: null,
        n2kanji: null
    },
    completedSaveDataJson: null
};

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
    console.log("Loading kanjidic json file...");
    gl.kanjiDict = kanjidic.toJSON();
    console.log("Loaded!");
    init();
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
            completedOutput[bot.name].completed = [];
            for(let i = 0; i < bot.completed.length; i++){
                completedOutput[bot.name].completed.push(bot.completed[i]);
            }
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