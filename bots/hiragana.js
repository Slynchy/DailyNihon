let TwitterBot = require('twit');
let WKana = require('../wanakana.min.js');

let HiraganaBot = function(){
    "use strict";

    // ======+=+= PROPERTIES =+=+=======

    this.name = "DailyHiragana";
    this._hiragana = {
        table: {
            a: ['あ','は','ば','ぱ','ら','や','わ','な','ま','さ','た','か','だ','ざ'],
            i: ['い','き','し','ち','に','ひ','み','り'],
            u: ['う','く','す','つ','ぬ','ふ','む','ゆ','る'],
            e: ['え','け','せ','て','ね','へ','め','れ'],
            o: ['お','こ','そ','と','の','ほ','も','よ','ろ','を'],
            n: ['ん']
        }
    };
    this.completed = [];
    this._bot = null;
    this._cfg = null;
    this._lastTweetTimestamp = 0;
    this._nextTweetTimestamp = 0;
};

HiraganaBot.prototype.log = function(str){
    "use strict";
    let output = "[HiraganaBot] " + str;
    console.log(output);
    gl.sessionLog += (((new Date()).getTime()).toString() + " - " + (output + '\n'));
};

HiraganaBot.prototype._getUnusedCharacters = function(){
    "use strict";
    let self = this;
    let uncompleted = [];

    for(let vowel in self._hiragana.table){
        if(self._hiragana.table.hasOwnProperty(vowel)) {
            for (let char in self._hiragana.table[vowel]) {
                if(self._hiragana.table[vowel].hasOwnProperty(char)) {
                    let pos = self.completed.find(function (e) {
                        return e == self._hiragana.table[vowel][char]
                    });
                    if (pos) {
                        // we found it in completed, so dont' add to the table
                    } else {
                        uncompleted.push(self._hiragana.table[vowel][char]);
                    }
                }
            }
        }
    }
    return uncompleted;
};

HiraganaBot.prototype._getRandomCharacter = function(){
    "use strict";
    let uncompleted = this._getUnusedCharacters();
    let selectedChar = uncompleted[Math.floor(Math.random() * uncompleted.length)];

    this.completed.push(selectedChar);

    return selectedChar;
};

HiraganaBot.prototype._constructTweet = function(char){
    "use strict";
    let result = char;
    result += " - ";
    result += WKana.toRomaji(char);

    return result;
};

HiraganaBot.prototype.initialize = function(){
    "use strict";
    this.log("Initializing...");
    if(!gl.debugMode) {
        this._bot = new TwitterBot(gl.completedSaveDataJson[this.name]['cfg']);
        this._cfg = gl.completedSaveDataJson[this.name]['cfg'];
    }
    if(gl.completedSaveDataJson){
        this.completed = gl.completedSaveDataJson[this.name]['completed'];
        this._lastTweetTimestamp = gl.completedSaveDataJson[this.name]['lastTweetStamp'];
        this._nextTweetTimestamp = gl.completedSaveDataJson[this.name]['nextTweetSchedule'];
    } else {
        this._lastTweetTimestamp = (new Date()).getTime();
        this._nextTweetTimestamp = (this._lastTweetTimestamp + (1000 * 60 * 60 * 24));
    }

    setInterval(this.update, 1000 * 60 * 10);
    this.log("Initialized! Tweeting in: " + (this._lastTweetTimestamp + (1000 * 60 * 60 * 24)) + "ms or " + this._nextTweetTimestamp.toString() + "ms");
};

HiraganaBot.prototype.tweet = function(){
    "use strict";
    let self = this;
    let char = this._getRandomCharacter();

    this.log("Tweeting \"" + char + "\" ("+ WKana.toRomaji(char) +")");

    if(gl.debugMode === true) {
        this.log("Success!");
        self._lastTweetTimestamp = (new Date()).getTime();
        self._nextTweetTimestamp = (self._lastTweetTimestamp + (1000 * 60 * 60 * 24));
        this.log("Next tweet scheduled for " + (self._lastTweetTimestamp + (1000 * 60 * 60 * 24)) + " in " + (1000 * 60 * 60 * 24) + "ms... ");
        return;
    }

    self._bot.post(
        'statuses/update',
        self._constructTweet(char),
        function(err, data, response) {
            if(err)
                self.log("Success!");
            else
                self.log("Failure!");
            self._lastTweetTimestamp = (new Date()).getTime();
            self._nextTweetTimestamp = (self._lastTweetTimestamp + (1000 * 60 * 60 * 24));
            self.log("Next tweet scheduled for " + (self._lastTweetTimestamp + (1000 * 60 * 60 * 24)) + " in " + (1000 * 60 * 60 * 24) + "ms... ");
        }
    );
};

HiraganaBot.prototype.update = function(){
    "use strict";
    this.log("Updating...");
    let currTime = (new Date()).getTime();
    if(currTime >= this._nextTweetTimestamp){
        this.tweet();
    }
};

module.exports = HiraganaBot;