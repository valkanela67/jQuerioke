(function() {
    var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  
    window.Karaoke = (function() {
      function Karaoke(lyrics, source, settings) {
        var default_settings;
        if (settings == null) {
          settings = void 0;
        }
        this.moveToLine = __bind(this.moveToLine, this);
        this.playWord = __bind(this.playWord, this);
        this.cancelWordTimers = __bind(this.cancelWordTimers, this);
        this.initWordTimers = __bind(this.initWordTimers, this);
        this.initLyrics = __bind(this.initLyrics, this);
        this.initPlayerBinds = __bind(this.initPlayerBinds, this);
        this.initVars = __bind(this.initVars, this);
        this.settings = $.extend(
          {
            'last-word-highlight-time': 1.0,
            'scroll-animation-time': .1,
            'karaoke-player-elem': $('audio#karaoke-player'),
            'karaoke-lyrics-elem': $('#karaoke-lyrics')
          },
          settings
        );

        this.initVars();
        this.initPlayerBinds();

        if (lyrics != '' && source != '')
        {
          this.loadLyrics(lyrics);
          this.loadSource(source);
        }
      }
  
      Karaoke.prototype.initVars = function() {
        this.player_elem = this.settings['karaoke-player-elem'][0];
        this.lyrics_elem = this.settings['karaoke-lyrics-elem'];
        return this.word_timers = [];
      };
  
      Karaoke.prototype.initPlayerBinds = function() {
        this.player_elem.addEventListener('play', (function(_this) {
          return function() {
            if (_this.word_timers.length > 0) {
              _this.cancelWordTimers();
            }
            return _this.initWordTimers();
          };
        })(this));
        this.player_elem.addEventListener('pause', (function(_this) {
          return function() {
            return _this.cancelWordTimers();
          };
        })(this));
        return this.player_elem.addEventListener('seeked', (function(_this) {
          return function() {
            _this.cancelWordTimers();
            return _this.initWordTimers();
          };
        })(this));
      };
  
      Karaoke.prototype.initLyrics = function() {
        this.lyrics_elem.html('');
        $.each(this.lyrics, (function(_this) {
          return function(line_index, line) {
            var build_line;
            build_line = "<p class='line'>";
            $.each(line, function(word_index, word) {
              if (word_index > 0) {
                build_line += "";
              }
              return build_line += "<span class='word'>" + word[1] + "</span>";
            });
            build_line += "</p>";
            return _this.lyrics_elem.append(build_line);
          };
        })(this));
        this.initWordTimers();
        return this.moveToLine(0);
      };
  
      Karaoke.prototype.initWordTimers = function() {
        this.cancelWordTimers();
        var current_time, moved_to_line;
        current_time = this.player_elem.currentTime;
        moved_to_line = false;
        return $.each(this.lyrics, (function(_this) {
          return function(line_index, line) {
            return $.each(line, function(word_index, word_piece) {
              var get_next_time, time_offset, time_until_next, timing, word;
              timing = word_piece[0];
              word = word_piece[1];
              if (timing > _this.player_elem.currentTime) {
                if (!moved_to_line) {
                  _this.moveToLine(line_index);
                  moved_to_line = true;
                }
                time_offset = (timing - _this.player_elem.currentTime) * 1000;
                if (_this.lyrics[line_index].length > word_index + 1) {
                  get_next_time = _this.lyrics[line_index][word_index + 1][0];
                } else if (_this.lyrics.length > line_index + 1) {
                  get_next_time = _this.lyrics[line_index + 1][0][0];
                } else {
                  get_next_time = timing + _this.settings['last-word-highlight-time'];
                }
                time_until_next = get_next_time - timing;
                return _this.word_timers.push(setTimeout(function() {
                  return _this.playWord(line_index, word_index, time_until_next);
                }, time_offset));
              }
            });
          };
        })(this));
      };
  
      Karaoke.prototype.cancelWordTimers = function() {
        for(var i=0; i < this.word_timers.length; ++i)
        {
          clearTimeout(this.word_timers[i])
        }
        return this.word_timers = [];
      };
  
      Karaoke.prototype.playWord = function(line_index, word_index, time_offset) {
        var line_elem, word_elem;
        line_elem = this.lyrics_elem.find('.line')[line_index];
        word_elem = $(line_elem).find('.word')[word_index];
        $(word_elem).addClass('active');
        setTimeout(function() {
          return $(word_elem).removeClass('active').addClass('later');
        }, time_offset * 1000);
        return this.moveToLine(line_index);
      };
  
      Karaoke.prototype.moveToLine = function(line_index) {
        var height;
        height = $(this.lyrics_elem.find('.line')[line_index]).outerHeight();
        return this.lyrics_elem.animate({
          scrollTop: height * line_index
        }, this.settings['scroll-animation-time'] * 1000);
      };

      Karaoke.prototype.loadLyrics = function(lyrics) {
        if (typeof lyrics == 'string') {
          if (lyrics.substr(-4) == '.lrc') {

            var _this = this;
            $.get(lyrics, '', function(r){
              _this.lyrics = _this.lrc2(r);
              _this.initLyrics();
            }, 'text');

          }
          else if (lyrics.substr(-5) == '.json') {
            
                        var _this = this;
                        $.get(lyrics, '', function(r){
                          _this.lyrics = r;
                          _this.initLyrics();
                        }, 'json');
            
                      }
          else{
            this.lyrics = this.lrc2(lyrics);
            this.initLyrics();
          }

        }
        else {
          this.lyrics = lyrics;
          this.initLyrics();
        }
      }

      Karaoke.prototype.loadSource = function(source) {
        this.player_elem.src = source;
        this.player_elem.load();
      };

      Karaoke.prototype.play = function() {
        this.player_elem.play();  
      }

      Karaoke.prototype.pause = function() {
        this.player_elem.pause();  
      }

      Karaoke.prototype.lrc2 = function(lrc) {
        var out, i, i2;
        var time2num = function(str)
        {	var num, tmp;
          tmp = str.split(':');
          num = ((parseInt(tmp[0]) * 60  ) * 100000 + parseFloat(tmp[1] * 100000)) / 100000;
          return num;
        };
  
        lrc = lrc.trim().replace(/\[/g, '<').replace(/\]/g,'>');
        lrc = lrc.split('\n');
  
        //<00:07.96>JA <00:09.21>SAN <00:09.72>ĆA<00:10.02>ĆIN <00:11.14>GR<00:11.37>DE<00:11.63>LIN,
        for (i = 0; i < lrc.length; ++i)
        {
          lrc[i] = lrc[i].split('<');
  
          //makni prvi clan koji je prazan;
          lrc[i].shift();
  
          for (i2 = 0; i2 < lrc[i].length; ++i2)
          {
            lrc[i][i2] = lrc[i][i2].split('>');
  
            lrc[i][i2][0] = time2num(lrc[i][i2][0]);
          }
        }
  
        return lrc;
      }


  
      return Karaoke;
  
    })();
  
  }).call(this);