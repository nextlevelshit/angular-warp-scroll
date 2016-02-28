angular.module('app', [
        'ngAnimate',
        'pc035860.scrollWatch'
    ])

    .controller('MainCtrl', function ($scope, $log, $window, $document) {
        angular.forEach([1, 2, 3, 4, 5], function (i) {
            $scope.$on('slide' + i, onSlideChange);
        });

        function onSlideChange($evt, active, locals) {
            $scope[$evt.name] = active;
        }

        $scope.localsJSON = null;
        $scope.scrollWatch = null;

        var $body = angular.element(document).find('body');
        var bodyHeight = $body.prop('offsetHeight');

        var $allSlides = document.querySelectorAll('.slide');
        var allSlidesNum = $allSlides.length;
        var slideHeight = bodyHeight / $allSlides.length;

        function getOpacity(x, shift) {
            var parabola = getParabola(x, shift, 0.02);
            return roundNegativeToZero(parabola);
        }

        function getParabola (x, shift, slope){
            return - Math.pow((x - shift), 2) / slope + 1;
        }

        function roundNegativeToZero (num) {
            return num > 0 ? num : 0;
        }

        $scope.$on('default', function ($evt, a, locals) {
            var zoomFactor = locals.$progress;
            var zoomPerspective = bodyHeight * (zoomFactor - 1);
            var stepsRelativeToAllSlides = 1 / ($allSlides.length - 1);

            angular.forEach($allSlides, function(slide, key) {
                //var transformSlide = bodyHeight * zoomFactor - bodyHeight + slideHeight * ($allSlides.length - key) - slideHeight * zoomFactor;
                var transformFactor = $allSlides.length - key - zoomFactor;
                var transformSlide = zoomPerspective + slideHeight * transformFactor;
                var cssTransform = 'translateZ(' + transformSlide + 'px)';
                slide.style.transform = cssTransform;
                slide.style.webkitTransform = cssTransform;

                var step = stepsRelativeToAllSlides * key;
                slide.style.opacity = getOpacity(zoomFactor, step);

                //console.log(key, (zoomFactor * (key + 1) / ($allSlides.length)));

                //console.log(key, getOpacity(zoomFactor, step));
                //console.log(key, stepsRelativeToAllSlides * key);
            });

            $scope.$apply(function () {
                $scope.scrollWatch = locals;
            });
        });
    });