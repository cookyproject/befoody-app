app.controller('PlaceMapCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory) {

  $scope.map = null;
  $scope.goBackward = function () {
    $ionicHistory.goBack();
  };
  $scope.$on("$ionicView.enter", function (scopes, states) {
    var cuurLoc = {
      lat: 25.0444082,
      lng: 121.522801
    };
    if (!$scope.map) {
      $scope.map = new google.maps.Map($('div.map')[0], {
        center: currLoc,
        zoom: 15
      });
    }

    navigator.geolocation.getCurrentPosition(function (position) {
      console.log(position);
    }, function (err) {
      console.error(err);
    });

  });
  $scope.init = function () {

  };
  $scope.init();
});
