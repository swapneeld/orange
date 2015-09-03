(function () {
    'use strict';

    angular
        .module('orange')
        .factory('PharmacyService', PharmacyService);

    PharmacyService.$inject = ['PagingService'];

    function PharmacyService(PagingService) {
        var Service = function () {
            PagingService.constructor.call(this);
            this.apiEndpoint = 'pharmacies';
        };

        Service.prototype = PagingService;

        return new Service();
    }
})();
