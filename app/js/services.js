'use strict';

angular.module('app.services', ['ngResource']).

  factory('server', function($rootScope) {
    window.WebSocket = window.WebSocket || window.MozWebSocket

    var connection = new WebSocket('ws://' + window.location.host),
        handlers = []

    connection.onopen = function() {
      console.log('socket opened')
    }

    connection.onerror = function(error) {
      console.error(error)
    }

    connection.onmessage = function(message) {
      var json
      try {
        json = JSON.parse(message.data)
      } catch (e) {
        console.error('This doesn\'t look like a valid JSON: ', message.data)
        return
      }
      // handle incoming message
      console.log('IN', json)
      $rootScope.$apply(function () {
        handlers
          .filter(function(handler) {
            return handler.event == json.event
          })
          .forEach(function(handler) {
            handler.callback.call(connection, json.value)
          })
      })
    }

    return {
      on: function(event, callback) {
        handlers.push({
          event: event,
          callback: callback
        })
      },

      send: function(event, value) {
        var json = {
          event: event,
          value: value
        }
        console.log('OUT', json)
        connection.send(JSON.stringify(json))
      }
    }
  }).

  factory('sc', function($rootScope, $resource) {
    var api = 'http://api.soundcloud.com/:verb'
    return $resource(api, {
      format: 'json',
      client_id: 'YOUR_CLIENT_ID'
    }, {
      resolve: { method: 'GET', params: { verb: 'resolve' } }
    })
  })
