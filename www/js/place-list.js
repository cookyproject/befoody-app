app.controller('PlaceListCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory) {
  var virtualMap = document.createElement('div');
  $scope.placeService = new google.maps.places.PlacesService(virtualMap);
  $scope.placeKeyword = '';
  $scope.findPlace = firebase.functions().httpsCallable('findPlace');
  $scope.places = [];

  $scope.disableTap = function () {
    var container = document.getElementsByClassName('pac-container');
    angular.element(container).attr('data-tap-disabled', 'true');
    var backdrop = document.getElementsByClassName('backdrop');
    angular.element(backdrop).attr('data-tap-disabled', 'true');
    angular.element(container).on("click", function () {
      document.getElementById('pac-input').blur();
    });

  };
  $scope.$on('googlePlaceAutoComplete.placeChanged', function (event, place) {

    console.log(place);
    if (place.types.indexOf('cafe') != -1) {
      $scope.places = [place];

      $scope.places.forEach(function (place) {
        firebase.database().ref("posts").orderByChild('placeId').equalTo(place.place_id).limitToLast(1).once("value").then(function (placePostSnapshots) {
          var added = [];
          placePostSnapshots.forEach(function (placePostSnap) {

            if (!placePostSnap.exists()) {
              return;
            }
            var post = placePostSnap.val();
            if (post.photos && post.photos.length > 0) {
              $scope.$apply(function () {
                place.imageUrl = post.photos[0].url;
              });
            }
          });

        });
      });


    } else {
      $scope.places = [];
      $ionicPopup.alert({
        title: '此位置不是咖啡廳',
        template: '請選擇咖啡廳作為搜尋條件'

      });
      $scope.clearKeyword();
    }

  });

  $scope.clearKeyword = function () {
    $scope.placeKeyword = '';
  }
  $scope.clickPlace = function (place) {
    $state.go('main-tabs.place-post-list', {
      place: place
    });
  };


});
