// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'monospaced.elastic', 'ngGuid', 'ngCordova'])
  .run(function ($ionicPlatform, $rootScope, $state) {

    $ionicPlatform.ready(function () {

      if (window.cordova && window.cordova.InAppBrowser) {
        window.open = cordova.InAppBrowser.open;
      }
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }

      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      console.log(error);
      if (error === 'AUTH_REQUIRED') {
        // 如果偵測到還沒登入，則切換到登入畫面
        $state.go('login');
      } else if (error === 'USER_NOT_FOUND') {
        // 如過偵測到還沒進行首次資料輸入，則切換到會員首次資料輸入畫面
        $state.go('create-user');
      }
    });
    firebase.auth().onAuthStateChanged(function (firebaseUser) {
      if (firebaseUser) {
        console.log("Signed in as:", firebaseUser);
      } else {
        // 偵測到已經登出
        console.log("Signed out");
        $state.go('login');

      }
    });
  })
  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider, $sceDelegateProvider) {
    var requireLogin = function ($q) {
      return $q(function (resolve, reject) {
        firebase.auth().onAuthStateChanged(function (firebaseUser) {
          firebase.database().ref('/users/' + firebaseUser.uid).once('value').then(function (snapshot) {
            if (snapshot.val()) {
              resolve({
                auth: firebaseUser,
                user: snapshot.val()
              });
            } else {
              reject('USER_NOT_FOUND');
            }

          }, function (err) {
            reject(err);
          });
        });


      });
    }
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider
      .state('login', {
        url: '/login',
        views: {
          'main-nav-view': {
            templateUrl: 'template/login.html',
            controller: 'LoginCtrl'
          }
        },
        resolve: {
          currentAuth: function () {
            return firebase.auth().currentUser;
          }
        }
      })
      .state('register', {
        url: '/register',
        views: {
          'main-nav-view': {
            templateUrl: 'template/register.html',
            controller: 'RegisterCtrl'
          }
        }
      })
      .state('create-user', {
        url: '/create-user',
        views: {
          'main-nav-view': {
            templateUrl: 'template/create-user.html',
            controller: 'CreateUserCtrl'
          }
        },
        params: {
          userId: null,
          avatar: null
        }
      })
      .state('search-user', {
        url: '/search-user',
        views: {
          'main-nav-view': {
            templateUrl: 'template/search-user.html',
            controller: 'SearchUserCtrl'
          }
        },
        params: {
          uid: null,
        },
        resolve: {
          me: requireLogin
        }
      })
      .state('main-tabs', {
        url: '/main-tabs',
        abstract: true,
        views: {
          'main-nav-view': {
            templateUrl: 'template/main-tabs.html'
          }
        },
        resolve: {
          me: requireLogin
        }
      })
      .state('main-tabs.post-list', {
        url: '/post-list',
        views: {
          'tab-post-list': {
            templateUrl: 'template/post-list.html',
            controller: 'PostListCtrl'
          }
        },
        resolve: {
          me: requireLogin
        }
      })
      .state('main-tabs.place-list', {
        url: '/place-list',
        views: {
          'tab-place-list': {
            templateUrl: 'template/place-list.html',
            controller: 'PlaceListCtrl'
          }
        }
      })
      .state('main-tabs.place-post-list', {
        url: '/place-post-list',
        params: {
          place: null,
          placeId: null,
        },
        views: {
          'tab-place-list': {
            templateUrl: 'template/place-post-list.html',
            controller: 'PlacePostListCtrl'
          }
        }

      })
      .state('main-tabs.create-post', {
        url: '/create-post',
        params: {
          submitted: false
        },
        views: {
          'tab-create-post': {
            templateUrl: 'template/create-post.html',
            controller: 'CreatePostCtrl'
          }
        }

      })
      .state('main-tabs.preview-post', {
        url: '/preview-post',
        // params: {
        //   post: null
        // },
        views: {
          'tab-create-post': {
            templateUrl: 'template/preview-post.html',
            controller: 'PreviewPostCtrl'
          }
        }

      })
      .state('main-tabs.reco', {
        url: '/reco',
        views: {
          'tab-reco': {
            templateUrl: 'template/reco.html',
            controller: 'RecoCtrl'
          }
        },
        resolve: {
          me: requireLogin
        }
      })
      .state('main-tabs.user-profile', {
        url: '/user-profile',
        views: {
          'tab-user-profile': {
            templateUrl: 'template/user-profile.html',
            controller: 'UserProfileCtrl'
          }
        },
        resolve: {
          me: requireLogin
        }
      })
      .state('auto-reco-list', {
        url: '/auto-reco-list',
        views: {
          'main-nav-view': {
            templateUrl: 'template/auto-reco-list.html',
            controller: 'AutoRecoListCtrl'
          }
        },
        resolve: {
          me: requireLogin
        }
      })
      .state('setting', {
        url: '/setting',
        views: {
          'main-nav-view': {
            templateUrl: 'template/setting.html',
            controller: 'SettingCtrl'
          }
        },
        resolve: {
          me: requireLogin
        }
      });
    $urlRouterProvider.otherwise('/login');

    //trusted resource
    $sceDelegateProvider.resourceUrlWhitelist([
      // Allow same origin resource loads.
      'self',
      // Allow loading from our assets domain.  Notice the difference between * and **.
      'http://www.youtube.com/**',
      'http://player.youku.com/**'
    ]);

    //ionic configuration
    $ionicConfigProvider.tabs.position('bottom');

  })
