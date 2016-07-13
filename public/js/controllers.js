'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('AppCtrl', function($scope, $route, $http, $auth) {
    $scope.$route = $route;
    $http.get('/api/me').then(function (data) {
      $scope.user = data.data;
    });
    $scope.authenticate = function(provider) {
      $auth.authenticate(provider).then(function() {
        console.log('Succesfully signed in with ' + provider);
        $http.get('/api/me').then(function (data) {
          $scope.user = data.data;
        });
      }).
      catch(function(err) {
        if (err.error) {
          console.log(err.error);
        } else if (err.data) {
          console.log(err.data.message, err.status);
        } else {
          console.log(err);
        }
      });
    };
    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
    $scope.logout = function() {
      $auth.logout().then(function() {
        console.log('Logged out');
      });
    };
  }).
  controller('ProfileCtrl', function($scope, $route, $http) {
    $scope.$route = $route;
    $http.get('/api/me').then(function (data) {
      $scope.user = data.data;
    });
  }).
  controller('ErasmusCtrl', function($scope, $route, $routeParams, $http) {
    $scope.$route = $route;
    $scope.filters = {
      withPeer: 'all'
    };
    if ($routeParams.id) {
      // Get the Erasmus' information from the API
      $scope.erasmus = {};
      $scope.erasmus.assignedPeer = null;
      $http.get('/api/erasmus/' + $routeParams.id).then(function (data) {
        $scope.erasmus = data.data[0];
        $http.get('/api/erasmus/' + $routeParams.id + '/assignedPeer').then(function (data) {
          $scope.erasmus.assignedPeer = data.data[0];
          $scope.selectedPeer = $scope.erasmus.assignedPeer;
        });
      });
      // Setup the peer assignment action
      $scope.setSelectedPeer = function(peer) {
        $scope.selectedPeer = peer;
      };
      // TODO: not working!
      var dialog = $('#assignPeerDialog');
      dialog.on('hide.bs.modal', function() {
        alert('modal hiding!');
        $scope.selectedPeer = $scope.erasmus.assignedPeer;
      });
      $scope.availablePeers = null;
      $http.get('/api/peerList').then(function(data) {
        $scope.availablePeers = data.data;
      });
      $scope.updateAssignedPeer = function() {
        // TODO: check for errors in API calls...
        if (!$scope.selectedPeer && $scope.erasmus.assignedPeer) {
          // If there's no selected peer and the Erasmus previously had one, delete it
          $scope.erasmus.assignedPeer.num_erasmus--;
          $http.get('/api/erasmus/' + $scope.erasmus.erasmus_id + '/removeAssignedPeer');
        } else if ($scope.selectedPeer && !$scope.erasmus.assignedPeer) {
          // If there is a new selected peer and the Erasmus didn't have one, add it
          $scope.selectedPeer.num_erasmus++;
          $http.get('/api/erasmus/' + $scope.erasmus.erasmus_id + '/assignPeer/' + $scope.selectedPeer.peer_id);
        } else if ($scope.erasmus.assignedPeer && $scope.erasmus.assignedPeer.peer_id != $scope.selectedPeer.peer_id) {
          // If the Erasmus had an assigned peer and it's not the same as the selected one, replace it
          $scope.selectedPeer.num_erasmus++;
          $scope.erasmus.assignedPeer.num_erasmus--;
          $http.get('/api/erasmus/' + $scope.erasmus.erasmus_id + '/removeAssignedPeer', function() {
            $http.get('/api/erasmus/' + $scope.erasmus.erasmus_id + '/assignPeer/' + $scope.selectedPeer.peer_id);
          });
        }
        $scope.erasmus.assignedPeer = $scope.selectedPeer;
      };
      // Setup the Erasmus deletion action
      $scope.deleteErasmus = function() {
        if (confirm('Do you want to delete ' + $scope.erasmus.name + ' ' + $scope.erasmus.surname + '\'s profile?\n' +
            '(The assigned peer, if any, won\'t be deleted)'))
          $http.get('/api/erasmus/' + $scope.erasmus.erasmus_id + '/delete').then(function(data) {
            $scope.erasmus = null;
          });
      };
    } else {
      $scope.filter_erasmus = function(e) {
        var filters = $scope.filters;
        var nameFilter = !filters.name || (e.name + " " + e.surname).toLowerCase().indexOf(filters.name.toLowerCase()) > -1;
        var assignedPeerFilter = !filters.withPeer || (filters.withPeer == 'all') ||
          (filters.withPeer == 'y' && e.has_peer) || (filters.withPeer == 'n' && !e.has_peer);
        return nameFilter && assignedPeerFilter;
      };
      $scope.erasmusList = null;
      $http.get('/api/erasmusList').then(function (data) {
        $scope.erasmusList = data.data;
      });
    }
  }).
  controller('PeerCtrl', function($scope, $route, $routeParams, $http) {
    $scope.$route = $route;
    if ($routeParams.id) {
      // Get the peer's information from the API
      $scope.peer = {};
      $http.get('/api/peer/' + $routeParams.id).then(function (data) {
        $scope.peer = data.data[0];
        $http.get('/api/peer/' + $routeParams.id + '/assignedErasmus').then(function (data) {
          $scope.peer.assignedErasmus = data.data;
          $scope.selectedErasmus = $scope.peer.assignedErasmus;
        });
      });
      // Setup the Erasmus assignment action
      $scope.addSelectedErasmus = function(erasmus) {
        $scope.selectedErasmus.push(erasmus);
      };
      // TODO: not working!
      var dialog = $('#assignErasmusDialog');
      dialog.on('hide.bs.modal', function() {
        alert('modal hiding!');
        $scope.selectedErasmus = $scope.peer.assignedErasmus;
      });
      $scope.availableErasmus = null;
      $http.get('/api/erasmusList').then(function(data) {
        $scope.availableErasmus = data.data.filter(function(e) {
          return !e.has_peer;
        });
      });
      $scope.updateAssignedErasmus = function() {
        // TODO: implement
      };
      // Setup the peer deletion action
      $scope.deletePeer = function() {
        if (confirm('Do you want to delete ' + $scope.peer.name + ' ' + $scope.peer.surname + '\'s profile?\n' +
            '(The assigned Erasmus, if any, won\'t be deleted)'))
          $http.get('/api/peer/' + $scope.peer.peer_id + '/delete').then(function(data) {
            $scope.peer = null;
          });
      };
    } else {
      $scope.filters = {
        numErasmus: {
          zero: true,
          one: true,
          two: true,
          three: true
        }
      };
      $scope.filter_peers = function(p) {
        var filters = $scope.filters;
        var nameFilter = !filters.name || (p.name + " " + p.surname).toLowerCase().indexOf(filters.name.toLowerCase()) > -1;
        var assignedErasmusFilter = false;
        switch (p.num_erasmus) {
          case 0:
            assignedErasmusFilter = filters.numErasmus.zero;
            break;
          case 1:
            assignedErasmusFilter = filters.numErasmus.one;
            break;
          case 2:
            assignedErasmusFilter = filters.numErasmus.two;
            break;
          case 3:
            assignedErasmusFilter = filters.numErasmus.three;
            break;
          default:
            assignedErasmusFilter = filters.numErasmus.three;
        }
        return nameFilter && assignedErasmusFilter;
      };
      $scope.peerList = null;
      $http.get('/api/peerList').then(function (data) {
        $scope.peerList = data.data;
      });
    }
  });
