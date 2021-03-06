'use strict';

angular.module('BuddyPairApp.services')
  .service('PeerService', function($q, $http) {
    var service = {};

    service.getList = function(semester_id) {
      var deferred = $q.defer();
      $http.get('/api/peers/' + semester_id)
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(msg, code) {
          deferred.reject({
            code: code,
            message: msg
          });
          console.log(msg);
        });
      return deferred.promise;
    };

    service.getCount = function(semester_id) {
      var deferred = $q.defer();
      $http.get('/api/peers/' + semester_id + '/count')
        .success(function(data) {
          deferred.resolve(data[0]);
        })
        .error(function(msg, code) {
          deferred.reject({
            code: code,
            message: msg
          });
          console.log(msg);
        });
      return deferred.promise;
    };

    service.getById = function(id) {
      var deferred = $q.defer();
      $http.get('/api/peer/' + id)
        .success(function(data) {
          var peer = data[0];
          $http.get('/api/peer/' + id + '/assigned_erasmus')
            .success(function(data) {
              peer.assignedErasmus = data;
              deferred.resolve(peer);
            })
            .error(function(msg, code) {
              deferred.reject({
                code: code,
                message: msg
              });
              console.log(msg);
            });
        })
        .error(function(msg, code) {
          deferred.reject({
            code: code,
            message: msg
          });
          console.log(msg);
        });
      return deferred.promise;
    };

    service.deleteById = function(id) {
      var deferred = $q.defer();
      $http.delete('/api/peer/' + id)
        .success(function() {
          deferred.resolve();
        })
        .error(function(msg, code) {
          deferred.reject({
            code: code,
            message: msg
          });
          console.log(msg);
        });
      return deferred.promise;
    };

    service.addAssignedErasmus = function(peer_id, erasmus_id) {
      var deferred = $q.defer();
      $http.put('/api/peer/' + peer_id + '/assigned_erasmus', { erasmus_id: erasmus_id })
        .success(function() {
          deferred.resolve();
        })
        .error(function(msg, code) {
          deferred.reject({
            code: code,
            message: msg
          });
          console.log(msg);
        });
      return deferred.promise;
    };

    service.removeAssignedErasmus = function(peer_id, erasmus_id) {
      var deferred = $q.defer();
      $http.delete('/api/peer/' + peer_id + '/assigned_erasmus/' + erasmus_id)
        .success(function() {
          deferred.resolve();
        })
        .error(function(msg, code) {
          deferred.reject({
            code: code,
            message: msg
          });
          console.log(msg);
        });
      return deferred.promise;
    };

    service.removeAllAssignedErasmus = function(peer_id) {
      var deferred = $q.defer();
      $http.delete('/api/peer/' + peer_id + '/assigned_erasmus')
        .success(function() {
          deferred.resolve();
        })
        .error(function(msg, code) {
          deferred.reject({
            code: code,
            message: msg
          });
          console.log(msg);
        });
      return deferred.promise;
    };

    service.addPeer = function(peer) {
      var deferred = $q.defer();
      $http.post('/api/peers', { peer: peer })
        .success(function(data, status, headers, config) {
          deferred.resolve(headers('Location'));
        })
        .error(function(msg, code) {
          deferred.reject({
            code: code,
            message: msg
          });
          console.log(msg);
        });
      return deferred.promise;
    };

    service.editPeer = function(id, peer) {
      var deferred = $q.defer();
      $http.put('/api/peer/' + id, { peer: peer })
        .success(function() {
          deferred.resolve();
        })
        .error(function(msg, code) {
          deferred.reject({
            code: code,
            message: msg
          });
          console.log(msg);
        });
      return deferred.promise;
    };

    service.exportToCSV = function(peer_list) {
      var result = 'Name;Surname;Email;NIA';
      peer_list.forEach(function(p) {
        if (p.num_erasmus > 0) {
          result += '\n' + p.name + ';' + p.surname + ';' + p.email + ';' + p.nia;
        }
      });
      return result;
    };

    return service;
  });