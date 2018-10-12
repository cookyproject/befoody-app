app.controller('SearchUserCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, me) {

  $scope.users = [];
  $scope.form = {
    searchKeyword: ''
  };
  // 處理返回主畫面事件
  $scope.goBack = function () {
    $ionicHistory.goBack();
  };

  // 處理搜尋輸入方塊值改變事件
  $scope.searchChanged = function () {

    var keyword = $scope.form.searchKeyword;
    // 先間隔300ms 之後，發現輸入關鍵字不再變化後，
    // 才開始正式搜尋
    setTimeout(function () {
      if (keyword != $scope.form.searchKeyword) {
        return;
      }
      // 以關鍵字搜尋會員
      $scope.reload(keyword);
    }, 300);

  };
  
  // 重新整理會員列表
  // 如果有 keyword 參數，則會依照keyword 搜尋。
  $scope.reload = function (keyword) {
    $scope.users = [];
    if (!keyword) {
      // 沒有 keyword, 查詢資料庫的 users 節點下會員資料
      firebase.database().ref('users').limitToLast(20).once('value').then(function (snapshot) {
        $scope.renderUserList(snapshot);
      });
    } else {
      // 有 keyword, 查詢資料庫的 users 節點下名稱以 keyword 開頭的會員資料
      firebase.database().ref('users').orderByChild('name').startAt(keyword).limitToLast(20).once('value').then(function (snapshot) {
        $scope.renderUserList(snapshot);
      });
    }
  };

  // 呈現會員列表
  $scope.renderUserList = function (snapshot) {
    var added = [];
    var idx = 0;
    snapshot.forEach(function (userSnap) {

      var user = userSnap.val();
      if (userSnap.key == me.auth.uid) {
        return;
      }
      user.isFollowing = false;
      user.uid = userSnap.key;
      added.push(user);

      firebase.database().ref('users/' + me.auth.uid + '/following/' + userSnap.key).once('value').then(function (followingSanp) {
        if (followingSanp.exists()) {
          user.isFollowing = true;
        }

      });

    });
    $scope.$apply(function () {
      added.forEach(function (user) {
        $scope.users.push(user);
      });
    });

  };

  // 處理按下追蹤按鈕事件
  $scope.addFollower = function (user) {
    var obj = {
      placeholder: true
    }
    // 將追蹤關係寫入 DB
    firebase.database().ref('users/' + me.auth.uid + '/following/' + user.uid).set(obj).then(function (result) {
      $scope.$apply(function () {
        user.isFollowing = true;
      });

    }, function (err) {
      console.error(err);
    });
    // 將被追蹤關係寫入 DB
    firebase.database().ref('followers/' + user.uid + '/' + me.auth.uid).set(obj).then(function (result) {
      console.log(result);
    }, function (err) {
      console.error(err);
    });
  };
  $scope.init = function () {
    console.log(me);
    console.log(me.auth.getIdToken().then(function(result){
      console.log('user IdToken',result);
    },function(err){
        console.error(err);
    }));
    $scope.reload();
  };
  $scope.init();
});
