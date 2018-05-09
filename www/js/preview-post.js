app.controller('PreviewPostCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, $firebaseObject, $firebaseAuth, me, Guid, $ionicModal, mediaService, $ionicLoading, $cordovaActionSheet,$stateParams) {


   
    $scope.me = me;
    $scope.post = $stateParams.post;
    
  
    $scope.photoSlideOptions = {
      loop: false,
      effect: 'slide',
      speed: 500,
    }
    
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
  
      firebase.database().ref('posts/' + Guid.newGuid()).set(post).then(function (result) {
       
        $state.go('main-tabs.post-list');
      }, function (err) {
        console.error(err);
      });
    }
  
    $scope.openPhotoSlideModal = function (idx) {
      $scope.photoSlideModal.show();
      data.photoSlideModalSlider.slideTo(idx);
    }
    $scope.closePhotoSlideModal = function() {
      $scope.photoSlideModal.hide();
    }
  
    $scope.goBackward = function() {
        $ionicHistory.goBack();
    };
  
  
    
  
    $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
      // data.slider is the instance of Swiper
      $scope.slider = data.slider;
      $scope.modalSlider = data.photoSlideModalSlider;
      
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
  