app.controller('PostCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, me, Guid, $ionicModal, mediaService, $ionicLoading, $cordovaActionSheet, $stateParams) {
  $scope.me = me;
  $scope.postId = null;
  $scope.feedbacks = [];
  $scope.form = {
    message: ''
  };

  $scope.photoSlideOptions = {
    loop: false,
    effect: 'slide',
    speed: 500,
  }



  // 處理按下返回事件
  $scope.goBackward = function () {
    $ionicHistory.goBack();
  };

  $scope.submit = function () {
    if ($scope.form.message.length == 0) {
      return;
    }
    var feedback = {
      uid: me.auth.uid,
      message: $scope.form.message,
      time: firebase.database.ServerValue.TIMESTAMP
    };

    firebase.database().ref('feedbacks/' + $scope.postId).push(feedback).then(function (result) {

    }, function (err) {
      console.error(err);
    });



    feedback.time = new Date().getTime();
    feedback.avatar = me.auth.photoURL;
    $scope.feedbacks.push(feedback);
    $scope.form.message = '';

  };


  $scope.$on("$ionicView.enter", function (scopes, states) {
    $scope.postId = $stateParams.postId;
    console.log('post id', $scope.postId);
    $scope.feedbacks = [];
    firebase.database().ref('feedbacks/' + $scope.postId).once('value').then(function (allFeedbacksSnap) {
      allFeedbacksSnap.forEach(function (feedbackSanp) {
        var feedback = feedbackSanp.val();
        firebase.database().ref('users/' + feedback.uid).once('value').then(function (feedbackerSnap) {
          $scope.$apply(function () {
            var feedbacker = feedbackerSnap.val();
            feedback.avatar = feedbacker.avatar;
          });

        });
        $scope.$apply(function () {
          $scope.feedbacks.push(feedback);
        });

      });
    });
  });
  $scope.init = function () {

  };
  $scope.init();

});
