(function () {
    "use strict";

    angular
        .module('orange')
        .factory('Avatar', Avatar);

    Avatar.$inject = ['$q', '$http'];

    /* @ngInject */
    function Avatar($q, $http) {
        var avatarCache = {};

        return {
            getB64: getB64,
            upload: upload,
            cleanCache: cleanCache
        };

        ////////////////

        function cleanCache(patientId) {
            if (patientId) {
                delete avatarCache[patientId];
            } else {
                avatarCache = {};
            }
        }

        function upload(patient) {
            var deffered = $q.defer();

            var config = {
                transformResponse: [],
                responseType: "arraybuffer",
                headers: {

                    'Accept': "image/png"
                }
            };

            var avatarUrl = patient.avatarUrl;
            $http.get(avatarUrl, config).then(
                function (data) {
                    patient.one('avatar')
                        .withHttpConfig({
                            transformRequest: []
                        })
                        .customPOST(data.data, undefined, undefined, {'Content-Type': 'image/png'})
                        .then(
                        function () {
                            deffered.resolve();
                        },
                        function (error) {
                            deffered.reject(error);
                        }
                    );
                },
                function (error) {
                    deffered.reject(error);
                });

            return deffered.promise;

        }

        function getB64(patient, force) {
            var deffered = $q.defer();
            force = force || false;

            if (!force && avatarCache.hasOwnProperty(patient.id)) {
                console.log('resolved from cache');
                deffered.resolve(avatarCache[patient.id]);
            } else {
                patient.one('avatar').withHttpConfig(
                    {
                        responseType: "arraybuffer"
                    }
                ).get('').then(
                    function (data) {
                        var imageSrc = 'data:image/png;base64,' + bufferToBase64(data);
                        avatarCache[patient.id] = imageSrc;
                        deffered.resolve(imageSrc);
                    },
                    function (error) {
                        console.log('Error loading avatar:', error);
                        deffered.reject(error);
                    }
                );
            }

            return deffered.promise;
        }

        function bufferToBase64(arrayBuffer) {
            var base64 = '';
            var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

            var bytes = new Uint8Array(arrayBuffer);
            var byteLength = bytes.byteLength;
            var byteRemainder = byteLength % 3;
            var mainLength = byteLength - byteRemainder;

            var a, b, c, d;
            var chunk;

            // Main loop deals with bytes in chunks of 3
            for (var i = 0; i < mainLength; i = i + 3) {
                // Combine the three bytes into a single integer
                chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

                // Use bitmasks to extract 6-bit segments from the triplet
                a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
                b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
                c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
                d = chunk & 63; // 63       = 2^6 - 1

                // Convert the raw binary segments to the appropriate ASCII encoding
                base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
            }

            // Deal with the remaining bytes and padding
            if (byteRemainder == 1) {
                chunk = bytes[mainLength];

                a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

                // Set the 4 least significant bits to zero
                b = (chunk & 3) << 4; // 3   = 2^2 - 1

                base64 += encodings[a] + encodings[b] + '=='
            } else if (byteRemainder == 2) {
                chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

                a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
                b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

                // Set the 2 least significant bits to zero
                c = (chunk & 15) << 2; // 15    = 2^4 - 1

                base64 += encodings[a] + encodings[b] + encodings[c] + '=';
            }

            return base64;
        }

    }

})();
