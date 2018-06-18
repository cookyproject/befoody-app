app.controller('PostListCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, $firebaseAuth, $ionicModal, me) {

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

    firebase.database().ref('users/' + me.auth.uid + '/following').once('value').then(function (allFollowingSnap) {
      var followingKeys = [me.auth.uid];
      allFollowingSnap.forEach(function (followingSanp) {
        followingKeys.push(followingSanp.key);
      });
      console.log(followingKeys);

      var promises = followingKeys.map(function (followingKey) {
        return firebase.database().ref("posts").orderByChild('authorUid').equalTo(followingKey).once("value");
      });
      Promise.all(promises).then(function (friendPostSnapshots) {
        var added = [];
        var idx = 0;
        friendPostSnapshots.forEach(function (friendPostSnap) {

          if (!friendPostSnap.exists()) {
            return;
          }
          friendPostSnap.forEach(function (postSnap) {
            var post = postSnap.val();
            $scope.loadedPostKeys[postSnap.key] = true;
            $scope.lastLoadedPostCreatedTime = post.createdTime;
            $scope.lastLoadedPostKey = postSnap.key;
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
            console.log('init ', postSnap.key, post);
            added.push(post);
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
        added.forEach(function (post) {
          $scope.posts.push(post);
        });

        $scope.$broadcast('scroll.refreshComplete');
        $scope.hasMorePosts = true;





      });
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

  $scope.searchUser = function () {
    $state.go('search-user');
  };


  $scope.init = function () {
    $ionicModal.fromTemplateUrl('template/photo-slide-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.photoSlideModal = modal;
      $scope.reloadPosts();
    });

    

    firebase.database().ref('users/' + me.auth.uid + '/following').once('value').then(function (allFollowingSnap) {
        var followingKeys = [];
        allFollowingSnap.forEach(function (followingSanp) {
          followingKeys.push(followingSanp.key);
        });
        if(followingKeys.length == 0){
            console.log('no following');
            $scope.searchUser();
        }
    });
    


  };
  $scope.init();

});
