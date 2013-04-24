'use strict';

angular.module('app.controllers', []).

controller('PlaylistCtrl', function ($scope, server) {
  var sounds = $scope.sounds = []
  $scope.current = 'asd'

  server.on('reset', function(newSounds) {
    sounds = $scope.sounds = newSounds
  })

  server.on('add', function(sound) {
    addSound(sound)
  })

  server.on('remove', function(sound) {
    removeSound(sound)
  })

  $scope.addSound = function() {
    server.send('add', $scope.newSound)
    addSound($scope.newSound)
    $scope.newSound = ''
  }

  $scope.removeSound = function(sound) {
    server.send('remove', sound)
    removeSound(sound)
  }

  $scope.play = function(sound) {
    console.log('play', sound)
    $scope.current = sound
  }

  $scope.pause = function(sound) {
    console.log('pause', sound)
  }

  $scope.ended = function(sound) {
    console.log('ended', sound)
    var i = sounds.indexOf(sound)
    if(i < sounds.length - 1) {
      $scope.current = sounds[i + 1]
    }
  }

  function removeSound(sound) {
    sounds.splice(sounds.indexOf(sound), 1)
  }

  function addSound(newSound) {
    sounds.push(newSound)
  }
})
