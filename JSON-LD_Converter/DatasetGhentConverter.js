"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var fs = require('fs');
var xmlReader = require('read-xml');
var path = require('path');
var xml2js = require('xml2js');
var jsonld = require('jsonld');
var _a = require('sparql-client-2'), SparqlClient = _a.SparqlClient, SPARQL = _a.SPARQL;
var DatasetGhentConverter = /** @class */ (function () {
    function DatasetGhentConverter(filename) {
        this.parkingData = {};
        var filePath = path.join(__dirname, filename);
        this.fileData = fs.readFileSync(filePath, 'ascii');
    }
    DatasetGhentConverter.prototype.parse = function () {
        //let res: any = await this.resolveAddress('Koningin Maria Hendrikaplein', '9000', '70');
        //console.log(res.bindings.length);
        var _this = this;
        var parser = new xml2js.Parser();
        parser.parseString(this.fileData.substring(0, this.fileData.length), function (err, res) {
            if (err) {
                console.log(err);
            }
            else {
                var data_1 = res.kml.Document[0].Folder[0].Placemark;
                Object.keys(data_1).forEach(function (index) {
                    _this.currentID = data_1[index]['$'].id;
                    if (!_this.parkingData[_this.currentID]) {
                        _this.parkingData[_this.currentID] = [];
                    }
                    //Tags
                    var parkingData = data_1[index].ExtendedData[0].SchemaData[0].SimpleData;
                    Object.keys(parkingData).forEach(function (parkingIndex) {
                        var tagValue = parkingData[parkingIndex]['_'];
                        var tagName = parkingData[parkingIndex]['$'].name;
                        _this.onTag(tagName, tagValue);
                    });
                    //Coordinates
                    var parkingCoordinates;
                    if (data_1[index].MultiGeometry) {
                        parkingCoordinates = data_1[index].MultiGeometry[0].Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates[0].split(' ');
                    }
                    else {
                        parkingCoordinates = data_1[index].Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates[0].split(' ');
                    }
                    parkingCoordinates = parkingCoordinates[0].split(',');
                    _this.parkingData[_this.currentID].push({ tag: 'schema:latitude', value: parkingCoordinates[1] });
                    _this.parkingData[_this.currentID].push({ tag: 'schema:longitude', value: parkingCoordinates[0] });
                });
            }
        });
    };
    DatasetGhentConverter.prototype.onTag = function (tagName, tagValue) {
        if (tagName === 'Straat') {
            this.parkingData[this.currentID].push({ tag: 'schema:streetAddress', value: tagValue });
        }
        else if (tagName === 'Huisnr') {
            this.parkingData[this.currentID].push({ tag: 'huisNR', value: tagValue });
        }
        else if (tagName === 'Karakter') {
            this.parkingData[this.currentID].push({ tag: 'schema:addressCountry', value: tagValue });
        }
        else if (tagName === 'Eigenaar') {
            this.parkingData[this.currentID].push({ tag: 'schema:landlord', value: tagValue });
        }
        else if (tagName === 'Capaciteit') {
            this.parkingData[this.currentID].push({ tag: 'datex:parkingNumberOfSpaces', value: tagValue });
        }
        else if (tagName === 'Openbaar') {
            this.parkingData[this.currentID].push({ tag: 'schema:publicAccess', value: tagValue });
        }
        else if (tagName === 'ID_Stalling') {
            this.parkingData[this.currentID].push({ tag: 'dcterms:identifier', value: tagValue });
        }
        else if (tagName === 'Status') {
            this.parkingData[this.currentID].push({ tag: 'bp:state', value: tagValue });
        }
        // Only tags that are present in the dataset of Ghent
        else if (tagName === 'Datum_Plaatsing') {
            this.parkingData[this.currentID].push({ tag: 'gvb:datetimeOfPlacement', value: tagValue });
        }
        else if (tagName === 'Ondergrond') {
            this.parkingData[this.currentID].push({ tag: 'gvb:surface', value: tagValue });
        }
        else if (tagName === 'Bestemming') {
            this.parkingData[this.currentID].push({ tag: 'gvb:destination', value: tagValue });
        }
        else if (tagName === 'Goedkeuring_College') {
            this.parkingData[this.currentID].push({ tag: 'gvb:datetimeOfApproval', value: tagValue });
        }
        else if (tagName === 'Laatste_Onderhoud') {
            this.parkingData[this.currentID].push({ tag: 'gvb:lastMaintenance', value: tagValue });
        }
        else if (tagName === 'Datum_Herplaatsing') {
            this.parkingData[this.currentID].push({ tag: 'gvb:dateOfRelocation', value: tagValue });
        }
        else if (tagName === 'Datum_Ontruiming') {
            this.parkingData[this.currentID].push({ tag: 'gvb:dateOfRemoval', value: tagValue });
        }
    };
    DatasetGhentConverter.prototype.createJSONLD = function () {
        return __awaiter(this, void 0, void 0, function () {
            var uri;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('OPZOEKEN URI');
                        return [4 /*yield*/, new Promise(function (resolve) { return _this.resolveAddress('Tolpoort', '9000', '2'); })];
                    case 1:
                        uri = _a.sent();
                        console.log(uri);
                        return [2 /*return*/];
                }
            });
        });
    };
    DatasetGhentConverter.prototype.findElement = function (array, tagName) {
        var element = array.filter(function (element) { return element.tag === tagName; })[0];
        if (element === undefined) {
            element = { tag: tagName, value: "" };
        }
        return element;
    };
    DatasetGhentConverter.prototype.resolveAddress = function (streetaddress, postalCode, houseNumber) {
        return new Promise(function (resolve) {
            var client = new SparqlClient('https://data.vlaanderen.be/sparql');
            client.query(SPARQL(templateObject_1 || (templateObject_1 = __makeTemplateObject(["PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n                            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n                            PREFIX adres: <http://data.vlaanderen.be/ns/adres#>\n\n                            SELECT distinct ?adr WHERE {\n                                   ?adr a adres:Adres;\n                                        adres:heeftStraatnaam ?str;\n                                        adres:heeftPostinfo ?post.\n                                   ?str rdfs:label ?strLabel.\n                                   filter(STRSTARTS(str(?strLabel),\" + streetaddress + \")).\n                                   ?post adres:postcode \" + postalCode + \".\n                                   ?adr adres:huisnummer \" + houseNumber + \" .\n                            }\n                            LIMIT 20"], ["PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n                            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n                            PREFIX adres: <http://data.vlaanderen.be/ns/adres#>\n\n                            SELECT distinct ?adr WHERE {\n                                   ?adr a adres:Adres;\n                                        adres:heeftStraatnaam ?str;\n                                        adres:heeftPostinfo ?post.\n                                   ?str rdfs:label ?strLabel.\n                                   filter(STRSTARTS(str(?strLabel),\" + streetaddress + \")).\n                                   ?post adres:postcode \" + postalCode + \".\n                                   ?adr adres:huisnummer \" + houseNumber + \" .\n                            }\n                            LIMIT 20"])))).execute().then(function (response) {
                resolve(response.results);
            }, function (err) {
                console.log('' + err);
            });
        });
    };
    return DatasetGhentConverter;
}());
exports.DatasetGhentConverter = DatasetGhentConverter;
var templateObject_1;
