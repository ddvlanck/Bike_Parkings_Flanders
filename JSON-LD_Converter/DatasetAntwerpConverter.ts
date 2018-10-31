import {IConverter} from "./IConverter";
import {JSONLDTemplate} from "./JSONLDTemplate";
const fs = require('fs');
const xmlReader = require('read-xml');
const path = require('path');
const xml2js = require('xml2js');
const jsonld = require('jsonld');

export class DatasetAntwerpConverter implements IConverter {
    private fileData: string;

    /**
     * The key will be the ID of the parking
     * The array contains objects the contain a tagname and a tagvalue
     * **/
    private parkingData: { [key: string]: Array<any> } = {};
    private currentID: string;


    constructor(filename: string){
        const filePath = path.join(__dirname, filename);
        this.fileData = fs.readFileSync(filePath, 'ascii');
    }


    public parse() {
        const parser = new xml2js.Parser();
        parser.parseString(this.fileData.substring(0, this.fileData.length), (err, res) => {
            const data = res.kml.Document[0].Folder[0].Placemark;
            Object.keys(data).forEach( (index) => {
                //Tags
                const parkingData = data[index].ExtendedData[0].SchemaData[0].SimpleData;
                Object.keys(parkingData).forEach( (parkingIndex) => {
                    const tagValue = parkingData[parkingIndex]['_'];
                    const tagName = parkingData[parkingIndex]['$'].name;
                    if(tagName === 'OBJECTID'){
                        this.parkingData[tagValue] = [];
                        this.currentID = tagValue;
                        this.parkingData[this.currentID].push({tag: 'dcterms:identifier', value: tagValue});
                    } else {
                        this.onTag(tagName, tagValue);
                    }
                });
                //Coordinates
                const coordinates = data[index].Point[0].coordinates[0].split(',');
                this.parkingData[this.currentID].push({tag: 'schema:latitude', value: coordinates[1]});
                this.parkingData[this.currentID].push({tag: 'schema:longitude', value: coordinates[0]});
            })
        })
    }

    /*
    * Change the tags for other documents
    * */
    public onTag(tagName: string, tagValue: string) {
        if(tagName === 'Max_Auto'){
            if(!this.parkingData[this.currentID]['types']){
                this.parkingData[this.currentID]['types'] = [];
            }
            this.parkingData[this.currentID]['types'].push('Auto');
            this.parkingData[this.currentID].push({tag: 'maxAuto', value: tagValue});
        } else if(tagName === 'Max_Fiets') {
            if (!this.parkingData[this.currentID]['types']) {
                this.parkingData[this.currentID]['types'] = [];
            }
            this.parkingData[this.currentID]['types'].push('Fiets');
            this.parkingData[this.currentID].push({tag: 'maxFiets', value: tagValue});
        } else if(tagName === 'Max_Motor'){
            if (!this.parkingData[this.currentID]['types']) {
                this.parkingData[this.currentID]['types'] = [];
            }
            this.parkingData[this.currentID]['types'].push('Motor');
            this.parkingData[this.currentID].push({tag: 'maxMotor', value: tagValue});

        } else if(tagName === 'Link'){
            this.parkingData[this.currentID].push({tag: '@id', value: tagValue});

        } else if(tagName === 'District'){
            this.parkingData[this.currentID].push({tag: 'schema:addressCountry', value: tagValue});

        } else if(tagName === 'Postcode'){
            this.parkingData[this.currentID].push({tag: 'schema:postalCode', value: tagValue});

        } else if(tagName === 'Straat'){
            this.parkingData[this.currentID].push({tag: 'schema:streetAddress', value: tagValue});

        } else if(tagName === 'Openbaar'){
            this.parkingData[this.currentID].push({tag: 'schema:publicAccess', value: tagValue});

        } else if(tagName === 'GEBRUIK'){
            this.parkingData[this.currentID].push({tag: 'bp:state', value: tagValue});

        } else if(tagName === 'Email'){
            this.parkingData[this.currentID].push({tag: 'schema:email', value: tagValue});

        } else if(tagName === 'Telefoon'){
            this.parkingData[this.currentID].push({tag: 'schema:telephone', value: tagValue});

        } else if(tagName === 'NAAM'){
            this.parkingData[this.currentID].push({tag : 'schema:name', value: tagValue});

        } else if(tagName === 'Eigenaar'){
            this.parkingData[this.currentID].push({tag: 'schema:landlord', value: tagValue});

        } else if(tagName === 'Uitbater'){
            this.parkingData[this.currentID].push({tag : 'manager', value: tagValue});
        }

    }

    public createJSONLD() {
        let graph = [];
        Object.keys(this.parkingData).forEach( (index) => {
            const parkingArray = this.parkingData[index];
            const templateClass = new JSONLDTemplate();
            let parkingTemplate = templateClass.getTemplate();

            /*
            * Getting all the tags from array
            * */
            parkingTemplate['@id'] = this.findElement(parkingArray, '@id').value;
            parkingTemplate['schema:name'] = this.findElement(parkingArray, 'schema:name').value;
            parkingTemplate['schema:description'] = this.findElement(parkingArray, 'schema:description').value;
            parkingTemplate['dcterms:identifier'] = this.findElement(parkingArray, 'dcterms:identifier').value;
            parkingTemplate['schema:address']['schema:addressCountry'] = this.findElement(parkingArray, 'schema:addressCountry').value;
            parkingTemplate['schema:address']['schema:postalCode'] = this.findElement(parkingArray, 'schema:postalCode').value;
            parkingTemplate['schema:address']['schema:streetAddress'] = this.findElement(parkingArray, 'schema:streetAddress').value;
            parkingTemplate['schema:geo']['schema:latitude'] = this.findElement(parkingArray, 'schema:latitude').value;
            parkingTemplate['schema:geo']['schema:longitude'] = this.findElement(parkingArray, 'schema:longitude').value;

            const publicAccess =  this.findElement(parkingArray, 'schema:publicAccess').value;
            if(publicAccess && publicAccess === 'Ja'){
                parkingTemplate['schema:publicAccess'] = 'true';
            } else {
                parkingTemplate['schema:publicAccess'] = 'false';
            }

            parkingTemplate['bp:state'] = this.findElement(parkingArray, 'bp:state').value;
            parkingTemplate['schema:contactPoint']['schema:email'] = this.findElement(parkingArray, 'schema:email').value;
            parkingTemplate['schema:contactPoint']['schema:telephone'] = this.findElement(parkingArray, 'schema:telephone').value;
            parkingTemplate['schema:landlord'] = this.findElement(parkingArray, 'schema:landlord').value;
            parkingTemplate['bp:manager']['schema:name'] = this.findElement(parkingArray, 'manager').value;

            Object.keys(parkingArray['types']).forEach( (index) => {
                const type = parkingArray['types'][index];
                parkingTemplate['datex:parkingNumberOfSpaces'] = this.findElement(parkingArray, 'max' + type).value;

                if(type === 'Auto'){
                    parkingTemplate['bp:vehicleType'] = 'schema:Car';
                }

                if(type === 'Fiets'){
                    parkingTemplate['bp:vehicleType'] = "bp:Bicycle";
                }

                if(type === 'Motor'){
                    parkingTemplate['bp:vehicleType'] = "schema:MotorCycle";
                }

                templateClass.removeEmptyFields();

                let copy = {};
                Object.assign(copy, parkingTemplate);

                graph.push(copy);
            });
        });

        let context = {
            "@context" : {
                "schema" : "http://schema.org/",
                "bp" : "http://example.org/BikeProposal/",
                "datex": "http://vocab.datex.org/terms#",
                "dcterms" : "http://purl.org/dc/terms/"
            }
        };

        let doc = {
            "@graph" : graph
        }

        jsonld.compact(doc, context, (err, compacted) => {
            fs.writeFileSync('output/bikeparkingAntwerp.jsonld', JSON.stringify(compacted, null, 2));
        })
    }


    private findElement(array: any[], tagName: string): any {
        let element = array.filter( element => element.tag === tagName)[0];
        if(element === undefined){
            element = {tag: tagName, value: ""};
        }
        return element;
    }

    createGraph(callback: (graph) => void) {
    }

    resolveAddress(streetaddress: string, postalCode: string, houseNumber: string) {
    }



}