app.controller('CreateUserCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, $firebaseAuth) {

    
    $scope.profile = {
      name: '',
      description: ''
    };
    

    $scope.submit = function () {
      var userId = $state.params.userId;
      
      firebase.database().ref('users/' + userId).set($scope.profile).then(function (result) {
        alert('success');
        $state.go('main-tabs.post-list');
      }, function (err) {
        console.error(err);
      });

    };

  });
