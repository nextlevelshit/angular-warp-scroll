angular.module('app', [])

    .controller('ScrollCtrl', function ($scope, $log, $window, $document) {
        $scope.test = 'buja';

        var $body = angular.element(document).find('body');
        var $allSlides = document.querySelectorAll('.slide');
        var allSlidesNum = $allSlides.length;
        var accelerationFactor = 1;
        var $dots = $('sidebar > .list--dots');

        $('body').height(allSlidesNum * 500);

        for (var i = 0; i < allSlidesNum; i++) {
            var $listItem = '<li class="list__item active" ng-click="scrollToslide(' + i + ')"/>';
            $dots.append($listItem);
        }

        $scope.scrollToSlide = function (slide) {
            alert(slide);
        };

        /**
         * Get current opacity of every slide related to its
         * position on Z scala
         */

        function getOpacity(x, shift) {
            var parabola = getParabola(x, shift, 0.03);
            return roundNegativeToZero(parabola);
        }

        function getParabola (x, shift, slope){
            return - Math.pow((x - shift), 2) / slope + 1;
        }

        function roundNegativeToZero (num) {
            return num > 0 ? num : 0;
        }

        function scrollToClosestSlide (slide, slideHeight) {
            var scrollTop = slide * slideHeight;
            var latency = Math.abs((getScrollTop() / scrollTop));
            if(latency > 0.7 && latency < 1.3) {
                $('body, html').animate({scrollTop: scrollTop}, 200);
            }
        }

        function pickClosestKey (array, num) {
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

        function toggleDots (active) {
            $dots.children('.active').removeClass('active');
            $($dots.children()[active]).addClass('active');
        }

        function increaseIfGreaterThanZero (num) {
            return num <= 0 ? num : num * 3;
        }

        function getProgress () {
            return getScrollTop() / getMaxScroll();
        }

        function getScrollTop () {
            return $window.pageYOffset;
        }

        function getMaxScroll() {
            return getContentHeight() - getContainerHeight();
        }

        function getContentHeight() {
            var doc = $document[0].documentElement,
                body = $document[0].body;

            return Math.max(
                body.scrollHeight, doc.scrollHeight,
                body.offsetHeight, doc.offsetHeight,
                doc.clientHeight
            );
        }

        function getContainerHeight () {
            var h1 = $document[0].documentElement.clientHeight,
                h2 = $window.innerHeight;

            return h1 > h2 ? h2 : h1;
        }

        /**
         * Iterate through all slides and take them to the
         * right place on Z scala realted to scroll progress
         */

        $document.bind('scroll', function(){
            scrollHandler()
        });

        function scrollHandler () {
            var bodyHeight = $body.prop('offsetHeight');
            var windowHeight = window.innerHeight;
            var slideHeight = bodyHeight / allSlidesNum;
            var slideHeightRelativeToWindow = (bodyHeight - windowHeight) / (allSlidesNum - 1);

            var zoomFactor = getProgress();
            var zoomPerspective = bodyHeight * (zoomFactor - 1);
            var stepsRelativeToAllSlides = 1 / (allSlidesNum - 1);

            var slidesTranslateList = [];

            angular.forEach($allSlides, function(slide, key) {
                var transformFactor = $allSlides.length - key - zoomFactor;
                var transformSlide = zoomPerspective + slideHeight * transformFactor;
                var cssTransform = 'translateZ(' + transformSlide + 'px)';

                slide.style.transform = cssTransform;
                slide.style.webkitTransform = cssTransform;

                var step = stepsRelativeToAllSlides * key;
                slide.style.opacity = getOpacity(zoomFactor, step);
                slide.style.display = (transformSlide < (slideHeight / 2)) ? 'block' : 'none';

                slidesTranslateList.push(transformSlide);
            });

            var closestSlide = pickClosestKey(slidesTranslateList, 0);

            toggleDots(closestSlide);


            //$('body, html').stop();
            clearTimeout( $.data( this, 'scrollCheck' ) );
            $.data( this, 'scrollCheck', setTimeout(function() {
                //scrollToClosestSlide(closestSlide, slideHeightRelativeToWindow);
            }, 300) );
            $scope.activeSlide = closestSlide;

        }

        scrollHandler();
    });