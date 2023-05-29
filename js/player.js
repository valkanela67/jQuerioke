// HTML5 audio player + playlist controls...
var karaoke;
jQuery(function ($) {
    'use strict'

    var settings = {
        'last-word-highlight-time': 5.5,
        'scroll-animation-time': .1,
        'karaoke-player-elem': $('#audio1'),
        'karaoke-lyrics-elem': $('#karaoke-lyrics')
    };

    karaoke = new Karaoke('', '', settings);

    var supportsAudio = !!document.createElement('audio').canPlayType;
    if (supportsAudio) {
        var index = -1,
            playing = false,
            mediaPath = 'audio/',
            extension = '',
            lrcPath = 'lrc/',
            lrcExt  = '.lrc', // .lrc or .json
            tracks = [{
                "track": 1,
                "name": "Merry Christmas",
                "length": "1:37",
                "file": "christmas"
            }, {
                "track": 2,
                "name": "Mary had a little lamb",
                "length": "0:58",
                "file": "mary"
            }],
            buildPlaylist = $.each(tracks, function(key, value) {
                var trackNumber = value.track,
                    trackName = value.name,
                    trackLength = value.length;
                if (trackNumber.toString().length === 1) {
                    trackNumber = '0' + trackNumber;
                } else {
                    trackNumber = '' + trackNumber;
                }
                $('#plList').append('<li data-track="'+trackName.toLowerCase()+'"><div class="plItem"><div class="plNum">' + trackNumber + '.</div><div class="plTitle">' + trackName + '</div><div class="plLength">' + trackLength + '</div></div></li>');
                $('#filter-list').append('<option value="'+trackName+'">');
            }),
            trackCount = tracks.length,
            npAction = $('#npAction'),
            npTitle = $('#npTitle'),
            audio = $('#audio1').bind('play', function () {
                playing = true;
                npAction.text('Now Playing...');
            }).bind('pause', function () {
                playing = false;
                npAction.text('Paused...');
            }).bind('ended', function () {
                npAction.text('Paused...');
                if ((index + 1) < trackCount) {
                    index++;
                    loadTrack(index);
                    karaoke.play();
                } else {
                    karaoke.pause();
                    index = 0;
                    loadTrack(index);
                }
            }).get(0),
            btnPrev = $('#btnPrev').click(function () {
                if ((index - 1) > -1) {
                    index--;
                    loadTrack(index);
                    if (playing) {
                        karaoke.play();
                    }
                } else {
                    karaoke.pause();
                    index = 0;
                    loadTrack(index);
                }
            }),
            btnNext = $('#btnNext').click(function () {
                if ((index + 1) < trackCount) {
                    index++;
                    loadTrack(index);
                    if (playing) {
                        karaoke.play();
                    }
                } else {
                    karaoke.pause();
                    index = 0;
                    loadTrack(index);
                }
            }),
            li = $('#plList li').click(function () {
                var id = parseInt($(this).index());
                if (id !== index) {
                    playTrack(id);
                }
                $("html, body").animate({ scrollTop: 0 }, "slow");
            }),
            loadTrack = function (id) {
                $('.plSel').removeClass('plSel');
                $('#plList li:eq(' + id + ')').addClass('plSel');
                npTitle.text(tracks[id].name);
                index = id;
                //audio.src = mediaPath + tracks[id].file + extension;
                karaoke.loadSource(mediaPath + tracks[id].file + extension);
                karaoke.loadLyrics(lrcPath + tracks[id].file + lrcExt);
            },
            playTrack = function (id) {
                loadTrack(id);
                karaoke.play();
            };
        extension = audio.canPlayType('audio/mpeg') ? '.mp3' : audio.canPlayType('audio/ogg') ? '.ogg' : '';
        //loadTrack(index);
    }

    $('#filter').change(
        function()
        {
           var filter = this.value.toLowerCase();
            $('#plList li').each(function()
            {
                if( this.getAttribute('data-track').indexOf(filter) == -1 )
                {
                    this.style.display = 'none';
                }
                else
                {
                    this.style.display = '';
                }    
            })
        }
    )/*.focus();*/
});

//initialize plyr
plyr.setup($('#audio1'), {});