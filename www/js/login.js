app.controller('LoginCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, currentAuth, $ionicLoading) {

  $scope.loginForm = {
    email: '',
    password: ''
  };

  // FB 登入
  $scope.loginFacebook = function () {

    // 先偵測FB SDK 是否已經就緒
    if (window.CordovaFacebook) {
      CordovaFacebook.login({
        permissions: ['email'],
        onSuccess: function (result) {
          // 登入成功
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
            // 交由 navigateByFirebaseUser 函數決定下一步驟
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
    }
  };

  // Google 登入
  $scope.loginGoogle = function () {
    window.plugins.googleplus.login({
        'scopes': '', 
        'webClientId': '520776530433-jfi3u0hnhnbllfucjoj3q7murklmivup.apps.googleusercontent.com',
        'offline': true, 
      },
      function (obj) {
        console.log(obj);
        $ionicLoading.show({
          template: '請稍候...'
        });
        firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(obj.idToken)).then(function (firebaseUser) {
          // 登入成功
          console.log("Signed in as:", firebaseUser);
          $ionicLoading.hide();
          // 交由 navigateByFirebaseUser 函數決定下一步驟
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
    // 查詢 DB 是否有此用戶基本資料
    firebase.database().ref('/users/' + firebaseUser.uid).once('value').then(function (snapshot) {
      if (snapshot.val()) {
        // 用戶之前已經有基本資料
        var profile = snapshot.val();

        // 嘗試更新用戶最新頭貼 (用戶可能在FB,Google 上更新了自己頭貼，因此需要同步一次)
        profile.avatar = firebaseUser.photoURL;
        // 將新頭貼同步回DB
        firebase.database().ref('users/' + firebaseUser.uid).set(profile).then(function (result) {
          // 更新成功後前往主畫面: 文章列表
          $ionicLoading.hide();
          $state.go('main-tabs.post-list');
        }, function (err) {
          console.error(err);
        });

      } else {
        // 用戶之前沒有填過基本資料，
        // 前往首次基本資料填寫頁面
        $ionicLoading.hide();
        $state.go('create-user', {
          userId: firebaseUser.uid,
          avatar: firebaseUser.photoURL
        });
      }

    });
  }

  // 前往註冊頁面
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
