app.controller('SearchUserCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, $firebaseAuth, me) {

  $scope.users = [];
  $scope.form = {
    searchKeyword: ''
  };
  $scope.goBack = function () {
    $ionicHistory.goBack();
  };

  $scope.searchChanged = function () {

    var keyword = $scope.form.searchKeyword;
    setTimeout(function () {

      if (keyword != $scope.form.searchKeyword) {
        return;
      }

      $scope.reload(keyword);
    }, 300);

  };
  $scope.reload = function (keyword) {
    $scope.users = [];
    if (!keyword) {
      firebase.database().ref('users').limitToLast(20).once('value').then(function (snapshot) {
        $scope.renderUserList(snapshot);
      });
    } else {
      firebase.database().ref('users').orderByChild('name').startAt(keyword).limitToLast(20).once('value').then(function (snapshot) {
        $scope.renderUserList(snapshot);
      });
    }
  };
  $scope.renderUserList = function (snapshot) {
    var added = [];
    var idx = 0;
    snapshot.forEach(function (userSnap) {


      var user = userSnap.val();
      if (userSnap.key == me.auth.uid) {
        return;
      }
      user.isFriend = false;
      user.uid = userSnap.key;
      added.push(user);


      firebase.database().ref('users/' + me.auth.uid + '/friends/' + userSnap.key).once('value').then(function (friendSnap) {
        if (friendSnap.exists()) {
          user.isFriend = true;
        }

      });


    });
    $scope.$apply(function () {
      added.forEach(function (user) {
        $scope.users.push(user);
      });
    });

  };
  $scope.addFriend = function (user) {
    var obj = {
      placeholder: true
    }
    firebase.database().ref('users/' + me.auth.uid + '/friends/' + user.uid).set(obj).then(function (result) {
      $scope.$apply(function () {
        user.isFriend = true;
      });

    }, function (err) {
      console.error(err);
    });
  };
  $scope.init = function () {
    $scope.reload();
  };
  $scope.init();


});
