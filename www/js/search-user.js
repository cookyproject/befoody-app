app.controller('SearchUserCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, me) {

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
  $scope.addFollower = function (user) {
    var obj = {
      placeholder: true
    }
    firebase.database().ref('users/' + me.auth.uid + '/following/' + user.uid).set(obj).then(function (result) {
      $scope.$apply(function () {
        user.isFollowing = true;
      });

    }, function (err) {
      console.error(err);
    });
    firebase.database().ref('followers/' + user.uid + '/' + me.auth.uid).set(obj).then(function (result) {
      console.log(result);
    }, function (err) {
      console.error(err);
    });
  };
  $scope.init = function () {
    $scope.reload();
  };
  $scope.init();


});
