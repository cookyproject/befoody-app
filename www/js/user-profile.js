app.controller('UserProfileCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, me) {

  $scope.me = me;
  $scope.followerCount = 0;
  $scope.followingCount = 0;
  $scope.photos = [];
  
  // 處理按下登出按鈕事件
  $scope.logout = function () {
    firebase.auth().signOut();
  };

  // 初始化個人資料頁面
  $scope.init = function () {
    console.log(me);
    // 從 DB 查詢 目前已經追蹤人數
    firebase.database().ref('users/' + me.auth.uid + '/following').once('value').then(function (allFollowingSnap) {
      var count = 0;
      allFollowingSnap.forEach(function (followingSanp) {
        count++;
      });
      $scope.followingCount = count;
    });

    // 從 DB 查詢 目前已經被追蹤數量
    firebase.database().ref('followers/' + me.auth.uid).once('value').then(function (allFollowerSnap) {
      var count = 0;
      allFollowerSnap.forEach(function (followerSnap) {
        count++;
      });
      $scope.followerCount = count;
    });
    
    // 從 DB 查詢自己的貼文
    $scope.photos = [];
    firebase.database().ref("posts").orderByChild('authorUid').equalTo(me.auth.uid).once("value").then(function (allPostSnap) {
      $scope.$apply(function () {
        // 走訪自己的貼文，從中挑出照片網址，
        // 放入 $scop.photos 陣列
        // 讓畫面能夠呈現
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
