app.controller('CreateUserCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory) {
  $scope.profile = {
    name: '',
    description: '',
    avatar: $state.params.avatar
  };
  // 使用者送出表單
  $scope.submit = function () {

    var userId = $state.params.userId;
    // 將填好的個人資料寫入 DB 的 users 節點下面
    firebase.database().ref('users/' + userId).set($scope.profile).then(function (result) {
      // DB 寫入成功
      // 前往主畫面: 文章列表
      $state.go('main-tabs.post-list');
    }, function (err) {
      console.error(err);
    });

  };

});
