app.controller('SettingCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, me) {

    $scope.me = me;

    
  
    // 處理按下登出按鈕事件
    $scope.goBackward = function () {
        $ionicHistory.goBack();
    };
  
   
    // 初始化個人資料頁面
    $scope.init = function () {
      console.log(me);
     
    };
    $scope.init();
  
  });
  