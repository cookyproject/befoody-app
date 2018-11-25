app.controller('PlaceMapCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory) {

  $scope.map = null;
  $scope.goBackward = function () {
    $ionicHistory.goBack();
  };
  $scope.init = function () {

    $scope.map = new google.maps.Map($('div.map')[0], {
      center: {
        lat: -34.397,
        lng: 150.644
      },
      zoom: 15
    });
  };
  $scope.init();
});
