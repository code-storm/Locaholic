 /// <reference path="../angular.min.js" />

 function Places($scope,$location, $anchorScroll) {
           $scope.scrollTo = function (location) {
               $location.hash(location);
               $anchorScroll.yOffset = 20;
               $anchorScroll();
           }
        }
        var app = angular.module("locaApp2", []);
        app.controller("locaCtrl2", Places);