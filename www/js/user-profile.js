app.controller('UserProfileCtrl', function ($scope, $rootScope, $state, $http, $ionicPopup, $ionicHistory, $firebaseAuth) {

    $scope.logout = function(){
        $firebaseAuth().$signOut();
    };

});
