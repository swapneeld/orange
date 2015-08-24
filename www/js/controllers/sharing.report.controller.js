(function () {
    'use strict';

    angular
        .module('orange')
        .controller('SharingReportCtrl', SharingReportCtrl);

    SharingReportCtrl.$inject = ['$scope', '$stateParams', '$ionicActionSheet', '$cordovaFile',
                                 '$timeout', 'PDFViewerService', 'Patient'];

    function SharingReportCtrl($scope, $stateParams, $ionicActionSheet, $cordovaFile, $timeout, pdf, Patient) {
        var reportDir = cordova.file.externalCacheDirectory || cordova.file.cacheDirectory,
            fileName = $stateParams.id + '.pdf';

        $scope.pdfURL = '';
        $scope.viewer = pdf.Instance('viewer');
        $scope.currentPage = 0;
        $scope.totalPages = 0;
        $scope.getReport = getReport;
        $scope.share = share;
        $scope.pdfHeight = window.innerHeight - 120;

        $scope.pageLoaded = function(currentPage, totalPages) {
            $scope.currentPage = currentPage;
            $scope.totalPages = totalPages;
        };

        $scope.loadProgress = function(loaded, total, state) {
            console.log('loaded =', loaded, 'total =', total, 'state =', state);
            $scope.loading = false;
        };

        getReport();

        function getReport() {
            $scope.loading = true;
            $scope.$broadcast('scroll.refreshComplete');
            $scope.totalPages = 0;
            $scope.pdfURL = '';
            Patient.getReport($stateParams.id, $stateParams.month).then(
                function (data) {
                    $cordovaFile.writeFile(reportDir, fileName, data, true).then(
                        setPfdUrl,
                        function (error) {
                            $scope.loading = false;
                            console.log(error);
                        }
                    );
                }
            )
        }

        function setPfdUrl() {
            $scope.pdfURL = reportDir + fileName;
        }

        function share() {

            var hideSheet = $ionicActionSheet.show({
                buttons: [{text: 'by Email'}],
                cancelText: 'Cancel',
                buttonClicked: function (index) {
                    switch (index) {
                        case 0:
                            window.plugins.socialsharing.shareViaEmail('', 'Orange Report', null, null, null, $scope.pdfURL);
                            break;
                    }
                }
            });

            $timeout(hideSheet, 3000);
        }
    }
})();
