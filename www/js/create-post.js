app.controller('CreatePostCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, $firebaseObject, $firebaseAuth, me, Guid, $ionicModal, mediaService, $ionicLoading) {


  $scope.me = me;
  $scope.content = '';
  $scope.items = [{
    name: ''
  }];
  $scope.place = null;
  $scope.placePickerModal = null;
  $scope.photoUrl = null;


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


  $scope.openGooglePlaceAutoPicker = function () {
    $scope.placePickerModal.show();
  };
  $scope.closeGooglePlaceAutoPicker = function () {
    $scope.placePickerModal.hide();
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
      template: '上傳中...'
    });
    mediaService.postCameraImage(camOptions).then(function (result) {
      console.log(result);
      $scope.photoUrl = result.downloadURL;

    }, function (err)  {
      console.error(err);
    }).finally(function () {
      $ionicLoading.hide();
    });


  };
  $scope.addMediaDetailFromPicker = function () {

    var options = {
      maximumImagesCount: 10,
      width: 0,
      height: 0,
      quality: 50
    };
    $ionicLoading.show({
      template: '上傳中...'
    });
    $apiMedia.postPickedImages(options).then(function (result) {
      console.log(result);
      for (var i = 0; i < result.length; i++) {
        $scope.post.postDetailList.push({
          media: result[i]
        });

      }
      $ionicScrollDelegate.scrollBottom();

    }, function (err) {
      $ionicPopup.alert({
        title: '無法上傳',
        template: '上傳的照片容量過大'
      });
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

    if (!$scope.photoUrl) {
      $ionicPopup.alert({
        title: '資料錯誤',
        template: '尚未上傳照片'

      });
      return;
    }

    var post = {
      authorUid: me.auth.uid,
      placeName: $scope.place.name,
      photoUrl: $scope.photoUrl,
      placeId: $scope.place.place_id,
      content: $scope.content,
      items: $scope.items.slice(0,$scope.items.length-1).reduce(function (acc, item, idx) {
         acc[idx] = item
         return acc;
      }, {}),
      createdTime: firebase.database.ServerValue.TIMESTAMP,
    };
    console.log(JSON.stringify(post));

    firebase.database().ref('posts/' + Guid.newGuid()).set(post).then(function (result) {
      alert('success');
      $state.go('main-tabs.post-list');
    }, function (err) {
      console.error(err);
    });
  }


  $scope.$on('$destroy', function () {
    $scope.placePickerModal.remove();
  });
  $scope.$on('modal.hidden', function (event, modal) {
    if (modal === $scope.placePickerModal) {

    }
  });
  $scope.$on('googlePlaceAutoComplete.placeChanged', function (event, place) {
    $scope.placePickerModal.hide();
    $scope.place = place;
  });

  $scope.init = function () {


    $ionicModal.fromTemplateUrl('template/place-auto-complete-picker.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.placePickerModal = modal;
    });
  };
  $scope.init();

});
