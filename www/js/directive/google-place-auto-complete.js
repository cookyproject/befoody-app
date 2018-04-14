app.directive('googlePlaceAutoComplete', function () {
  return {
    require: '',
    link: function (scope, element, attrs) {
      var options = {
        types: ['establishment']
      };
      var pacInput = element[0];
      var googlePlaceAutoComplete = new google.maps.places.Autocomplete(pacInput, options);

      google.maps.event.addListener(googlePlaceAutoComplete, 'place_changed', function () {
        var place = googlePlaceAutoComplete.getPlace();
        scope.$apply(function () {
          scope.$emit('googlePlaceAutoComplete.placeChanged', place);
        });
        
      });
    }
  };
});
