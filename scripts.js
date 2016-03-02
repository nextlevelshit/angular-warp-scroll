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
        var $allSlides = document.querySelectorAll('.slide');
        var allSlidesNum = $allSlides.length;

        /**
         * Get current opacity of every slide related to its
         * position on Z scala
         * @param x
         * @param shift
         * @returns {*}
         */

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

        function scrollToClosestSlide () {

        }

        function pickClosestKey (array, num) {
            var i = 0;
            var minDiff = 1000;
            var closestKey;
            for(i in array){
                var m = Math.abs(num - array[i]);
                if(m < minDiff){
                    minDiff = m;
                    closestKey = i;
                }
            }
            return closestKey;
        }


        /**
         * Iterate through all slides and take them to the
         * right place on Z scala realted to scroll progress
         */

        $scope.$on('default', function ($evt, a, locals) {
            var bodyHeight = $body.prop('offsetHeight');
            var windowHeight = window.innerHeight;
            var bodyHeightRelativeToWindow = bodyHeight / (bodyHeight - windowHeight);
            var slideHeight = bodyHeight / allSlidesNum;
            var slideHeightRelativeToWindow = (bodyHeight - windowHeight) / (allSlidesNum - 1);

            var zoomFactor = locals.$progress;
            var zoomPerspective = bodyHeight * (zoomFactor - 1);
            var stepsRelativeToAllSlides = 1 / (allSlidesNum - 1);

            var slidesTranslateList = [];

            angular.forEach($allSlides, function(slide, key) {
                //var transformSlide = bodyHeight * zoomFactor - bodyHeight + slideHeight * ($allSlides.length - key) - slideHeight * zoomFactor;
                var transformFactor = $allSlides.length - key - zoomFactor;
                var transformSlide = zoomPerspective + slideHeight * transformFactor;
                var cssTransform = 'translateZ(' + transformSlide + 'px)';
                slide.style.transform = cssTransform;
                slide.style.webkitTransform = cssTransform;

                var step = stepsRelativeToAllSlides * key;
                slide.style.opacity = getOpacity(zoomFactor, step);

                slidesTranslateList.push(transformSlide);
            });

            console.log('current scroll top', document.documentElement.scrollTop);

            $document.bind('scroll', function() {
                clearTimeout( $.data( this, 'scrollCheck' ) );
                $.data( this, 'scrollCheck', setTimeout(function() {
                    var scrollTop = bodyHeightRelativeToWindow * (bodyHeight - windowHeight) / allSlidesNum * pickClosestKey(slidesTranslateList, 0);
                    var scrollTop = pickClosestKey(slidesTranslateList, 0) * slideHeightRelativeToWindow;
                    $('body, html').animate({scrollTop: scrollTop}, 400);
                }, 150) );
            });
        });
    });