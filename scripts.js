var app = angular.module('app', []);

app.directive('dots', function () {
    return {
        templateUrl: 'src/templates/dots.html',
        scope: {
            status: '='
        },
        link: function (scope) {
            scope.scrollToSlide = function (key) {
                var scrollTo = key * scope.status.slideScrollHeight;
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
            return this.outerHeight() - this.innerHeight();
        },

        outerHeight: function () {
            var doc = $document[0].documentElement,
                body = $document[0].body;

            return Math.max(
                body.scrollHeight, doc.scrollHeight,
                body.offsetHeight, doc.offsetHeight,
                doc.clientHeight
            );
        },

        innerHeight: function () {
            var h1 = $document[0].documentElement.clientHeight,
                h2 = $window.innerHeight;

            return h1 > h2 ? h2 : h1;
        },

        /*
         * Slides handling
         */
        slides: function () {
            var slides = [];

            angular.forEach(this.slidesDom(), function (slide, key) {
                // Add correct z-index
                slide.style.zIndex = this.slidesNum() - key;

                // Add active state
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
            return  this.outerHeight() / this.slidesNum();
        },

        slideScrollHeight: function () {
            return (this.outerHeight() - this.innerHeight()) / (this.slidesNum() - 1);
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
    setBodyHeightRelativeToSlidesNum();

    function setBodyHeightRelativeToSlidesNum() {
        $('body').height(scrollService.slidesNum() * 1000);
    }

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

    /**
     * Iterate through all slides and take them to the
     * right place on Z scala realted to scroll progress
     */

    function scrollHandler() {
        // TODO: Add EventListener to Window resize

        var stepsRelativeToAllSlides = 1 / (scrollService.slidesNum() - 1);

        angular.forEach(scrollService.slidesDom(), function (slide, key) {

            /**
             * Set css transform
             */

            // TODO: Refactor calculation, it is to complicated
            var transform = (scrollService.outerHeight() * (scrollService.progress() - 1)) + scrollService.slideHeight() * (scrollService.slidesNum() - key - scrollService.progress());

            slide.style.transform = slide.style.webkitTransform = 'translateZ(' + transform + 'px)';

            /**
             * Set css opacity
             */

            var step = stepsRelativeToAllSlides * key;
            var opacity = slide.style.opacity = getOpacity(scrollService.progress(), step);

            /**
             * Toggle css display
             */

            slide.style.display = (transform < scrollService.slideHeight()) ? 'block' : 'none';

            /**
             * Set css filter
             */

            var blur = (opacity < 0.9) ? Math.round(opacity * 100) / 20 : 0;

            if (blur) {
                slide.style.filter = slide.style.webkitFilter = 'blur(' + blur + 'px)';
            } else {
                slide.style.filter = slide.style.webkitFilter = '';
            }
        });
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
            slideScrollHeight: scrollService.slideScrollHeight()
        };
    }

    function init () {
        scrollHandler();
        updateStatus();
    }

    init();
});