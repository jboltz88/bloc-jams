/*global $ */

var createSongRow = function(songNumber, songName, songLength) {
  var template =
    '<tr class="album-view-song-item">'
  + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
  + '  <td class="song-item-title">' + songName + '</td>'
  + '  <td class="song-item-duration">' + songLength + '</td>'
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
        updatePlayerBarSong();
      } 
      
      else if (currentlyPlayingSongNumber === songNumber) {
        // Switch from Pause -> Play button to pause currently playing song.
        $(this).html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton);
        setSong(null);
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

var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};

var nextSong = function(bool) {
  var lastSongIndex = function(index) {
    if (bool) {
      return index == 0 ? currentAlbum.songs.length : index;
    }
    else {
      return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
    }
  }
  
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  
  if (bool) {
    currentSongIndex++;
  }
  else {
    currentSongIndex--;
  }
  
  // song list boundary control
  if (currentSongIndex >= currentAlbum.songs.length) {
    currentSongIndex = 0;
  }
  if (currentSongIndex < 0) {
    currentSongIndex = currentAlbum.songs.length - 1;
  }
  // song number should be 1 higher than the index in the array
  setSong(currentSongIndex + 1);
  
  // update player bar
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.main-controls .play-pause').html(playerBarPauseButton);
  
  var lastSongNumber = lastSongIndex(currentSongIndex);
  var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
  // update html of new song's element with pause button and update prev song element with number
  $nextSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);
};

var updatePlayerBarSong = function() {
  $('.currently-playing .song-name').text(currentSongFromAlbum.title);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  
  $('.main-controls .play-pause').html(playerBarPauseButton);
};

var setSong = function(songNumber) {
  currentlyPlayingSongNumber = songNumber;
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
}

var getSongNumberCell = function(number) {
  if (number == undefined) {
      return $('.song-item-number');
  }
  else {
    return $('.song-item-number[data-song-number="' + number + '"]');
  }
}

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
  $previousButton.click(function() {
    nextSong(false);
  });
  $nextButton.click(function() {
    nextSong(true);
  });
});