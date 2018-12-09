app.controller('PlaceMapCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, $ionicScrollDelegate) {

  $scope.map = null;
  $scope.placeService = null;
  $scope.currLoc = {
    lat: 25.0444082,
    lng: 121.522801
  };
  $scope.places = [];
  $scope.markers = [];
  $scope.scrollView = null;
  $scope.goBackward = function () {
    $ionicHistory.goBack();
  };

  $scope.reloadNearbyPlaces = function () {

    var request = {

      type: ['restaurant']
    };
    request.bounds = $scope.map.getBounds();
    if (!request.bounds) {
      request.location = new google.maps.LatLng($scope.currLoc.lat, $scope.currLoc.lng);
      request.radius = 500;
    }
    $scope.placeService.nearbySearch(request, function (result, status) {
      $scope.$apply(function () {
        console.log(status);
        console.log('nearby place', result);
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          $scope.markers.forEach(function (oldMarker) {
            oldMarker.setMap(null);
          });
          $scope.markers = [];
          $scope.places = result;
          $scope.places.forEach(function (place) {
            var marker = new google.maps.Marker({
              position: place.geometry.location,
              title: place.name
            });
            var infowindow = new google.maps.InfoWindow({
              content: '<a href="#/place-post-list/'+place.place_id+'">前往文章頁面</a>'
            });
            marker.addListener('click', function() {
               infowindow.open($scope.map, marker);
            });

            place.marker = marker;
            place.infowindow = infowindow;
            $scope.markers.push(marker);
            marker.setMap($scope.map);
          });

          $ionicScrollDelegate.$getByHandle('placeScroll').scrollTop()
        }
      });

    });
  }
  
  $scope.placeRelease = function(){
    console.log('scroll complete', $scope.scrollView);
    // var placeItems = $($scope.scrollView.el).find('.item');
    // if(placeItems.length ==0 ){
    //   return;
    // }
    // var selectedItem = placeItems[0];
    // var minOffset = $(selectedItem).offset().left;
    // var minOffsetAbs = Math.abs(minOffset);
    // for(i =1;i<placeItems.length;i++){
    //   var item = placeItems[i];
    //   var offset = $(item).offset().left;
    //   var absOffset = Math.abs(offset);
      
    //   if(absOffset < minOffsetAbs){
    //     selectedItem = item;
    //     minOffset = offset;
    //     minOffsetAbs = absOffset;
    //   }
    // }
    // console.log('offset',minOffset);
    // $ionicScrollDelegate.$getByHandle('placeScroll').scrollBy(minOffset,0,true);
  }
  $scope.panTo = function(place){
      $scope.map.panTo(place.geometry.location);
      $scope.map.setZoom(18);
      place.infowindow.open($scope.map, place.marker);
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
    if (!$scope.placeService) {
      $scope.placeService = new google.maps.places.PlacesService($scope.map);
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
      $scope.reloadNearbyPlaces();

    }, function (err) {
      console.error(err);
      $scope.reloadNearbyPlaces();
    }, {
      timeout: 30000,
      maximumAge: 0,
      enableHighAccuracy: true
    });


    $scope.scrollView = $ionicScrollDelegate.$getByHandle('placeScroll').getScrollView();
    console.log($scope.scrollView);
  });
  $scope.init = function () {

  };
  $scope.init();
});
