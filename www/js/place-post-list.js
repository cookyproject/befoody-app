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
  };
  $scope.openPhotoSlideModal = function (idx) {
    $scope.post = $scope.posts[idx];
    $scope.photoSlideModal.show();

    $scope.modalSlider.slideTo(0);
  }
  $scope.closePhotoSlideModal = function () {
    $scope.photoSlideModal.hide();
  }

  $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
    // data.slider is the instance of Swiper
    if ($(data.slider.wrapper).parent().parent().hasClass('modalSlider')) {
      $scope.modalSlider = data.slider;
    }



  });

  $scope.reloadPosts = function () {
    $scope.posts = [];
    $scope.post = null;
    $scope.loadedPostKeys = {};
    $scope.hasMorePosts = false;
    var placeId = $stateParams.place.place_id;
    firebase.database().ref("posts").orderByChild('placeId').equalTo(placeId).once("value").then(function (placePostSnapshots) {
      var added = [];
      placePostSnapshots.forEach(function (placePostSnap) {

        if (!placePostSnap.exists()) {
          return;
        }
        var post = placePostSnap.val();
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
        
        added.push(post);
        firebase.database().ref('users/' + post.authorUid).once('value').then(function (authorSnap) {
          post.author = authorSnap.val();

        });
       

      });
      added.reverse();
      added.forEach(function (post) {
        $scope.posts.push(post);
      });

      $scope.$broadcast('scroll.refreshComplete');
      $scope.hasMorePosts = true;





    });

    // firebase.database().ref('posts').orderByChild('createdTime').limitToLast(5).once('value').then(function (snapshot) {
    //   var added = [];
    //   var idx = 0;
    //   snapshot.forEach(function (postSnap) {


    //     var post = postSnap.val();
    //     $scope.loadedPostKeys[postSnap.key] = true;
    //     $scope.lastLoadedPostCreatedTime = post.createdTime;
    //     $scope.lastLoadedPostKey = postSnap.key;
    //     var duration = moment.duration(moment().diff(moment(post.createdTime)));
    //     if (duration.asDays() > 0) {
    //       post.createdSince = Math.round(duration.asDays()) + ' days';
    //     } else if (duration.asHours() > 0) {
    //       post.createdSince = Math.round(duration.asHours()) + ' hrs';
    //     } else if (duration.asMinutes() > 0) {
    //       post.createdSince = Math.round(duration.asMinutes()) + ' mins';
    //     } else {
    //       post.createdSince = 'just now';
    //     }
    //     console.log('init ', postSnap.key, post);
    //     added.push(post);
    //     firebase.database().ref('users/' + post.authorUid).once('value').then(function (authorSnap) {
    //       post.author = authorSnap.val();

    //     });
    //     if (idx == 0) {
    //       $scope.lastLoadedPostCreatedTime = post.createdTime;
    //       $scope.lastLoadedPostKey = postSnap.key;
    //     }
    //     idx++;

    //   });

    //   added.reverse();
    //   added.forEach(function (post) {
    //     $scope.posts.push(post);
    //   });

    //   $scope.$broadcast('scroll.refreshComplete');
    //   $scope.hasMorePosts = true;

    // });

  };


  $scope.loadNextPage = function () {

    // if (!$scope.lastLoadedPostCreatedTime) {
    //   $scope.$broadcast('scroll.infiniteScrollComplete');
    //   return;
    // }

    // firebase.database().ref('posts').orderByChild('createdTime').endAt($scope.lastLoadedPostCreatedTime).limitToLast(6).once('value').then(function (snapshot) {

    //   var idx = 0;
    //   var added = [];
    //   snapshot.forEach(function (postSnap) {
    //     if ($scope.loadedPostKeys[postSnap.key]) {
    //       return;
    //     }
    //     $scope.loadedPostKeys[postSnap.key] = true;
    //     var post = postSnap.val();

    //     console.log(postSnap.key, post);
    //     var duration = moment.duration(moment().diff(moment(post.createdTime)));
    //     if (duration.asDays() > 0) {
    //       post.createdSince = Math.round(duration.asDays()) + ' days';
    //     } else if (duration.asHours() > 0) {
    //       post.createdSince = Math.round(duration.asHours()) + ' hrs';
    //     } else if (duration.asMinutes() > 0) {
    //       post.createdSince = Math.round(duration.asMinutes()) + ' mins';
    //     } else {
    //       post.createdSince = 'just now';
    //     }
    //     added.push(post);

    //     firebase.database().ref('users/' + post.authorUid).once('value').then(function (authorSnap) {
    //       post.author = authorSnap.val();

    //     });

    //     if (idx == 0) {
    //       $scope.lastLoadedPostCreatedTime = post.createdTime;
    //       $scope.lastLoadedPostKey = postSnap.key;
    //     }
    //     idx++;

    //   });
    //   added.reverse();
    //   added.forEach(function (post) {
    //     $scope.posts.push(post);
    //   });
    //   if (added.length == 0) {
    //     $scope.hasMorePosts = false;
    //   }
    //   $scope.$broadcast('scroll.infiniteScrollComplete');

    // });


  };

  $scope.$on("$ionicView.enter", function (scopes, states) {
    if (states.stateName == "main-tabs.place-post-list") {
      $scope.place = $stateParams.place;
      $scope.reloadPosts();
    }
  });

  $scope.init = function () {
    $ionicModal.fromTemplateUrl('template/photo-slide-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.photoSlideModal = modal;
      $scope.reloadPosts();
    });


  };
  $scope.init();

});
