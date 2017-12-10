let TwitterBot = require('twit');
let WKana = require('../wanakana.min.js');

var KatakanaBot = function(){
    "use strict";

    // ======+=+= PROPERTIES =+=+=======

    this.name = "DailyKatakana";
    this._katakana = {
        table: {
            a: ['ア','カ','サ','タ','ナ','ハ','マ','ヤ','ラ','ワ'],
            i: ["イ",'キ','シ','チ','ニ','ヒ','ミ','リ'],
            u: ["ウ",'ク','ス','ツ','ヌ','フ','ム','ユ','ル'],
            e: ["エ",'ケ','セ','テ','ネ','ヘ','メ','レ'],
            o: ["オ",'コ','ソ','ト','ノ','ホ','モ','ヨ','ロ','ヲ'],
            n: ['ン']
        }
    };
    this.completed = [];
    this._bot = null;
    this._cfg = null;
    this._lastTweetTimestamp = 0;
    this._nextTweetTimestamp = 0;
}

KatakanaBot.prototype.log = function(str){
    "use strict";
    let output = "[KatakanaBot] " + str;
    console.log(output);
    gl.sessionLog += (((new Date()).getTime()).toString() + " - " + (output + '\n'));
}

KatakanaBot.prototype._getUnusedCharacters = function(){
    "use strict";
    let self = this;
    let uncompleted = [];

    for(var vowel in self._katakana.table){
        for(var char in self._katakana.table[vowel]){
            var pos = self.completed.find(function(e){
                return e==self._katakana.table[vowel][char]
            });
            if(pos){
                // we found it in completed, so dont' add to the table
                continue;
            } else {
                uncompleted.push(self._katakana.table[vowel][char]);
            }
        }
    }
    return uncompleted;
}

KatakanaBot.prototype._getRandomCharacter = function(){
    "use strict";
    let self = this;

    let uncompleted = this._getUnusedCharacters();
    let selectedChar = uncompleted[Math.floor(Math.random() * uncompleted.length)];

    this.completed.push(selectedChar);

    return selectedChar;
}

KatakanaBot.prototype._constructTweet = function(char){
    "use strict";
    let result = char;
    result += " - ";
    result += WKana.toRomaji(char);

    return result;
}

KatakanaBot.prototype.initialize = function(){
    "use strict";
    this.log("Initializing...");
    this._bot = new TwitterBot(gl.completedSaveDataJson[this.name]['cfg']);
    this._cfg = gl.completedSaveDataJson[this.name]['cfg'];
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

KatakanaBot.prototype.tweet = function(){
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
}

KatakanaBot.prototype.update = function(){
    "use strict";
    this.log("Updating...");
    let currTime = (new Date()).getTime();
    if(currTime >= this._nextTweetTimestamp){
        this.tweet();
    }
}

module.exports = KatakanaBot;