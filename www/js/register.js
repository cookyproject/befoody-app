app.controller('RegisterCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory) {
  $scope.user = {
    email: '',
    password: '',
    confirmPassword: '',
  };

  // 用戶按下返回取消註冊
  $scope.goBack = function () {
    $ionicHistory.goBack();
  };

  // 用戶確認送出註冊表單
  $scope.submit = function () {

    if (!$scope.user.email) {
      $ionicPopup.alert({
        title: '資料錯誤',
        template: '尚未輸入Email'
      });
      return;
    }
    if (!$scope.user.password) {
      $ionicPopup.alert({
        title: '資料錯誤',
        template: '尚未輸入密碼'
      });
      return;
    }
    if ($scope.user.password != $scope.user.confirmPassword) {
      $ionicPopup.alert({
        title: '資料錯誤',
        template: '密碼不一致'
      });
      return;
    }

    // 透過 firebase auth API 註冊新帳號
    firebase.auth().createUserWithEmailAndPassword($scope.user.email, $scope.user.password).then(function (firebaseUser) {
      console.log(firebaseUser);
      // 註冊成功
      // 前往首次填寫個人資料畫面
      $state.go('create-user', {
        userId: firebaseUser.uid,
        avatar: null
      });

    }).catch(function (error) {
      // 註冊失敗
      console.error(error);
      if (error.code == 'auth/email-already-in-use') {
        $ionicPopup.alert({
          title: '無法註冊',
          template: '此 Email 已經被註冊過'
        });
      }
    });
  };
});
