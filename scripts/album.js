/*global $ */

var createSongRow = function(songNumber, songName, songLength) {
  var template =
    '<tr class="album-view-song-item">'
  + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
  + '  <td class="song-item-title">' + songName + '</td>'
  + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
  + '</tr>'
  ;

  var $row = $(template);
    
  var onHover = function() {
      var songItemNumber = $(this).find(getSongNumberCell());
      var number = parseInt(songItemNumber.attr('data-song-number'));

      if (number !== currentlyPlayingSongNumber) {
          songItemNumber.html(playButtonTemplate);
      }
  };

  var offHover = function() {
      var songItemNumber = $(this).find(getSongNumberCell());
      var number = parseInt(songItemNumber.attr('data-song-number'));

      if (number !== currentlyPlayingSongNumber) {
          songItemNumber.html(number);
      }
  };

  var clickHandler = function() {
    var songNumber = parseInt($(this).attr('data-song-number'));

    if (currentlyPlayingSongNumber !== null) {
      // Revert to song number for currently playing song because user started playing new song.
      var currentlyPlayingCell = $(getSongNumberCell(currentlyPlayingSongNumber));
      currentlyPlayingCell.html(currentlyPlayingSongNumber);
    }

    if (currentlyPlayingSongNumber !== songNumber) {
      // Switch from Play -> Pause button to indicate new song is playing.
      $(this).html(pauseButtonTemplate);
      setSong(songNumber);
      currentSoundFile.play();
      updateSeekPercentage($('.volume .seek-bar'), (currentVolume/100));
      updateSeekBarWhileSongPlays();
      updatePlayerBarSong();
    } 

    else if (currentlyPlayingSongNumber === songNumber) {
      if (currentSoundFile.isPaused()) {
        currentSoundFile.play
        updateSeekBarWhileSongPlays();
        $(this).html(pauseButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPauseButton);
      }
      else {
        currentSoundFile.pause();
        $(this).html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton);
      }
    }
  }
  
  $row.find('.song-item-number').click(clickHandler);
  $row.hover(onHover, offHover);
  return $row;
};

var setCurrentAlbum = function(album) {
  currentAlbum = album;
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);
  $albumSongList.empty();

 
  for (var i = 0; i < album.songs.length; i++) {
    var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
    $albumSongList.append($newRow);
  }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100;
  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);
  
  var percentageString = offsetXPercent + '%';
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
  var $seekBars = $('.player-bar .seek-bar');
  
  
  $seekBars.click(function(event) {
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    var seekBarFillRatio = offsetX / barWidth;
    updateSeekPercentage($(this), seekBarFillRatio);    

    if ($(this).parent().attr('class') == 'seek-control') {
      seek(seekBarFillRatio * currentSoundFile.getDuration());
    }
    else {
      setVolume(seekBarFillRatio * 100);
    }    
  });
  
  $seekBars.find('.thumb').mousedown(function(event) {
    var $seekBar = $(this).parent();

    $(document).on('mousemove.thumbSeek', function(event){
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();
      var seekBarFillRatio = offsetX / barWidth;

      updateSeekPercentage($seekBar, seekBarFillRatio);
      
      if ($(this).parent().attr('class') == 'seek-control') {
        seek(seekBarFillRatio * currentSoundFile.getDuration());
      }
      else {
        setVolume(seekBarFillRatio * 100);
      }  
    });

    $(document).on('mouseup.thumbSeek', function() {
      $(document).off('mousemove.thumbSeek');
      $(document).off('mouseup.thumbSeek');
    });
  });
};

var updateSeekBarWhileSongPlays = function() {
  if (currentSoundFile) {
    currentSoundFile.bind('timeupdate', function(event) {
      var seekBarFillRatio = this.getTime() / this.getDuration();
      var $seekBar = $('.seek-control .seek-bar');
      setCurrentTimeInPlayerBar(this.getTime());
      updateSeekPercentage($seekBar, seekBarFillRatio);
    });
  }
};

var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};

var nextSong = function() {
  var prevSongIndex = function(index) {
    return index == 0 ? currentAlbum.songs.length : index;
  }
  
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  currentSongIndex++;
  
  // if increment puts index past the last song in the songs array, go back to start
  if (currentSongIndex >= currentAlbum.songs.length) {
    currentSongIndex = 0;
  }
  
  // song number should be 1 higher than the index in the array
  setSong(currentSongIndex + 1);
  currentSoundFile.play();
  updatePlayerBarSong();
  updateSeekBarWhileSongPlays();
  
  var prevSongNumber = prevSongIndex(currentSongIndex);
  var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(prevSongNumber);
  // update html of new song's element with pause button and update prev song element with number
  $nextSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(prevSongNumber);
};

var previousSong = function() {
  var prevSongIndex = function(index) {
    return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
  }
  
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  currentSongIndex--;
  
  // if you decrement past the first song on the album, go to the end of the album
  if (currentSongIndex < 0) {
    currentSongIndex = currentAlbum.songs.length - 1;
  }
  
  setSong(currentSongIndex + 1);
  currentSoundFile.play();
  updatePlayerBarSong();  
  updateSeekBarWhileSongPlays();
  
  var prevSongNumber = prevSongIndex(currentSongIndex);
  var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(prevSongNumber);
  // update html of new song's element with pause button and update prev song element with number
  $previousSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(prevSongNumber);
};

var updatePlayerBarSong = function() {
  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  
  $('.main-controls .play-pause').html(playerBarPauseButton);
  setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
};

var togglePlayFromPlayerBar = function() {
  if (currentSoundFile.isPaused()) {
    currentSoundFile.play();
    $('.main-controls .play-pause').html(playerBarPauseButton);
    $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]').html(pauseButtonTemplate);
  }
  else {
    currentSoundFile.pause();
    $('.main-controls .play-pause').html(playerBarPlayButton);
    $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]').html(playButtonTemplate);
  }
};

var setSong = function(songNumber) {
  if (currentSoundFile) {
    currentSoundFile.stop();
  }
  currentlyPlayingSongNumber = parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    formats: [ 'mp3' ],
    preload: true
  });
  setVolume(currentVolume);
};

var seek = function(time) {
  if (currentSoundFile) {
    currentSoundFile.setTime(time);
  }
};

var setVolume = function(volume) {
  if (currentSoundFile) {
    currentSoundFile.setVolume(volume);
    currentVolume = volume;
  }
};

var setCurrentTimeInPlayerBar = function(currentTime) {
  $('.current-time').text(filterTimeCode(currentTime));
};

var setTotalTimeInPlayerBar = function(totalTime) {
  $('.total-time').text(filterTimeCode(totalTime));
};

var filterTimeCode = function(timeInSeconds) {
  timeInSeconds = parseFloat(timeInSeconds);
  var seconds = timeInSeconds % 60;
  var minutes = (timeInSeconds - seconds) / 60;
  if (seconds < 10) {
    return (minutes + ":0" + seconds.toFixed());
  }
  else {
    return (minutes + ":" + seconds.toFixed());
  }
};

var getSongNumberCell = function(number) {
  if (number == undefined) {
      return $('.song-item-number');
  }
  else {
    return $('.song-item-number[data-song-number="' + number + '"]');
  }
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPauseButton = $('.main-controls .play-pause');

$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
  setupSeekBars();
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
  $playPauseButton.click(togglePlayFromPlayerBar);
});