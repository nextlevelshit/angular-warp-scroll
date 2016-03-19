/*! angular-warp-scroll
version: 0.1.0
build date: 2016-3-20
author: Michael Czechowski (nextlevelshit)
https://github.com/nextlevelshit/angular-warp-scroll.git */
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

app.factory('scrollService', ["$window", "$document", function ($window, $document) {
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
                    active: this.activeSlide() === key,
                    title: slide.getAttribute('data-title')
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

        visibleSlidesObject: function () {
            /**
             * Slide keys starting with 0, so the corrected number of
             * slides have to be increased for this calculation by one.
             */
            var correctedSlidesNum = this.slidesNum() - 1;
            var slideInForegroundKey = Math.floor(correctedSlidesNum * this.progress());
            var slideInBackgroundKey = Math.floor(correctedSlidesNum * this.progress()) + 1;

            return {
                foreground: {
                    key: slideInForegroundKey,
                    progress: (correctedSlidesNum * this.progress() - slideInForegroundKey)
                },
                background: {
                    key: slideInBackgroundKey,
                    progress: (correctedSlidesNum * this.progress() - slideInBackgroundKey)
                }
            };
        },

        activeSlide: function () {
            var minDiff = 1000, // TODO: Try to avoid this decleration to make it more reliable
                closestKey;

            angular.forEach(this.slidesDom(), function (slide, key) {
                if (!slide.style.transform) return;

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
}]);

app.controller('scrollCtrl', ["$scope", "$log", "$window", "$document", "scrollService", function ($scope, $log, $window, $document, scrollService) {
    setBodyHeightRelativeToSlidesNum();

    function setBodyHeightRelativeToSlidesNum() {
        $('body').height(scrollService.slidesNum() * 1000);
    }

    function showElement (element) {
        element.style.display = 'block';
    }

    function hideElement (element) {
        element.style.display = 'none';
    }

    /**
     * Iterate through all slides and take them to the
     * right place on Z scala realted to scroll progress
     */

    function scrollHandler() {
        // TODO: Add EventListener to Window resize

        /**
         * Iterate through all slides and toggle
         * display property
         */

        angular.forEach(scrollService.slidesDom(), function (slide) {
            hideElement(slide);
        });

        /**
         * Iterate through visible slides object
         */

        angular.forEach(scrollService.visibleSlidesObject(), function (param) {
            var slide = scrollService.slidesDom()[param.key];
            var opacity =       (param.progress <= 0) ? -Math.pow(param.progress, 2)+1 : -Math.pow(param.progress, 4)+1;
            var transform =     (param.progress <= 0) ? Math.pow(param.progress, 3)*3000 : Math.pow(param.progress, 3)*10000;
            var blur =          (param.progress <= 0) ? Math.pow(param.progress, 4)*10 : Math.pow(param.progress, 4)*100;

            showElement(slide);
            slide.style.opacity = opacity;
            slide.style.transform = slide.style.webkitTransform = 'translateZ(' + transform + 'px)';
            slide.style.filter = 'blur(' + blur + 'px)';
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
}]);