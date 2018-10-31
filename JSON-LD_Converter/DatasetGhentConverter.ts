import {IConverter} from "./IConverter";
import {JSONLDTemplate} from "./JSONLDTemplate";
import {isNumber} from "util";

const fs = require('fs');
const xmlReader = require('read-xml');
const path = require('path');
const xml2js = require('xml2js');
const jsonld = require('jsonld');
const fetch = require('isomorphic-fetch');
const SparqlHttp = require('sparql-http-client');


export class DatasetGhentConverter implements IConverter {
    private fileData: string;

    private parkingData: { [key: string]: Array<any> } = {};
    private currentID: string;

    private endpoint: any;

    constructor(filename: string) {
        SparqlHttp.fetch = fetch;
        this.endpoint = new SparqlHttp({endpointUrl: 'https://data.vlaanderen.be/sparql/'});


        const filePath = path.join(__dirname, filename);
        this.fileData = fs.readFileSync(filePath, 'ascii');
    }

    parse() {
        //let res: any = await this.resolveAddress('Koningin Maria Hendrikaplein', '9000', '70');
        //console.log(res.bindings.length);
        const parser = new xml2js.Parser();
        parser.parseString(this.fileData.substring(0, this.fileData.length), (err, res) => {
            if (err) {
                console.log(err);
            } else {
                const data = res.kml.Document[0].Folder[0].Placemark;
                Object.keys(data).forEach((index) => {
                    this.currentID = data[index]['$'].id;
                    if (!this.parkingData[this.currentID]) {
                        this.parkingData[this.currentID] = [];
                    }

                    //Tags
                    const parkingData = data[index].ExtendedData[0].SchemaData[0].SimpleData;
                    Object.keys(parkingData).forEach((parkingIndex) => {
                        const tagValue = parkingData[parkingIndex]['_'];
                        const tagName = parkingData[parkingIndex]['$'].name;
                        this.onTag(tagName, tagValue);
                    });

                    //Coordinates
                    let parkingCoordinates;
                    if (data[index].MultiGeometry) {
                        parkingCoordinates = data[index].MultiGeometry[0].Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates[0].split(' ');
                    } else {
                        parkingCoordinates = data[index].Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates[0].split(' ');
                    }
                    parkingCoordinates = parkingCoordinates[0].split(',');
                    this.parkingData[this.currentID].push({tag: 'schema:latitude', value: parkingCoordinates[1]});
                    this.parkingData[this.currentID].push({tag: 'schema:longitude', value: parkingCoordinates[0]});
                });
            }
        })

    }

    onTag(tagName: string, tagValue: string) {
        if (tagName === 'Straat') {
            this.parkingData[this.currentID].push({tag: 'schema:streetAddress', value: tagValue});
        } else if (tagName === 'Huisnr') {
            this.parkingData[this.currentID].push({tag: 'huisNR', value: tagValue});
        } else if (tagName === 'Karakter') {
            this.parkingData[this.currentID].push({tag: 'schema:addressCountry', value: tagValue});
        } else if (tagName === 'Eigenaar') {
            this.parkingData[this.currentID].push({tag: 'schema:landlord', value: tagValue});
        } else if (tagName === 'Capaciteit') {
            this.parkingData[this.currentID].push({tag: 'datex:parkingNumberOfSpaces', value: tagValue});
        } else if (tagName === 'Openbaar') {
            this.parkingData[this.currentID].push({tag: 'schema:publicAccess', value: tagValue});
        } else if (tagName === 'ID_Stalling') {
            this.parkingData[this.currentID].push({tag: 'dcterms:identifier', value: tagValue});
        } else if (tagName === 'Status') {
            this.parkingData[this.currentID].push({tag: 'bp:state', value: tagValue});
        }

        // Only tags that are present in the dataset of Ghent
        else if (tagName === 'Datum_Plaatsing') {
            this.parkingData[this.currentID].push({tag: 'gvb:datetimeOfPlacement', value: tagValue});
        } else if (tagName === 'Ondergrond') {
            this.parkingData[this.currentID].push({tag: 'gvb:surface', value: tagValue});
        } else if (tagName === 'Bestemming') {
            this.parkingData[this.currentID].push({tag: 'gvb:destination', value: tagValue});
        } else if (tagName === 'Goedkeuring_College') {
            this.parkingData[this.currentID].push({tag: 'gvb:datetimeOfApproval', value: tagValue});
        } else if (tagName === 'Laatste_Onderhoud') {
            this.parkingData[this.currentID].push({tag: 'gvb:lastMaintenance', value: tagValue});
        } else if (tagName === 'Datum_Herplaatsing') {
            this.parkingData[this.currentID].push({tag: 'gvb:dateOfRelocation', value: tagValue});
        } else if (tagName === 'Datum_Ontruiming') {
            this.parkingData[this.currentID].push({tag: 'gvb:dateOfRemoval', value: tagValue});
        }
    }

    createGraph(callback: (graph) => void) {
        let graph = [];
        Object.keys(this.parkingData).forEach(async (index) => {
            const parkingArray = this.parkingData[index];
            const templateClass = new JSONLDTemplate();
            let parkingTemplate = templateClass.getTemplate();

            /*
            *   Searching for the tags that we need in the template in the parkingArray
            * */
            parkingTemplate['dcterms:identifier'] = this.findElement(parkingArray, 'dcterms:identifier').value;

            // Data we need to get the URI of the address
            const street = this.findElement(parkingArray, 'schema:streetAddress').value;
            let houseNr: string = this.findElement(parkingArray, 'huisNR').value;
            if (houseNr.indexOf('/') > 0) {
                houseNr = houseNr.split('/')[0];
            }

            setTimeout(() => {
            }, 5000);

            let uri: any = await this.resolveAddress(street, '9000', houseNr);


            if (uri.results.bindings && uri.results.bindings.length > 0) {
                parkingTemplate['schema:address']['@id'] = uri.results.bindings[0].adr.value;
            }

            setTimeout(() => {
            }, 5000);

            parkingTemplate['schema:address']['schema:addressCountry'] = this.findElement(parkingArray, 'schema:addressCountry').value;
            ;
            parkingTemplate['schema:address']['schema:postalCode'] = this.findElement(parkingArray, 'schema:postalCode').value || '9000';
            parkingTemplate['schema:address']['schema:streetAddress'] = street + " " + this.findElement(parkingArray, 'huisNR').value;
            parkingTemplate['schema:geo']['schema:latitude'] = this.findElement(parkingArray, 'schema:latitude').value;
            parkingTemplate['schema:geo']['schema:longitude'] = this.findElement(parkingArray, 'schema:longitude').value;

            const publicAccess = this.findElement(parkingArray, 'schema:publicAccess').value;
            if (publicAccess && publicAccess === 'Ja') {
                parkingTemplate['schema:publicAccess'] = 'true';
            } else {
                parkingTemplate['schema:publicAccess'] = 'false';
            }

            parkingTemplate['bp:state'] = this.findElement(parkingArray, 'bp:state').value;
            parkingTemplate['schema:landlord'] = this.findElement(parkingArray, 'schema:landlord').value;

            /* Get tags specifc for Ghent */
            parkingTemplate['gvb:datetimeOfPlacement'] = this.findElement(parkingArray, 'gvb:datetimeOfPlacement').value;
            parkingTemplate['gvb:surface'] = this.findElement(parkingArray, 'gvb:surface').value;
            parkingTemplate['gvb:destination'] = this.findElement(parkingArray, 'gvb:destination').value;
            parkingTemplate['gvb:datetimeOfApproval'] = this.findElement(parkingArray, 'gvb:datetimeOfApproval').value;
            parkingTemplate['gvb:lastMaintenance'] = this.findElement(parkingArray, 'gvb:lastMaintenance').value;
            parkingTemplate['gvb:dateOfRelocation'] = this.findElement(parkingArray, 'gvb:dateOfRelocation').value;
            parkingTemplate['gvb:dateOfRemoval'] = this.findElement(parkingArray, 'gvb:dateOfRemoval').value;

            templateClass.removeEmptyFields();

            graph.push(parkingTemplate);

            if(graph.length == Object.keys(this.parkingData).length){
                callback(graph);
            }



        });
    }

    createJSONLD() {
        const context = {
            "@context": {
                "schema": "http://schema.org/",
                "bp": "http://example.org/BikeProposal/",
                "datex": "http://vocab.datex.org/terms#",
                "gvb": "http://example.org/GhentVocabulary/",
                "dcterms": "http://purl.org/dc/terms/"
            }
        };

        let doc = {
            "@graph": ""
        }

        this.createGraph( (graph => {
            doc['@graph'] = graph;

            jsonld.compact(doc, context, (err, compacted) => {
                fs.writeFileSync('output/bikeparkingGhent.jsonld', JSON.stringify(compacted, null, 2));
            });
        }));







    }

    private findElement(array: any[], tagName: string): any {
        let element = array.filter(element => element.tag === tagName)[0];
        if (element === undefined) {
            element = {tag: tagName, value: ""};
        }
        return element;
    }

    public async resolveAddress(streetaddress: string, postalCode: string, houseNumber: string) {
        let query = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
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

        let result = await new Promise(resolve => {
            this.endpoint.selectQuery(query).then((res) => {
                return res.text();
            }).then(body => {
                const result = JSON.parse(body);
                resolve(result);
            }).catch(err => {
                console.log(err);
            })
        });
        return result;
    }

}