'use strict';

angular.module('app.directives', []).
  directive('validSoundUrl', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$parsers.unshift(function (value) {
          var msg = 'This does not seem to be a SoundCloud url'

          // poor man's sc url validator
          var parts = value.split('/')
          // http: / / soundcloud.com / user / track
          var valid = parts.length == 5 &&
                      parts[3] && parts[4] &&
                      parts[2] == 'soundcloud.com'
          // update validity and error message
          ctrl.$setValidity('validSoundUrl', valid)
          elm[0].setCustomValidity(valid ? '' : msg)
          return valid ? value : undefined
        })
      }
    }
  }).

  directive('player', function($http, sc) {
    return {
      restrict: 'E',
      link: function(scope, elm, attrs, ctrl) {
        var audio = elm.find('audio')

        scope.currentTime = 0
        scope.duration = Infinity

        audio.bind('timeupdate', function(e) {
          scope.currentTime = this.currentTime
          scope.$digest()
        })

        audio.bind('ended', function() {
          scope.ended(scope.sound)
        })

        audio.bind('pause', function() {
          scope.pause(scope.sound)
        })

        audio.bind('play', function() {
          scope.play(scope.sound)
        })

        audio.bind('durationchange', function(e) {
          scope.duration = this.duration
          scope.$digest()
        })

        scope.seek = function(event) {
          // there's no better way to access .progress
          // (the visual bar child might be also clicked)
          var t = angular.element(event.target)
          if(! t.hasClass('progress')) {
            t = t.parent()
          }
          var pos = event.offsetX / t[0].clientWidth
          audio[0].currentTime = audio[0].duration * pos
        }

        scope.stream = function() {
          return this.track.stream_url
            ? this.track.stream_url + '?client_id=YOUR_CLIENT_ID'
            : null
        }

        scope.toggle = function() {
          if(scope.playing) {
            pause()
          } else {
            play()
          }
        }

        scope.$watch('current', function() {
          console.log('current', scope.current, scope.sound)
          if(scope.current == scope.sound) {
            play()
          } else {
            pause()
          }
        })

        function play() {
          scope.playing = true
          audio[0].play()
        }

        function pause() {
          scope.playing = false
          audio[0].pause()
        }

        scope.track = sc.resolve({ url: scope.sound })
      }
    }
  })
