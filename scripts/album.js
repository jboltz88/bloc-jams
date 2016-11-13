/*global $ */

var albumPicasso = {
  title: 'The Colors',
  artist: 'Pablo Picasso',
  label: 'Cubism',
  year: '1881',
  albumArtUrl: 'assets/images/album_covers/01.png',
  songs: [
    { title: 'Blue', duration: '4:26' },
    { title: 'Green', duration: '3:14' },
    { title: 'Red', duration: '5:01' },
    { title: 'Pink', duration: '3:21'},
    { title: 'Magenta', duration: '2:15'}
  ]
};

var albumMarconi = {
  title: 'The Telephone',
  artist: 'Guglielmo Marconi',
  label: 'EM',
  year: '1909',
  albumArtUrl: 'assets/images/album_covers/20.png',
  songs: [
    { title: 'Hello, Operator?', duration: '1:01' },
    { title: 'Ring, ring, ring', duration: '5:01' },
    { title: 'Fits in your pocket', duration: '3:21'},
    { title: 'Can you hear me now?', duration: '3:14' },
    { title: 'Wrong phone number', duration: '2:15'}
  ]
};

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
        var songItemNumber = $(this).find('.song-item-number');
        var number = songItemNumber.attr('data-song-number');

        if (number !== currentlyPlayingSong) {
            songItemNumber.html(playButtonTemplate);
        }
    };

    var offHover = function() {
        var songItemNumber = $(this).find('.song-item-number');
        var number = songItemNumber.attr('data-song-number');

        if (number !== currentlyPlayingSong) {
            songItemNumber.html(number);
        }
    };
  
    var clickHandler = function() {
      var songNumber = $(this).attr('data-song-number');
      console.log(currentlyPlayingSong);
      // if there is no currently playing song
      if (currentlyPlayingSong === null) {
        $(this).html(pauseButtonTemplate);
        currentlyPlayingSong = songNumber;
      }
      // if the song clicked is the currently playing song
      else if (currentlyPlayingSong === songNumber) {
        $(this).html(playButtonTemplate);
        currentlyPlayingSong = null;
      }
      // if the song clicked is not the currently playing song
      else {
        var currentlyPlayingSongElement = $('[data-song-number="' + currentlyPlayingSong + '"]');
        
        $(currentlyPlayingSongElement).html(currentlyPlayingSong);
        $(this).html(pauseButtonTemplate);
        currentlyPlayingSong = songNumber;
      }
    }
  
  $row.find('.song-item-number').click(clickHandler);
  $row.hover(onHover, offHover);
  return $row;
};

var setCurrentAlbum = function(album) {
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

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var currentlyPlayingSong = null;

$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
});