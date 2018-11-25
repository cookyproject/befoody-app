app.controller('PlaceMapCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory) {

  $scope.map = null;
  $scope.currLoc = {
    lat: 25.0444082,
    lng: 121.522801
  };
  $scope.goBackward = function () {
    $ionicHistory.goBack();
  };
  $scope.$on("$ionicView.enter", function (scopes, states) {

    if (!$scope.map) {
      $scope.map = new google.maps.Map($('div.map')[0], {
        center: $scope.currLoc,
        zoom: 15,
        mapTypeControl: false,
        zoomControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });
    }

    navigator.geolocation.getCurrentPosition(function (position) {
      console.log(position);
      if (position) {
        $scope.currLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      }
      $scope.map.panTo($scope.currLoc);


    }, function (err) {
      console.error(err);
    }, {
      timeout: 30000,
      maximumAge: 0,
      enableHighAccuracy: true
    });

  });
  $scope.init = function () {

  };
  $scope.init();
});
