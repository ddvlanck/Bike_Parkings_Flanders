"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JSONLDTemplate_1 = require("./JSONLDTemplate");
var fs = require('fs');
var xmlReader = require('read-xml');
var path = require('path');
var xml2js = require('xml2js');
var jsonld = require('jsonld');
var DatasetAntwerpConverter = /** @class */ (function () {
    function DatasetAntwerpConverter(filename) {
        /**
         * The key will be the ID of the parking
         * The array contains objects the contain a tagname and a tagvalue
         * **/
        this.parkingData = {};
        var filePath = path.join(__dirname, filename);
        this.fileData = fs.readFileSync(filePath, 'ascii');
    }
    DatasetAntwerpConverter.prototype.parse = function () {
        var _this = this;
        var parser = new xml2js.Parser();
        parser.parseString(this.fileData.substring(0, this.fileData.length), function (err, res) {
            var data = res.kml.Document[0].Folder[0].Placemark;
            Object.keys(data).forEach(function (index) {
                //Tags
                var parkingData = data[index].ExtendedData[0].SchemaData[0].SimpleData;
                Object.keys(parkingData).forEach(function (parkingIndex) {
                    var tagValue = parkingData[parkingIndex]['_'];
                    var tagName = parkingData[parkingIndex]['$'].name;
                    if (tagName === 'OBJECTID') {
                        _this.parkingData[tagValue] = [];
                        _this.currentID = tagValue;
                        _this.parkingData[_this.currentID].push({ tag: 'dcterms:identifier', value: tagValue });
                    }
                    else {
                        _this.onTag(tagName, tagValue);
                    }
                });
                //Coordinates
                var coordinates = data[index].Point[0].coordinates[0].split(',');
                _this.parkingData[_this.currentID].push({ tag: 'schema:latitude', value: coordinates[1] });
                _this.parkingData[_this.currentID].push({ tag: 'schema:longitude', value: coordinates[0] });
            });
        });
    };
    /*
    * Change the tags for other documents
    * */
    DatasetAntwerpConverter.prototype.onTag = function (tagName, tagValue) {
        if (tagName === 'Max_Auto') {
            if (!this.parkingData[this.currentID]['types']) {
                this.parkingData[this.currentID]['types'] = [];
            }
            this.parkingData[this.currentID]['types'].push('Auto');
            this.parkingData[this.currentID].push({ tag: 'maxAuto', value: tagValue });
        }
        else if (tagName === 'Max_Fiets') {
            if (!this.parkingData[this.currentID]['types']) {
                this.parkingData[this.currentID]['types'] = [];
            }
            this.parkingData[this.currentID]['types'].push('Fiets');
            this.parkingData[this.currentID].push({ tag: 'maxFiets', value: tagValue });
        }
        else if (tagName === 'Max_Motor') {
            if (!this.parkingData[this.currentID]['types']) {
                this.parkingData[this.currentID]['types'] = [];
            }
            this.parkingData[this.currentID]['types'].push('Motor');
            this.parkingData[this.currentID].push({ tag: 'maxMotor', value: tagValue });
        }
        else if (tagName === 'Link') {
            this.parkingData[this.currentID].push({ tag: '@id', value: tagValue });
        }
        else if (tagName === 'District') {
            this.parkingData[this.currentID].push({ tag: 'schema:addressCountry', value: tagValue });
        }
        else if (tagName === 'Postcode') {
            this.parkingData[this.currentID].push({ tag: 'schema:postalCode', value: tagValue });
        }
        else if (tagName === 'Straat') {
            this.parkingData[this.currentID].push({ tag: 'schema:streetAddress', value: tagValue });
        }
        else if (tagName === 'Openbaar') {
            this.parkingData[this.currentID].push({ tag: 'schema:publicAccess', value: tagValue });
        }
        else if (tagName === 'GEBRUIK') {
            this.parkingData[this.currentID].push({ tag: 'bp:state', value: tagValue });
        }
        else if (tagName === 'Email') {
            this.parkingData[this.currentID].push({ tag: 'schema:email', value: tagValue });
        }
        else if (tagName === 'Telefoon') {
            this.parkingData[this.currentID].push({ tag: 'schema:telephone', value: tagValue });
        }
        else if (tagName === 'NAAM') {
            this.parkingData[this.currentID].push({ tag: 'schema:name', value: tagValue });
        }
        else if (tagName === 'Eigenaar') {
            this.parkingData[this.currentID].push({ tag: 'schema:landlord', value: tagValue });
        }
        else if (tagName === 'Uitbater') {
            this.parkingData[this.currentID].push({ tag: 'manager', value: tagValue });
        }
    };
    DatasetAntwerpConverter.prototype.createJSONLD = function () {
        var _this = this;
        var graph = [];
        Object.keys(this.parkingData).forEach(function (index) {
            var parkingArray = _this.parkingData[index];
            var templateClass = new JSONLDTemplate_1.JSONLDTemplate();
            var parkingTemplate = templateClass.getTemplate();
            /*
            * Getting all the tags from array
            * */
            parkingTemplate['@id'] = _this.findElement(parkingArray, '@id').value;
            parkingTemplate['schema:name'] = _this.findElement(parkingArray, 'schema:name').value;
            parkingTemplate['schema:description'] = _this.findElement(parkingArray, 'schema:description').value;
            parkingTemplate['dcterms:identifier'] = _this.findElement(parkingArray, 'dcterms:identifier').value;
            parkingTemplate['schema:address']['schema:addressCountry'] = _this.findElement(parkingArray, 'schema:addressCountry').value;
            parkingTemplate['schema:address']['schema:postalCode'] = _this.findElement(parkingArray, 'schema:postalCode').value;
            parkingTemplate['schema:address']['schema:streetAddress'] = _this.findElement(parkingArray, 'schema:streetAddress').value;
            parkingTemplate['schema:geo']['schema:latitude'] = _this.findElement(parkingArray, 'schema:latitude').value;
            parkingTemplate['schema:geo']['schema:longitude'] = _this.findElement(parkingArray, 'schema:longitude').value;
            var publicAccess = _this.findElement(parkingArray, 'schema:publicAccess').value;
            if (publicAccess && publicAccess === 'Ja') {
                parkingTemplate['schema:publicAccess'] = 'true';
            }
            else {
                parkingTemplate['schema:publicAccess'] = 'false';
            }
            parkingTemplate['bp:state'] = _this.findElement(parkingArray, 'bp:state').value;
            parkingTemplate['schema:contactPoint']['schema:email'] = _this.findElement(parkingArray, 'schema:email').value;
            parkingTemplate['schema:contactPoint']['schema:telephone'] = _this.findElement(parkingArray, 'schema:telephone').value;
            parkingTemplate['schema:landlord'] = _this.findElement(parkingArray, 'schema:landlord').value;
            parkingTemplate['bp:manager']['schema:name'] = _this.findElement(parkingArray, 'manager').value;
            Object.keys(parkingArray['types']).forEach(function (index) {
                var type = parkingArray['types'][index];
                parkingTemplate['datex:parkingNumberOfSpaces'] = _this.findElement(parkingArray, 'max' + type).value;
                if (type === 'Auto') {
                    parkingTemplate['bp:vehicleType'] = 'schema:Car';
                }
                if (type === 'Fiets') {
                    parkingTemplate['bp:vehicleType'] = "bp:Bicycle";
                }
                if (type === 'Motor') {
                    parkingTemplate['bp:vehicleType'] = "schema:MotorCycle";
                }
                templateClass.removeEmptyFields();
                var copy = {};
                Object.assign(copy, parkingTemplate);
                graph.push(copy);
            });
        });
        var context = {
            "@context": {
                "schema": "http://schema.org/",
                "bp": "http://example.org/BikeProposal/",
                "datex": "http://vocab.datex.org/terms#",
                "dcterms": "http://purl.org/dc/terms/"
            }
        };
        var doc = {
            "@graph": graph
        };
        jsonld.compact(doc, context, function (err, compacted) {
            fs.writeFileSync('output/bikeparkingAntwerp.jsonld', JSON.stringify(compacted, null, 2));
        });
    };
    DatasetAntwerpConverter.prototype.findElement = function (array, tagName) {
        var element = array.filter(function (element) { return element.tag === tagName; })[0];
        if (element === undefined) {
            element = { tag: tagName, value: "" };
        }
        return element;
    };
    return DatasetAntwerpConverter;
}());
exports.DatasetAntwerpConverter = DatasetAntwerpConverter;
