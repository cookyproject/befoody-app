app.controller('LoginCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, $firebaseAuth, currentAuth) {



  $scope.loginFacebook = function () {

    // login with Facebook
    if (window.CordovaFacebook) {
      CordovaFacebook.login({
        permissions: ['email'],
        onSuccess: function (result) {
          if (result.declined.length > 0) {
            console.log("The User declined something!");
          }
          console.log(result);
          firebase.auth().signInWithCredential(firebase.auth.FacebookAuthProvider.credential(result.accessToken)).then(function (firebaseUser) {
            console.log("Signed in as:", firebaseUser);
            var uid = firebaseUser.uid;
            firebase.database().ref('/users/' + uid).once('value').then(function (snapshot) {
              if (snapshot.val()) {
                // already has profile
                $state.go('main-tabs.post-list');

              } else {
                // no profile
                $state.go('create-user', {
                  userId: uid
                });
              }

            });
          }).catch(function (error) {
            console.log("Authentication failed:", error);
          });

        },
        onFailure: function (result) {
          if (result.cancelled) {
            console.log('Login canceled');
          } else if (result.error) {
            console.error(result.error);
          }
        }
      });
    } else {
      // fallback
      $firebaseAuth().$signInWithPopup("facebook").then(function (firebaseUser) {
        console.log("Signed in as:", firebaseUser);
        var uid = firebaseUser.user.uid;
        firebase.database().ref('/users/' + uid).once('value').then(function (snapshot) {
          if (snapshot.val()) {
            // already has profile
            $state.go('main-tabs.post-list');

          } else {
            // no profile
            $state.go('create-user', {
              userId: uid
            });
          }

        });
      }).catch(function (error) {
        console.log("Authentication failed:", error);
      });
    }



  };

  $scope.init = function () {


  };
  $scope.init();


});
