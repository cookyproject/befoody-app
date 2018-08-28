app.controller('PlaceListCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory) {
  var virtualMap = document.createElement('div');
  $scope.placeService = new google.maps.places.PlacesService(virtualMap);
  $scope.placeKeyword = '';
  $scope.findPlace = firebase.functions().httpsCallable('findPlace');
  $scope.places = [];
  $scope.submitQuery = function () {
    var request = {
      query: $scope.placeKeyword
    }
    $scope.findPlace(request).then(function (result) {
      console.log(result);
      $scope.$apply(function () {
        $scope.places = result.data.results;
      });



    }).catch(function (err) {
      console.error(err);
    });

  };

  $scope.clickPlace = function (place) {
    $state.go('main-tabs.place-post-list', {
      place: place
    });
  };


});
