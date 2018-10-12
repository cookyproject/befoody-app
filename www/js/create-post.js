app.controller('CreatePostCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, me, Guid, $ionicModal, mediaService, $ionicLoading, $cordovaActionSheet, $stateParams) {
  $scope.photoSlideModal = null;
  $scope.me = me;
  $scope.isEditingPlace = false;
  $scope.content = '';
  $scope.items = [{
    name: ''
  }];
  $scope.placeKeyword = null;
  $scope.place = null;
  $scope.placePickerModal = null;
  $scope.photoUrl = null;

  $scope.photoSlideOptions = {
    loop: false,
    effect: 'slide',
    speed: 500,
  }

  $scope.photoSlides = [{
    url: null,
    description: null
  }]

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

  // 處理品名輸入變化事件
  $scope.onItemChanged = function (index) {
    if ($scope.items[index].name.length == 0 && index < $scope.items.length) {
      // 當發現最後一項文字被刪光時，
      // 主動刪除最後一列
      $scope.deleteItem(index);
    } else if (index == $scope.items.length - 1) {
      // 當發現使用者對最後一項輸入文字時，
      // 自動添加下一列空白項
      $scope.items.push({
        name: ''
      });
    }

  };

  // 控制項目第 index 項是否要顯示 "X" 圖示以供刪除
  $scope.canDeleteItem = function (index) {
    // 不是最後一項的都可以刪除
    return index < $scope.items.length - 1 && $scope.items[index].name.length > 0;
  };

  // 處理第 index 項刪除項目的事件
  $scope.deleteItem = function (index) {
    $scope.items.splice(index, 1);
  };


  // 開始輸入位置
  $scope.editPlace = function () {
    $scope.placeKeyword = '';
    $scope.place = null;
    $scope.isEditingPlace = true;
  }

  // 按下添加相片按鈕事件
  $scope.addMedia = function () {
    var options = {
      title: '新增相片',
      buttonLabels: ['透過相機拍照', '選取相片'],
      addCancelButtonWithLabel: '取消',
      androidEnableCancelButton: true
    };
    $cordovaActionSheet.show(options).then(function (btnIndex) {
      if (btnIndex == 1) {
        $scope.addMediaFromCamera();
      } else if (btnIndex == 2) {
        $scope.addMediaDetailFromPicker();
      }
    });
  };

  // 從相機拍照以添加相片
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


      $scope.photoSlides.splice($scope.photoSlides.length - 1, 0, {
        url: mediaService.getUrl(result.metadata.fullPath),
        description: ''
      });


    }, function (err) {
      console.error(err);
    }).finally(function () {
      $ionicLoading.hide();
    });


  };

  // 從相簿選擇以添加相片
  $scope.addMediaDetailFromPicker = function () {

    var options = {
      maximumImagesCount: 20,
      width: 0,
      height: 0,
      quality: 50
    };
    $ionicLoading.show({
      template: '請稍候...'
    });
    mediaService.postPickedImages(options).then(function (result) {
      console.log(result);

      result.forEach(function (r) {

        $scope.photoSlides.splice($scope.photoSlides.length - 1, 0, {
          url: mediaService.getUrl(r.metadata.fullPath),
          description: ''
        });
      });
    }, function (err) {
      console.error(err);
    }).finally(function () {
      $ionicLoading.hide();
    });
  };

  // 按下送出按鈕事件
  $scope.submit = function () {
    if (!$scope.place) {
      $ionicPopup.alert({
        title: '資料錯誤',
        template: '尚未選擇餐廳位置'
      });
      return;
    }
    if ($scope.photoSlides.length <= 1) {
      $ionicPopup.alert({
        title: '資料錯誤',
        template: '尚未上傳任何照片'
      });
      return;
    }
    var post = {
      authorUid: me.auth.uid,
      placeName: $scope.place.name,
      photos: $scope.photoSlides.slice(0, $scope.photoSlides.length - 1),
      placeId: $scope.place.place_id,
      content: $scope.content,
      items: $scope.items.slice(0, $scope.items.length - 1),
      createdTime: firebase.database.ServerValue.TIMESTAMP,
    };
    console.log(JSON.stringify(post));

    // 前往預覽貼文畫面
    $state.go('main-tabs.preview-post', {
      post: post
    });

  }

  // 處理貼文照片被按下後的事件
  $scope.openPhotoSlideModal = function (idx) {
    // 彈出照片瀏覽視窗
    $scope.photoSlideModal.show();
    $scope.modalSlider.slideTo(idx);
  }

  // 關閉照片瀏覽視窗
  $scope.closePhotoSlideModal = function () {
    $scope.photoSlideModal.hide();
  }

  // 處理刪除照片按鈕按下事件
  $scope.deleteCurrentPhoto = function () {
    var currIdx = $scope.modalSlider.activeIndex;
    $scope.photoSlides.splice(currIdx, 1);
    $scope.photoSlideModal.hide();
  }

  // 處理使用者選擇地點後的事件
  $scope.$on('googlePlaceAutoComplete.placeChanged', function (event, place) {

    console.log(place);
    if (place.types.indexOf('cafe') != -1) {
      $scope.place = place;
    } else {
      $scope.place = null;
      $ionicPopup.alert({
        title: '此位置不是咖啡廳',
        template: '請選擇咖啡廳作為發文位置'

      });
    }
    $scope.isEditingPlace = false;
  });

  $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
    // data.slider is the instance of Swiper
    if ($(data.slider.wrapper).parent().parent().hasClass('modalSlider')) {
      $scope.modalSlider = data.slider;
    } else {
      $scope.slider = data.slider;
    }



  });

  // 初始化新增貼文畫面
  $scope.init = function () {
    if ($stateParams.submitted) {
      $scope.items = [{
        name: ''
      }];
      $scope.photoSlides = [{
        url: null,
        description: null
      }];
      $scope.placeKeyword = null;
      $scope.place = null;

      $state.go('main-tabs.post-list');

    }
    $ionicModal.fromTemplateUrl('template/edit-photo-slide-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.photoSlideModal = modal;

    });
  };
  $scope.init();

});
