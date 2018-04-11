app.factory('mediaService', ['$window', '$http', '$q', '$rootScope','$cordovaFile','Guid', function ($window, $http, $q, $rootScope, $cordovaFile, Guid) {

  var mediaService = {};
  mediaService.postVideo = function (medium) {
    return $http.post(AppSettings.baseApiUrl + 'media/video', medium);
  };

  mediaService.postCameraImage = function (options) {
    return $q(function (resolve, reject) {

      options.destinationType = Camera.DestinationType.FILE_URI;
      navigator.camera.getPicture(function (imageURI) {
        
        console.log(imageURI);
        var dirPath = imageURI.substring(0, imageURI.lastIndexOf('/') + 1);
        var fileName = imageURI.substring(imageURI.lastIndexOf('/') + 1, imageURI.length);
        var fileKey = Guid.newGuid();

        $cordovaFile.readAsArrayBuffer(dirPath, fileName)
          .then(function (success) {
            var blob = new Blob([success], {
              type: 'image/jpeg'
            });
            var storageRef = firebase.storage().ref();
            var uploadTask = storageRef.child(fileKey).put(blob).then(function (snapshot) {
              resolve(snapshot);
            });
          }, function (error) {
            reject(err);
          });


      }, function (err) {
        reject(err);
      }, options);
    });
  };
  mediaService.postPickedImages = function (options) {
    return $q(function (resolve, reject) {

      imagePicker.getPictures(function (results) {
        var hasError = false;
        var media = [];

        var uploadSuccess = function (result) {

          media.push(JSON.parse(result.response));
          if (media.length == results.length) {
            resolve(media);
          }
        };
        var uploadError = function (err) {
          if (!hasError) {
            hasError = true;
            reject(err);
          } else {
            //just log error, don't callback multiple time
            console.error(err);
          }

        };
        var uploadProgress = function (progress) {

        };

        if (results.length === 0) {
          resolve([]);

        }

        for (var i = 0; i < results.length; i++) {

          var fileName = results[i].replace(/^.*[\\\/]/, '');
          var ft = new FileTransfer();
          var uploadOptions = new FileUploadOptions();
          uploadOptions.fileKey = 'photo';
          uploadOptions.fileName = fileName;
          uploadOptions.headers = {
            Authorization: $rootScope.authToken
          };
          ft.upload(results[i], AppSettings.baseApiUrl + 'media/photos?direction=portrait', uploadSuccess, uploadError, uploadOptions, true);
        }
      }, function (err) {
        reject(err);
      }, options);
    });
  };




  return mediaService;
}]);
