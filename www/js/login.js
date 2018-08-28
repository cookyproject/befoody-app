app.controller('LoginCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, currentAuth, $ionicLoading) {

  $scope.loginForm = {
    email: '',
    password: ''
  };


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
          $ionicLoading.show({
            template: '請稍候...'
          });
          firebase.auth().signInWithCredential(firebase.auth.FacebookAuthProvider.credential(result.accessToken)).then(function (firebaseUser) {
            console.log("Signed in as:", firebaseUser);
            $ionicLoading.hide();
            $scope.navigateByFirebaseUser(firebaseUser);
          }).catch(function (error) {
            console.log("Authentication failed:", error);
            $ionicLoading.hide();
            if (error.code == 'auth/account-exists-with-different-credential') {
              $ionicPopup.alert({
                title: '無法登入',
                template: '您先前已經使用其他方式登入過，請使用一致的方式登入'
              });
            }
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

      firebase.auth().signInWithPopup("facebook").then(function (firebaseUser) {
        console.log("Signed in as:", firebaseUser);
        $scope.navigateByFirebaseUser(firebaseUser);
      }).catch(function (error) {
        console.log("Authentication failed:", error);
      });
    }



  };

  $scope.loginGoogle = function () {
    window.plugins.googleplus.login({
        'scopes': '', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
        'webClientId': '520776530433-jfi3u0hnhnbllfucjoj3q7murklmivup.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
        'offline': true, // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
      },
      function (obj) {
        console.log(obj);
        $ionicLoading.show({
          template: '請稍候...'
        });
        firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(obj.idToken)).then(function (firebaseUser) {
          console.log("Signed in as:", firebaseUser);
          $ionicLoading.hide();
          $scope.navigateByFirebaseUser(firebaseUser);

        }).catch(function (error) {
          console.log("Authentication failed:", error);
          $ionicLoading.hide();
          if (error.code == 'auth/account-exists-with-different-credential') {
            $ionicPopup.alert({
              title: '無法登入',
              template: '您先前已經使用其他方式登入過，請使用一致的方式登入'
            });
          }
        });
      },
      function (err) {
        console.error(err);
      }
    );
  };

  $scope.navigateByFirebaseUser = function (firebaseUser) {
    $ionicLoading.show({
      template: '請稍候...'
    });
    firebase.database().ref('/users/' + firebaseUser.uid).once('value').then(function (snapshot) {
      if (snapshot.val()) {
        // already has profile
        var profile = snapshot.val();
        profile.avatar = firebaseUser.photoURL;
        firebase.database().ref('users/' + firebaseUser.uid).set(profile).then(function (result) {
          $ionicLoading.hide();
          $state.go('main-tabs.post-list');
        }, function (err) {
          console.error(err);
        });

      } else {
        // no profile
        $ionicLoading.hide();
        $state.go('create-user', {
          userId: firebaseUser.uid,
          avatar: firebaseUser.photoURL
        });
      }

    });
  }
  $scope.register = function () {
    $state.go('register');
  };
  $scope.login = function () {
    $ionicLoading.show({
      template: '請稍候...'
    });
    firebase.auth().signInWithEmailAndPassword($scope.loginForm.email, $scope.loginForm.password).then(function (firebaseUser) {
      console.log(firebaseUser);
      $ionicLoading.hide();
      $scope.navigateByFirebaseUser(firebaseUser);

    }).catch(function (error) {

      console.error(error);
      $ionicLoading.hide();
      if (error.code == 'auth/wrong-password') {
        $ionicPopup.alert({
          title: '無法登入',
          template: '密碼錯誤'
        });
      }
      if (error.code == 'auth/user-not-found') {
        $ionicPopup.alert({
          title: '無法登入',
          template: '用戶不存在'
        });
      }
    });
  };
  $scope.init = function () {

    if (currentAuth) {
      $scope.navigateByFirebaseUser(currentAuth);
    }

  };
  $scope.init();


});
