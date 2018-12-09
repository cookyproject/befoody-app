app.controller('PostListCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, $ionicModal, me) {

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

  // 重新整理貼文列表
  $scope.reloadPosts = function () {
    $scope.posts = [];
    $scope.post = null;
    $scope.loadedPostKeys = {};
    $scope.hasMorePosts = false;

    // 從DB查詢用戶已經追蹤的會員
    firebase.database().ref('users/' + me.auth.uid + '/following').once('value').then(function (allFollowingSnap) {

      // 把所有追蹤會員的userID 放進 followingKeys 陣列
      // (自己也算追蹤自己，如此才看得到自己的貼文出現在列表)
      var followingKeys = [me.auth.uid];
      allFollowingSnap.forEach(function (followingSanp) {
        followingKeys.push(followingSanp.key);
      });

      // 根據 followingKeys 陣列當中追蹤的UserID,
      // 到資料庫查詢他們的貼文
      var promises = followingKeys.map(function (followingKey) {
        return firebase.database().ref("posts").orderByChild('authorUid').equalTo(followingKey).once("value");
      });
      Promise.all(promises).then(function (friendPostSnapshots) {
        var added = [];
        var idx = 0;
        friendPostSnapshots.forEach(function (friendPostSnap) {

          if (!friendPostSnap.exists()) {
            // 若被追蹤者沒有貼文，
            // 則直接結束
            return;
          }

          // 走訪查詢貼文結果
          friendPostSnap.forEach(function (postSnap) {
            var post = postSnap.val();
            post.id = postSnap.key;
            $scope.loadedPostKeys[postSnap.key] = true;
            $scope.lastLoadedPostCreatedTime = post.createdTime;
            $scope.lastLoadedPostKey = postSnap.key;

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
            firebase.database().ref('likes/' + postSnap.key).once('value').then(function (allLikesSnap) {
              var count = 0;
              allLikesSnap.forEach(function (likeSnap) {
                count++;
              });
              post.likesCount = count;
            });

            console.log('init ', postSnap.key, post);
            added.push(post);
            // 進一步載入貼文作者得更詳細個資
            firebase.database().ref('users/' + post.authorUid).once('value').then(function (authorSnap) {
              post.author = authorSnap.val();

            });
            if (idx == 0) {
              $scope.lastLoadedPostCreatedTime = post.createdTime;
              $scope.lastLoadedPostKey = postSnap.key;
            }
            idx++;
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
    });
  };

  $scope.searchUser = function () {
    // 當用戶按下右上角搜尋好友按鈕
    // 前往添加追蹤列表
    $state.go('search-user');
  };

  // 處理使用者按下餐庭搜尋結果事件
  $scope.clickPlace = function (placeId) {
    // 前往該餐廳的貼文列表
    $state.go('main-tabs.place-post-list', {
      placeId: placeId
    });
  };

  $scope.like = function (post) {


    firebase.database().ref('likes/' + post.id + '/' + me.auth.uid).once('value').then(function (likeSnap) {
      $scope.$apply(function () {
        if (likeSnap.exists()) {
          post.likesCount -= 1;
          if(post.likesCount<0){
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

  // 初始化文章列表畫面
  $scope.init = function () {
    // 初始化照片瀏覽彈出視窗
    $ionicModal.fromTemplateUrl('template/photo-slide-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.photoSlideModal = modal;
      $scope.reloadPosts();
    });

    // 從DB查詢用戶已經追蹤的會員
    firebase.database().ref('users/' + me.auth.uid + '/following').once('value').then(function (allFollowingSnap) {

      // 把所有追蹤會員的userID 放進 followingKeys 陣列
      var followingKeys = [];
      allFollowingSnap.forEach(function (followingSanp) {
        followingKeys.push(followingSanp.key);
      });

      // 若發現用戶尚未追蹤過任何人，則自動前往添加追蹤之畫面
      if (followingKeys.length == 0) {
        console.log('no following');
        $scope.searchUser();
      }
    });
  };
  $scope.init();

});
