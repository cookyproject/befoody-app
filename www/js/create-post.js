app.controller('CreatePostCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, $firebaseObject, $firebaseAuth, me, Guid, $ionicModal, mediaService, $ionicLoading, $cordovaActionSheet) {


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

  $scope.disableTap = function () {
    var container = document.getElementsByClassName('pac-container');
    angular.element(container).attr('data-tap-disabled', 'true');
    var backdrop = document.getElementsByClassName('backdrop');
    angular.element(backdrop).attr('data-tap-disabled', 'true');
    angular.element(container).on("click", function () {
      document.getElementById('pac-input').blur();
    });

  };

  $scope.onItemChanged = function (index) {
    if ($scope.items[index].name.length == 0 && index < $scope.items.length) {
      $scope.deleteItem(index);
    } else if (index == $scope.items.length - 1) {
      $scope.items.push({
        name: ''
      });
    }

  };
  $scope.canDeleteItem = function (index) {
    return index < $scope.items.length - 1 && $scope.items[index].name.length > 0;
  };
  $scope.deleteItem = function (index) {
    $scope.items.splice(index, 1);
  };



  $scope.editPlace = function () {
    $scope.placeKeyword = $scope.place ? $scope.place.name : '';
    $scope.isEditingPlace = true;
  }

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
        url: result.downloadURL,
        description: ''
      });


    }, function (err) {
      console.error(err);
    }).finally(function () {
      $ionicLoading.hide();
    });


  };

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
          url: r.downloadURL,
          description: ''
        });
      });


      console.log($scope.photoSlides);

    }, function (err) {

      console.error(err);

    }).finally(function () {
      $ionicLoading.hide();
    });


  };

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
    
    $state.go('main-tabs.preview-post', {
      post: post
    });
    
  }

  $scope.openPhotoSlideModal = function (idx) {
    $scope.photoSlideModal.show();
    
    $scope.modalSlider.slideTo(idx);
  }
  $scope.closePhotoSlideModal = function() {
    $scope.photoSlideModal.hide();
  }

  $scope.deleteCurrentPhoto = function() {
    var currIdx = $scope.modalSlider.activeIndex;
    $scope.photoSlides.splice(currIdx,1);
    $scope.photoSlideModal.hide();

 }


  $scope.$on('googlePlaceAutoComplete.placeChanged', function (event, place) {

    $scope.place = place;
    $scope.isEditingPlace = false;
  });

  $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
    // data.slider is the instance of Swiper
    if($(data.slider.wrapper).parent().parent().hasClass('modalSlider')){
      $scope.modalSlider = data.slider;
    }
    else{
      $scope.slider = data.slider;
    }
    
    
    
  });

  $scope.init = function () {
    $ionicModal.fromTemplateUrl('template/edit-photo-slide-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.photoSlideModal = modal;
      
    });

  };
  $scope.init();

});
