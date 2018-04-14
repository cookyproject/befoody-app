// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'firebase', 'monospaced.elastic', 'ngGuid', 'ngCordova','ion-google-place'])
  .run(function ($ionicPlatform, $rootScope, $firebaseAuth, $state) {
    
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
        $state.go('login');
      } else if (error === 'USER_NOT_FOUND') {
        $state.go('create-user');
      }
    });

    $firebaseAuth().$onAuthStateChanged(function (firebaseUser) {
      if (firebaseUser) {
        console.log("Signed in as:", firebaseUser.uid);
      } else {
        console.log("Signed out");
        $state.go('login');

      }
    });

  })
  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider, $sceDelegateProvider) {


    var requireLogin = function ($q, $firebaseAuth) {
      return $q(function (resolve, reject) {
        $firebaseAuth().$requireSignIn().then(function (currAuth) {
          firebase.database().ref('/users/' + currAuth.uid).once('value').then(function (snapshot) {
            if (snapshot.val()) {
              resolve({
                auth: currAuth,
                user: snapshot.val()
              });
            } else {
              reject('USER_NOT_FOUND');
            }

          }, function (err) {
            reject(err);
          });
        }, function (err) {
          reject(err);
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
          currentAuth: function ($firebaseAuth) {
            return $firebaseAuth().$waitForSignIn();
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
          userId: null
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
      .state('main-tabs.create-post', {
        url: '/create-post',
        views: {
          'tab-create-post': {
            templateUrl: 'template/create-post.html',
            controller: 'CreatePostCtrl'
          }
        }

      })
      .state('main-tabs.coupon-list', {
        url: '/coupon-list',
        views: {
          'tab-coupon-list': {
            templateUrl: 'template/coupon-list.html',
            controller: 'CouponListCtrl'
          }
        }
      })
      .state('main-tabs.user-profile', {
        url: '/user-profile',
        views: {
          'tab-user-profile': {
            templateUrl: 'template/user-profile.html',
            controller: 'UserProfileCtrl'
          }
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
