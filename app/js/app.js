'use strict';

angular.module('app', ['app.filters', 'app.services', 'app.directives', 'app.controllers']).
  config(function($routeProvider, $httpProvider) {
    // fix cors issue with $http
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    // we only have one controller for now
    $routeProvider.otherwise({
      templateUrl: 'partials/playlist.html',
      controller: 'PlaylistCtrl'
    });
  });
