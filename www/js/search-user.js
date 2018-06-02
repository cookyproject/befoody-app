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
      if (!keyword) {
        return;
      }
      if (keyword != $scope.form.searchKeyword) {
        return;
      }

      $scope.reload(keyword);
    }, 300);

  };
  $scope.reload = function (keyword) {
    $scope.users = [];
    if (!keyword) {
      firebase.database().ref('users').startAt(keyword).limitToLast(20).once('value').then(function (snapshot) {
        var added = [];
        var idx = 0;
        snapshot.forEach(function (userSnap) {


          var user = userSnap.val();
          if (userSnap.key == me.auth.uid) {
            return;
          }
          added.push(user);
          user.isFriend = false;
          firebase.database().ref('users/' + me.auth.uid + '/friends/' + userSnap.key).once('value').then(function (friendSnap) {
            console.log(friendSnap);
            user.isFriend = false;

          });


        });

        added.forEach(function (user) {
          $scope.users.push(user);
        });



      });
    } else {
      firebase.database().ref('users').orderByChild('name').startAt(keyword).limitToLast(20).once('value').then(function (snapshot) {
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
            console.log(friendSnap);
            user.isFriend = true;

          });


        });

        added.forEach(function (user) {
          $scope.users.push(user);
        });



      });
    }
  };
  $scope.addFriend = function(user){
    firebase.database().ref('users/'+me.auth.uid+'/friends/'+user.uid).set({}).then(function (result) {
       user.isFriend = true;
      }, function (err) {
        console.error(err);
      });
  };
  $scope.init = function () {
    $scope.reload();
  };
  $scope.init();


});
