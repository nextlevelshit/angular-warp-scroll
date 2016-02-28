angular.module('app', [
        'ngAnimate',
        'pc035860.scrollWatch'
    ])

    .controller('MainCtrl', function ($scope, $log) {
        angular.forEach([1, 2, 3, 4, 5], function (i) {
            $scope.$on('slide' + i, onSlideChange);
        });

        function onSlideChange($evt, active, locals) {
            $scope[$evt.name] = active;
        }
    });