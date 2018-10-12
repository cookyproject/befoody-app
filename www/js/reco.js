app.controller('RecoCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, $ionicLoading, mediaService, me) {

  $scope.coupons = [];
  $scope.gotoAutoRecoList = function () {
    $state.go('auto-reco-list');
  };
  // 處理按下相機按鈕事件
  $scope.gotoCouponCapture = function () {
    $scope.addMediaFromCamera();
  }
  // 擷取相機拍照結果
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

      // 拍照完成並且上傳完成，
      // 擷取用戶 IdToken 以便稍後呼叫 get-coupon API 時做身份驗證
      console.log(result);
      me.auth.getIdToken().then(function (idToken) {
        // 成功獲取 idToken
        console.log('user IdToken', idToken);
        var body = {
          imgUri: mediaService.getUrl(result.metadata.fullPath)
        };

        // 將照片連結連同 idToken 發送至 get-coupon API
        $http.post('https://us-central1-befoody-4e0a3.cloudfunctions.net/app/get-coupon', body, {
          headers: {
            "Authorization": "Bearer " + idToken
          }
        }).then(function (result) {
         
          // get-coupon 後端成功辨識logo 並且獲得兌換券
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
            // 成功辨識logo 但是不在優惠名單內
            $ionicPopup.alert({
              title: '目前沒有' + err.data.name + '的優惠',
              template: ''
            });
          } else {
            // 無法辨識logo
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

  // 重新整理已獲得兌換券列表
  $scope.loadCoupons = function () {
    $scope.coupons = [];

    // 查詢 DB 目前用戶已經獲得的兌換券
    firebase.database().ref('users/' + me.auth.uid + '/coupons').once('value').then(function (allCouponSnaps) {

      // 走訪結果，並將已經有的兌換券內容放進 $scope.coupons 陣列當中
      // 讓畫面能夠呈現
      allCouponSnaps.forEach(function (snap) {
        $scope.coupons.push(snap.val());
      });
      console.log($scope.coupons);

      // 使重新整理動畫消失
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  // 初始化兌換券列表畫面
  $scope.init = function () {

    $scope.loadCoupons();

  };
  $scope.init();
});
