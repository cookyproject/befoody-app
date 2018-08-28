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
