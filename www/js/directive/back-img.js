app.directive('backImg', function () {
  return function (scope, element, attrs) {
    attrs.$observe('backImg', function (value) {
      // 當偵測到HTML元素有 back-img 屬性時，
      // 自動添加 background-image CSS
      element.css({
        'background-image': 'url(' + value + ')'
      });
    });
  };
})
