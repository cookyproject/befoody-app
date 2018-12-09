app.controller('PlaceListCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory) {
  var virtualMap = document.createElement('div');
  $scope.placeService = new google.maps.places.PlacesService(virtualMap);
  $scope.placeKeyword = '';
  $scope.findPlace = firebase.functions().httpsCallable('findPlace');
  $scope.places = [];

  // 根據網路上資料
  // 加入以下可避免 Google Place 自動完成
  // 在 Ionic 當中發生觸控異常的問題
  $scope.disableTap = function () {
    var container = document.getElementsByClassName('pac-container');
    angular.element(container).attr('data-tap-disabled', 'true');
    var backdrop = document.getElementsByClassName('backdrop');
    angular.element(backdrop).attr('data-tap-disabled', 'true');
    angular.element(container).on("click", function () {
      document.getElementById('pac-input').blur();
    });
  };

  // 處理使用者選擇地點後的事件
  $scope.$on('googlePlaceAutoComplete.placeChanged', function (event, place) {

    console.log(place);

    if (place.types.indexOf('cafe') != -1) {

      // 確認此地點被Google 判定為咖啡廳
      $scope.places = [place];
      $scope.places.forEach(function (place) {
        // 從資料庫查詢此咖啡廳的相關䩞文
        // 以及照片
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

      // 地點不屬於開發廳
      $scope.places = [];
      $ionicPopup.alert({
        title: '此位置不是咖啡廳',
        template: '請選擇咖啡廳作為搜尋條件'

      });
      $scope.clearKeyword();
    }

  });

  // 清空搜尋輸入方塊
  $scope.clearKeyword = function () {
    $scope.placeKeyword = '';
  }

  // 處理使用者按下餐庭搜尋結果事件
  $scope.clickPlace = function (place) {
    // 前往該餐廳的貼文列表
    $state.go('place-post-list', {
      place: place
    },{
      reload: true
    });
  };
});
