app.controller('RecoCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, $ionicLoading, mediaService, me) {

  $scope.coupons = [];
  $scope.gotoAutoRecoList = function () {
    $state.go('auto-reco-list');
  };
  $scope.gotoCouponCapture = function () {
    $scope.addMediaFromCamera();
  }
  $scope.addMediaFromCamera = function () {
    var camOptions = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    $ionicLoading.show({
      template: '請稍候...'
    });
    mediaService.postCameraImage(camOptions).then(function (result) {
      console.log(result);
      me.auth.getIdToken().then(function (idToken) {
        console.log('user IdToken', idToken);
        var body = {
          imgUri: mediaService.getUrl(result.metadata.fullPath)
        };
        $http.post('https://us-central1-befoody-4e0a3.cloudfunctions.net/app/get-coupon', body, {
          headers: {
            "Authorization": "Bearer " + idToken
          }
        }).then(function (result) {

         
          var coupon = result.data;
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: '獲得兌換券',
            template: coupon.title
          });
          $scope.coupons.unshift(coupon);




        }, function (err) {
          console.error(err);
          if (err.data && err.data.name) {
            $ionicPopup.alert({
              title: '目前沒有' + err.data.name + '的優惠',
              template: ''
            });
          } else {
            $ionicPopup.alert({
              title: '沒有找到符合的店家',
              template: ''
            });
          }

          $ionicLoading.hide();
        });
      }, function (err) {
        console.error(err);
        $ionicLoading.hide();
      });





    }, function (err) {
      console.error(err);
      $ionicLoading.hide();
    }).finally(function () {

    });


  };
  $scope.loadCoupons = function () {
    $scope.coupons = [];

    firebase.database().ref('users/' + me.auth.uid + '/coupons').once('value').then(function (allCouponSnaps) {

      allCouponSnaps.forEach(function (snap) {
        $scope.coupons.push(snap.val());
      });
      console.log($scope.coupons);
      $scope.$broadcast('scroll.refreshComplete');
    });
  };
  $scope.init = function () {

    $scope.loadCoupons();

  };
  $scope.init();
});
