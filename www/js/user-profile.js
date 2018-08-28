app.controller('UserProfileCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, me) {

  $scope.me = me;
  $scope.followerCount = 0;
  $scope.followingCount = 0;
  $scope.photos = [];
  $scope.logout = function () {
    firebase.auth().signOut();
  };
  $scope.init = function () {
    console.log(me);
    firebase.database().ref('users/' + me.auth.uid + '/following').once('value').then(function (allFollowingSnap) {
      var count = 0;
      allFollowingSnap.forEach(function (followingSanp) {
        count++;
      });
      $scope.followingCount = count;
    });
    firebase.database().ref('followers/' + me.auth.uid).once('value').then(function (allFollowerSnap) {
      var count = 0;
      allFollowerSnap.forEach(function (followerSnap) {
        count++;
      });
      $scope.followerCount = count;
    });
    $scope.photos = [];
    firebase.database().ref("posts").orderByChild('authorUid').equalTo(me.auth.uid).once("value").then(function (allPostSnap) {
      $scope.$apply(function () {
        allPostSnap.forEach(function (postSnap) {
          var post = postSnap.val();
          if (post.photos[0]) {
            $scope.photos.push(post.photos[0]);
          }
        });
      });

    });
  };
  $scope.init();

});
