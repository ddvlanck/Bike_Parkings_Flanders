"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var JSONLDTemplate_1 = require("./JSONLDTemplate");
var fs = require('fs');
var xmlReader = require('read-xml');
var path = require('path');
var xml2js = require('xml2js');
var jsonld = require('jsonld');
var fetch = require('isomorphic-fetch');
var SparqlHttp = require('sparql-http-client');
var DatasetAntwerpConverter = /** @class */ (function () {
    function DatasetAntwerpConverter(filename) {
        /**
         * The key will be the ID of the parking
         * The array contains objects the contain a tagname and a tagvalue
         * **/
        this.parkingData = {};
        SparqlHttp.fetch = fetch;
        this.endpoint = new SparqlHttp({ endpointUrl: 'https://data.vlaanderen.be/sparql/' });
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
        var context = {
            "@context": {
                "schema": "http://schema.org/",
                "bp": "http://example.org/BikeProposal/",
                "datex": "http://vocab.datex.org/terms#",
                "dcterms": "http://purl.org/dc/terms/"
            }
        };
        var doc = {
            "@graph": ""
        };
        this.createGraph(function (graph) {
            doc["@graph"] = graph;
            jsonld.compact(doc, context, function (err, compacted) {
                fs.writeFileSync('output/bikeparkingAntwerp.jsonld', JSON.stringify(compacted, null, 2));
            });
        });
    };
    DatasetAntwerpConverter.prototype.createGraph = function (callback) {
        var _this = this;
        var graph = [];
        var counter = 0; // We have to use a counter here, because sometimes multiple instance of 1 parking will be created
        // according to the allowed vehicles
        Object.keys(this.parkingData).forEach(function (index) { return __awaiter(_this, void 0, void 0, function () {
            var parkingArray, templateClass, parkingTemplate, streetAddress, postalCode, street, houseNr, uri, publicAccess;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parkingArray = this.parkingData[index];
                        templateClass = new JSONLDTemplate_1.JSONLDTemplate();
                        parkingTemplate = templateClass.getTemplate();
                        /*
                        * Getting all the tags from array
                        * */
                        parkingTemplate['@id'] = this.findElement(parkingArray, '@id').value;
                        parkingTemplate['schema:name'] = this.findElement(parkingArray, 'schema:name').value;
                        parkingTemplate['schema:description'] = this.findElement(parkingArray, 'schema:description').value;
                        parkingTemplate['dcterms:identifier'] = this.findElement(parkingArray, 'dcterms:identifier').value;
                        streetAddress = this.findElement(parkingArray, 'schema:streetAddress').value;
                        postalCode = this.findElement(parkingArray, 'schema:postalCode').value;
                        if (streetAddress.split(' ').length == 2) {
                            street = streetAddress.split(' ')[0];
                            houseNr = streetAddress.split(' ')[1];
                        }
                        else {
                            street = streetAddress;
                            houseNr = 1;
                        }
                        parkingTemplate['schema:address']['schema:addressCountry'] = this.findElement(parkingArray, 'schema:addressCountry').value;
                        parkingTemplate['schema:address']['schema:postalCode'] = postalCode;
                        parkingTemplate['schema:address']['schema:streetAddress'] = streetAddress;
                        setTimeout(function () {
                        }, 5000);
                        return [4 /*yield*/, this.resolveAddress(street, postalCode, houseNr)];
                    case 1:
                        uri = _a.sent();
                        if (uri.results.bindings && uri.results.bindings.length > 0) {
                            parkingTemplate['schema:address']['@id'] = uri.results.bindings[0].adr.value;
                        }
                        setTimeout(function () {
                        }, 5000);
                        parkingTemplate['schema:geo']['schema:latitude'] = this.findElement(parkingArray, 'schema:latitude').value;
                        parkingTemplate['schema:geo']['schema:longitude'] = this.findElement(parkingArray, 'schema:longitude').value;
                        publicAccess = this.findElement(parkingArray, 'schema:publicAccess').value;
                        if (publicAccess && publicAccess === 'Ja') {
                            parkingTemplate['schema:publicAccess'] = 'true';
                        }
                        else {
                            parkingTemplate['schema:publicAccess'] = 'false';
                        }
                        parkingTemplate['bp:state'] = this.findElement(parkingArray, 'bp:state').value;
                        parkingTemplate['schema:contactPoint']['schema:email'] = this.findElement(parkingArray, 'schema:email').value;
                        parkingTemplate['schema:contactPoint']['schema:telephone'] = this.findElement(parkingArray, 'schema:telephone').value;
                        parkingTemplate['schema:landlord'] = this.findElement(parkingArray, 'schema:landlord').value;
                        parkingTemplate['bp:manager']['schema:name'] = this.findElement(parkingArray, 'manager').value;
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
                        counter++;
                        if (counter == Object.keys(this.parkingData).length) {
                            callback(graph);
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    };
    DatasetAntwerpConverter.prototype.resolveAddress = function (streetaddress, postalCode, houseNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var query, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
                            'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
                            'PREFIX adres: <http://data.vlaanderen.be/ns/adres#>\n' +
                            '\n' +
                            ' SELECT distinct ?adr WHERE {\n' +
                            '  ?adr a adres:Adres;\n' +
                            '       adres:heeftStraatnaam ?str;\n' +
                            '       adres:heeftPostinfo ?post.\n' +
                            '  ?str rdfs:label ?strLabel.\n' +
                            '  filter(STRSTARTS(str(?strLabel),"' + streetaddress + '")).\n' +
                            '  ?post adres:postcode "' + postalCode + '".\n' +
                            '  ?adr adres:huisnummer "' + houseNumber + '".\n' +
                            ' } \n' +
                            ' LIMIT 20';
                        return [4 /*yield*/, new Promise(function (resolve) {
                                _this.endpoint.selectQuery(query).then(function (res) {
                                    return res.text();
                                }).then(function (body) {
                                    var result = JSON.parse(body);
                                    resolve(result);
                                }).catch(function (err) {
                                    console.log(err);
                                });
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
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
