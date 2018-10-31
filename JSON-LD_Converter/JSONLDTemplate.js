"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JSONLDTemplate = /** @class */ (function () {
    function JSONLDTemplate() {
        this.template = {
            "@type": "schema:ParkingFacility",
            "@id": "",
            "schema:name": "",
            "schema:description": "",
            "dcterms:identifier": "",
            "bp:vehicleType": "",
            "datex:numberOfVacantParkingSpaces": "",
            "datex:parkingNumberOfSpaces": "",
            "schema:address": {
                "@type": "schema:PostalAddress",
                "@id": "",
                "schema:addressCountry": "",
                "schema:postalCode": "",
                "schema:streetAddress": ""
            },
            "schema:geo": {
                "@type": "schema:GeoCoordinates",
                "schema:latitude": "",
                "schema:longitude": ""
            },
            "schema:publicAccess": "",
            "schema:isAccessibleForFree": "",
            "schema:price": "",
            "schema:openingHours": "",
            "bp:state": "",
            "schema:contactPoint": {
                "@type": "schema:ContactPoint",
                "schema:email": "",
                "schema:telephone": ""
            },
            "schema:landlord": "",
            "bp:manager": {
                "@type": "schema:Organization",
                "schema:name": ""
            }
        };
    }
    JSONLDTemplate.prototype.getTemplate = function () {
        return this.template;
    };
    JSONLDTemplate.prototype.removeEmptyFields = function () {
        var _this = this;
        Object.keys(this.template).forEach(function (key) {
            if (typeof _this.template[key] === 'object') {
                Object.keys(_this.template[key]).forEach(function (key2) {
                    if (_this.template[key][key2] === '') {
                        delete _this.template[key][key2];
                    }
                });
                // If only the @type field is left, we can remove the whole tag
                if (Object.keys(_this.template[key]).length === 1) {
                    delete _this.template[key];
                }
            }
            else if (_this.template[key] === '') {
                delete _this.template[key];
            }
        });
    };
    return JSONLDTemplate;
}());
exports.JSONLDTemplate = JSONLDTemplate;
