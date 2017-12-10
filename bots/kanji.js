let TwitterBot = require('twit');
let WKana = require('../wanakana.min.js');

var KanjiBot = function(level){
    "use strict";

    // ======+=+= PROPERTIES =+=+=======

    this.name = "DailyN" + (6 - level).toString() + "Kanji";
    this.level = (6 - level);
    this._kanji = {
        table: []
    };
    this.completed = [];
    this._bot = null;
    this._cfg = null;
    this._lastTweetTimestamp = 0;
    this._nextTweetTimestamp = 0;
}

KanjiBot.prototype.log = function(str){
    "use strict";
    console.log("[KanjiBot-"+ this.level +"] " + str);
}

KanjiBot.prototype._getUnusedCharacters = function(){
    "use strict";
    let self = this;
    let uncompleted = [];

    for(let k in self._kanji.table){
        let pos = self.completed.find(function(e){
            return e["kanji"]==self._kanji.table[k]["kanji"];
        });
        if(pos){
            // we found it in completed, so dont' add to the table
        } else {
            uncompleted.push(self._kanji.table[k]);
        }
    }
    return uncompleted;
};

KanjiBot.prototype._getRandomCharacter = function(){
    "use strict";
    let uncompleted = this._getUnusedCharacters();
    if(uncompleted.length == 0) this.log("UNCOMPLETED IS EMPTY!");
    return this._kanji.table[Math.floor(Math.random() * this._kanji.table.length)];
    let selectedChar = uncompleted[Math.floor(Math.random() * uncompleted.length)];

    this.completed.push(selectedChar);

    return selectedChar;
};

KanjiBot.prototype._constructTweet = function(char){
    "use strict";
    return char;
};

KanjiBot.prototype._getLevelKanji = function(dict){
    "use strict";
    let self = this;
    return dict.filter(function(d) {
        return d["oldJlptLevel"] == (6 - self.level);
    });
};

KanjiBot.prototype.initialize = function(dictFile){
    "use strict";
    this.log("Initializing...");
    let key = this.name;
    this._bot = new TwitterBot(gl.completedSaveDataJson[key]['cfg']);
    this._cfg = gl.completedSaveDataJson[key]['cfg'];
    if(gl.completedSaveDataJson){
        this.completed = gl.completedSaveDataJson[key]['completed'];
        this._lastTweetTimestamp = gl.completedSaveDataJson[key]['lastTweetStamp'];
        this._nextTweetTimestamp = gl.completedSaveDataJson[key]['nextTweetSchedule'];
    } else {
        this._lastTweetTimestamp = (new Date()).getTime();
        this._nextTweetTimestamp = (this._lastTweetTimestamp + (1000 * 60 * 60 * 24));
    }

    this._kanji.table = this._getLevelKanji(dictFile);

    this._lastTweetTimestamp = (new Date()).getTime();
    setInterval(this.update, 1000 * 60 * 10);
    this.log("Initialized! Tweeting in: " + (this._lastTweetTimestamp + (1000 * 60 * 60 * 24)) + "ms or " + this._nextTweetTimestamp.toString() + "ms");
};

KanjiBot.prototype.tweet = function(){
    "use strict";
    let self = this;
    let char = this._getRandomCharacter();
    char = char["kanji"];

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
            if(!err)
                this.log("Success!");
            else
                this.log("Failure!");
            self._lastTweetTimestamp = (new Date()).getTime();
            self._nextTweetTimestamp = (self._lastTweetTimestamp + (1000 * 60 * 60 * 24));
            this.log("Next tweet scheduled for " + (self._lastTweetTimestamp + (1000 * 60 * 60 * 24)) + " in " + (1000 * 60 * 60 * 24) + "ms... ");
        }
    );
};

KanjiBot.prototype.update = function(){
    "use strict";
    this.log("Updating...");
    let currTime = (new Date()).getTime();
    if(currTime >= this._nextTweetTimestamp){
        this.log("Time to tweet!");
        this.tweet();
    }
};

module.exports = KanjiBot;