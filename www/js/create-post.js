app.controller('CreatePostCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, $firebaseObject, $firebaseAuth, me, Guid, $ionicModal, mediaService, $ionicLoading, $cordovaActionSheet) {


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
      $scope.photoUrl = result.downloadURL;

    }, function (err) {
      console.error(err);
    }).finally(function () {
      $ionicLoading.hide();
    });


  };
  $scope.addMediaDetailFromPicker = function () {

    var options = {
      maximumImagesCount: 1,
      width: 0,
      height: 0,
      quality: 50
    };
    $ionicLoading.show({
      template: '請稍候...'
    });
    mediaService.postPickedImages(options).then(function (result) {
      console.log(result);
      $scope.photoUrl = result[0].downloadURL;
      

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
      items: $scope.items.slice(0, $scope.items.length - 1).reduce(function (acc, item, idx) {
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


  
  $scope.$on('googlePlaceAutoComplete.placeChanged', function (event, place) {
    
    $scope.place = place;
    $scope.isEditingPlace = false;
  });

  $scope.init = function () {

  };
  $scope.init();

});
