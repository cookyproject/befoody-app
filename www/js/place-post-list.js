app.controller('PlacePostListCtrl', function ($scope, $rootScope, $state, $stateParams, $http, $ionicPopup, $ionicHistory, $ionicModal, me) {

  $scope.place = null;
  $scope.posts = [];
  $scope.lastLoadedPostKey = null;
  $scope.lastLoadedPostCreatedTime = null;
  $scope.post = null;
  $scope.lastLoadedSlice = null;
  $scope.hasMorePosts = false;
  $scope.photoSlideOptions = {
    loop: false,
    effect: 'slide',
    speed: 500,
  }
  $scope.loadedPostKeys = {};


  $scope.goBackward = function () {
    $ionicHistory.goBack();
    // $state.go('main-tabs.place-tabs.place-list');
  };

  // 處理貼文照片被按下後的事件
  $scope.openPhotoSlideModal = function (post) {
    $scope.post = post;
    // 彈出照片瀏覽視窗
    $scope.photoSlideModal.show();
    $scope.modalSlider.slideTo(0);
  }

  // 關閉照片瀏覽視窗
  $scope.closePhotoSlideModal = function () {
    $scope.photoSlideModal.hide();
  }

  $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
    // data.slider is the instance of Swiper
    if ($(data.slider.wrapper).parent().parent().hasClass('modalSlider')) {
      $scope.modalSlider = data.slider;
    }
  });

  // 重新整理個別餐廳貼文列表
  $scope.reloadPosts = function (place) {
    $scope.posts = [];
    $scope.post = null;
    $scope.loadedPostKeys = {};
    $scope.hasMorePosts = false;
    var placeId = $scope.place.place_id;

    // 從DB查詢跟此餐廳有關的貼文
    firebase.database().ref("posts").orderByChild('placeId').equalTo(placeId).once("value").then(function (placePostSnapshots) {
      var added = [];
      // 走訪查詢貼文結果
      placePostSnapshots.forEach(function (placePostSnap) {

        if (!placePostSnap.exists()) {
          // 若餐廳沒有貼文，
          // 則直接結束
          return;
        }
        var post = placePostSnap.val();
        post.id = placePostSnap.key;

        // 換算張貼時間為相對時間(例如: 1 hrs)
        var duration = moment.duration(moment().diff(moment(post.createdTime)));
        if (duration.asDays() > 1) {
          post.createdSince = Math.round(duration.asDays()) + ' days';
        } else if (duration.asHours() > 1) {
          post.createdSince = Math.round(duration.asHours()) + ' hrs';
        } else if (duration.asMinutes() > 1) {
          post.createdSince = Math.round(duration.asMinutes()) + ' mins';
        } else {
          post.createdSince = 'just now';
        }

        // 計算 likes 
        firebase.database().ref('likes/' + placePostSnap.key).once('value').then(function (allLikesSnap) {
          var count = 0;
          allLikesSnap.forEach(function (likeSnap) {
            count++;
          });
          post.likesCount = count;
        });

        // 計算 feedbacks
        firebase.database().ref('feedbacks/' + placePostSnap.key).once('value').then(function (allFeedbacksSnap) {
          var count = 0;
          allFeedbacksSnap.forEach(function (feedbackSanp) {
            count++;
          });
          post.feedbacksCount = count;
        });

        added.push(post);

        // 進一步載入貼文作者得更詳細個資
        firebase.database().ref('users/' + post.authorUid).once('value').then(function (authorSnap) {
          post.author = authorSnap.val();

        });


      });
      added.reverse();

      // 將所有載入的文章放進 $scop.post 陣列內
      // 才能呈現在畫面上
      added.forEach(function (post) {
        $scope.posts.push(post);
      });

      // 使重新整理動畫消失
      $scope.$broadcast('scroll.refreshComplete');
      $scope.hasMorePosts = true;
    });

  };

  $scope.like = function (post) {


    firebase.database().ref('likes/' + post.id + '/' + me.auth.uid).once('value').then(function (likeSnap) {
      $scope.$apply(function () {
        if (likeSnap.exists()) {
          post.likesCount -= 1;
          if (post.likesCount < 0) {
            post.likesCount = 0;
          }
          likeSnap.ref.remove();
        } else {
          var obj = {
            placeholder: true
          }
          post.likesCount += 1;
          firebase.database().ref('likes/' + post.id + '/' + me.auth.uid).set(obj).then(function (result) {
            console.log(result);
          }, function (err) {
            console.error(err);
          });
        }
      });

    });

  };

  $scope.gotoFeedback = function (post) {
    $state.go('post', {
      postId: post.id
    });
  };
  $scope.$on("$ionicView.enter", function (scopes, states) {
    if (states.stateName == "place-post-list") {
      // 每次進到本畫面，都強制重新整理貼文列表
      if ($stateParams.place) {
        $scope.place = $stateParams.place;
        console.log($scope.place);
        $scope.reloadPosts();
      }
      else {
        var service = new google.maps.places.PlacesService(document.createElement('div'));
        var placeId = $stateParams.placeId;
        var request = {
          placeId: placeId,
          fields: ['address_component', 'adr_address', 'alt_id','formatted_address', 'geometry', 'icon', 'id', 'name', 'permanently_closed', 'photo', 'place_id', 'plus_code', 'scope', 'type', 'url', 'utc_offset', 'vicinity','formatted_phone_number','opening_hours']
        };
        service.getDetails(request, function(place, status){
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            $scope.place = place;
            $scope.reloadPosts();
          }
          
        });
        
        
      }

    }
  });

  // 初始化文章列表畫面
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
