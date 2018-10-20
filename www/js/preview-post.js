app.controller('PreviewPostCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, me, Guid, $ionicModal, mediaService, $ionicLoading, $cordovaActionSheet, $stateParams) {
  $scope.me = me;
  $scope.post = window.previewingPost;
  $scope.photoSlideOptions = {
    loop: false,
    effect: 'slide',
    speed: 500,
  }

  // 處理按下正式送出事件
  $scope.submit = function () {

    var post = {
      authorUid: me.auth.uid,
      placeName: $scope.post.placeName,
      photos: $scope.post.photos.reduce(function (acc, photo, idx) {
        acc[idx] = photo
        return acc;
      }, {}),
      placeId: $scope.post.placeId,
      items: $scope.post.items.reduce(function (acc, item, idx) {
        acc[idx] = item
        return acc;
      }, {}),
      createdTime: firebase.database.ServerValue.TIMESTAMP,
    };
    console.log(JSON.stringify(post));

    // 將貼文寫入 DB posts 節點下
    firebase.database().ref('posts').push(post).then(function (result) {

      // 寫入完成
      // 返回貼文列表
      $ionicHistory.backView().stateParams.submitted = true;
      $ionicHistory.goBack();
      // $state.go('main-tabs.post-list');
    }, function (err) {
      console.error(err);
    });
  }

  // 處理貼文照片被按下後的事件
  $scope.openPhotoSlideModal = function (idx) {
    $scope.photoSlideModal.show();
    data.photoSlideModalSlider.slideTo(idx);
  }

  // 關閉貼文照片瀏覽視窗
  $scope.closePhotoSlideModal = function () {
    $scope.photoSlideModal.hide();
  }

  // 處理按下返回編輯按鈕事件
  $scope.goBackward = function () {
    $ionicHistory.goBack();
  };

  $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
    // data.slider is the instance of Swiper
    $scope.slider = data.slider;
    $scope.modalSlider = data.photoSlideModalSlider;

  });
  $scope.$on("$ionicView.enter", function (scopes, states) {
    if (states.stateName == "main-tabs.preview-post") {
      $scope.post = window.previewingPost;
    }
  });
  $scope.init = function () {
    $ionicModal.fromTemplateUrl('template/photo-slide-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.photoSlideModal = modal;
    });

  };
  $scope.init();

});
