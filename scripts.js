var app = angular.module('app', []);

app.directive('wsDots', function () {
    return {
        templateUrl: 'src/templates/dots.html',
        scope: {
            status: '='
        },
        link: function (scope) {
            // TODO: Mode dots functions from service into here
            scope.scrollToSlide = function (key) {
                var scrollTo = key * scope.status.slideHeight;

                console.log(key, scope.status.slideHeight, scrollTo);

                $('body, html').animate({scrollTop: scrollTo}, 1200);
            };
        }
    };
});

app.factory('scrollService', function ($window, $document) {
    return {
        /**
         * Current scorll progress between 0 and 1
         * @returns {number}
         */
        progress: function () {
            return this.scrollTop() / this.maxScroll();
        },

        /*
         * Scroll parameter handling
         */

        scrollTop: function () {
            return $window.pageYOffset;
        },

        maxScroll: function () {
            return this.contentHeight() - this.containerHeight();
        },

        contentHeight: function () {
            var doc = $document[0].documentElement,
                body = $document[0].body;

            return Math.max(
                body.scrollHeight, doc.scrollHeight,
                body.offsetHeight, doc.offsetHeight,
                doc.clientHeight
            );
        },

        containerHeight: function () {
            var h1 = $document[0].documentElement.clientHeight,
                h2 = $window.innerHeight;

            return h1 > h2 ? h2 : h1;
        },

        /*
         * Slides handling
         */
        slides: function () {
            // TODO: Add correct z-index to each slide
            var slides = [];

            angular.forEach(this.slidesDom(), function (slide, key) {
                slides.push({
                    id: key,
                    active: this.activeSlide() === key
                });
            }, this);

            return slides;
        },

        slidesDom: function () {
            return document.querySelectorAll('.slide');
        },

        slidesNum: function () {
            return this.slidesDom().length;
        },

        slideHeight: function () {
            return (this.contentHeight() - this.containerHeight()) / (this.slidesNum() - 1);
        },

        activeSlide: function () {
            var minDiff = 1000, // TODO: Try to avoid this decleration to make it more reliable
                closestKey;

            angular.forEach(this.slidesDom(), function (slide, key) {
                var translate = slide.style.transform.match(/-?\d+[.]?\d*/,'')[0];
                var m = Math.abs(0 - translate);

                if (m < minDiff) {
                    minDiff = m;
                    closestKey = key;
                }
            });

            return closestKey;
        }
    };
});

app.controller('scrollCtrl', function ($scope, $log, $window, $document, scrollService) {
    var $body = angular.element(document).find('body');
    // TODO: Deprecated
    var $allSlides = document.querySelectorAll('.slide');
    // TODO: Deprecated
    var allSlidesNum = $allSlides.length;
    var accelerationFactor = 1;

    $('body').height(allSlidesNum * 1000);

    /**
     * Get current opacity of every slide related to its
     * position on Z scala
     */

    function getOpacity(x, shift) {
        var parabola = getParabola(x, shift, 0.01);
        return roundNegativeToZero(parabola);
    }

    function getParabola(x, shift, slope) {
        return -Math.pow((x - shift), 2) / slope + 1;
    }

    function roundNegativeToZero(num) {
        return num > 0 ? num : 0;
    }

    // TODO: Deprecated
    function scrollToClosestSlide(slide, slideHeight) {
        var scrollTop = slide * slideHeight;
        var latency = Math.abs((scrollService.scrollTop() / scrollTop));
        if (latency > 0.7 && latency < 1.3) {
            $('body, html').animate({scrollTop: scrollTop}, 200);
        }
    }

    // TODO: Deprecated
    function pickClosestKey(array, num) {
        var minDiff = 1000;
        var closestKey;
        for (i in array) {
            var m = Math.abs(num - array[i]);
            if (m < minDiff) {
                minDiff = m;
                closestKey = i;
            }
        }
        return closestKey;
    }

    function increaseIfGreaterThanZero(num) {
        return num <= 0 ? num : num * 3;
    }

    /**
     * Iterate through all slides and take them to the
     * right place on Z scala realted to scroll progress
     */

    function scrollHandler() {
        var bodyHeight = $body.prop('offsetHeight');
        var windowHeight = window.innerHeight;
        var slideHeight = bodyHeight / allSlidesNum;
        var slideHeightRelativeToWindow = (bodyHeight - windowHeight) / (allSlidesNum - 1);

        var zoomFactor = scrollService.progress();
        var zoomPerspective = bodyHeight * (zoomFactor - 1);
        var stepsRelativeToAllSlides = 1 / (allSlidesNum - 1);

        var slidesTranslateList = [];

        angular.forEach($allSlides, function (slide, key) {
            var transformFactor = $allSlides.length - key - zoomFactor;
            var transformSlide = zoomPerspective + slideHeight * transformFactor;
            var cssTransform = 'translateZ(' + transformSlide + 'px)';

            slide.style.transform = cssTransform;
            slide.style.webkitTransform = cssTransform;

            var step = stepsRelativeToAllSlides * key;
            var opacity = getOpacity(zoomFactor, step);
            var blur = (opacity < 0.9) ? Math.round(opacity * 100) / 20 : 0;
            var cssFilter = 'blur(' + blur + 'px)';

            slide.style.opacity = opacity;
            slide.style.display = (transformSlide < slideHeight) ? 'block' : 'none';

            if (blur) {
                slide.style.filter = slide.style.webkitFilter = cssFilter;
            } else {
                slide.style.filter = slide.style.webkitFilter = '';
            }

            //console.log(key, opacity, blur);
            //slide.style.display = (transformSlide < (slideHeight / 2)) ? 'block' : 'none';

            slidesTranslateList.push(transformSlide);
        });

        //$('body, html').stop();
        clearTimeout($.data(this, 'scrollCheck'));
        $.data(this, 'scrollCheck', setTimeout(function () {
            // TODO: Add Snap function
            //var closestSlide = pickClosestKey(slidesTranslateList, 0);
            //scrollToClosestSlide(closestSlide, slideHeightRelativeToWindow);
        }, 300));
    }

    /*
     * Add event handler to user scrolling
     */

    angular.element($window).bind('scroll', function() {
        init();
        $scope.$apply();
    });

    /*
     * Give scroll information to frontend
     */

    function updateStatus () {
        $scope.scrollStatus = {
            progress: scrollService.progress(),
            slides: scrollService.slides(),
            slideHeight: scrollService.slideHeight()
        };
    }

    function init () {
        scrollHandler();
        updateStatus();
    }

    init();
});