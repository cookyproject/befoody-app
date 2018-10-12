app.directive('googlePlaceAutoComplete', function () {
  return {
    require: '',
    link: function (scope, element, attrs) {
      var options = {
        types: ['establishment']
      };
      var pacInput = element[0];
      var googlePlaceAutoComplete = new google.maps.places.Autocomplete(pacInput, options);
      // 監聽使用者完成選擇之事件
      google.maps.event.addListener(googlePlaceAutoComplete, 'place_changed', function () {
        // 使用者實際選擇的地點
        var place = googlePlaceAutoComplete.getPlace();
        scope.$apply(function () {
          // 透過廣播告知Controller使用者已經完成選擇
          // 並讓 Controller 自行決定接下來的動作
          scope.$emit('googlePlaceAutoComplete.placeChanged', place);
        });
        
      });
    }
  };
});
