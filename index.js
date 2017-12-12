let KatakanaBot = require('./bots/katakana.js');
let HiraganaBot = require('./bots/hiragana.js');
let KanjiBot = require('./bots/kanji.js');
let kanjidic = require('kanjidic');
let fs = require('fs');

global.gl = {
    CLOSING: false,
    debugMode: false,
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
    completedSaveDataJson: null,
    sessionLog: "\n"
};

function log(str){
    let output = "[DailyNihon] " + str;
    console.log(output);
    gl.sessionLog += (((new Date()).getTime()).toString() + " - " + (output + '\n'));
}

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
    log("Loading kanjidic json file...");
    gl.kanjiDict = kanjidic.toJSON();
    log("Loaded!");
    init();
}

loadDictionaries();

function exitHandler(){
    if(gl.CLOSING) return;
    gl.CLOSING = true;

    log("Saving completed's & schedules...");
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

    log('Exiting...');
    fs.writeFileSync(((new Date()).getTime()).toString()+".txt", gl.sessionLog);
    process.exit();
}

process.on('uncaughtException', function(e) {
    log('\nUncaught Exception!!\n');
    log(e.stack);
    log(e);
    process.exit();
});
process.on('exit', exitHandler.bind(null, null));
process.on('SIGINT', exitHandler.bind(null, null));