import {IConverter} from "./IConverter";

const fetch = require('isomorphic-fetch');
const SparqlHttp = require('sparql-http-client');


export abstract class Converter implements IConverter {

    constructor() {
        SparqlHttp.fetch = fetch;
    }

    abstract createGraph(callback: (graph) => void);
    abstract onTag(tagName: string, tagValue: string);
    abstract parse();

    public async resolveAddress(streetaddress: string, postalCode: string, houseNumber?: string) {
        let query = '';
        if(houseNumber !== ''){
            query = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
                '                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
                '                PREFIX adres: <http://data.vlaanderen.be/ns/adres#>\n' +
                '                 SELECT distinct ?adr WHERE {\n' +
                '                  ?adr a adres:Adres;\n' +
                '                       adres:heeftStraatnaam ?str;\n' +
                '                       adres:heeftPostinfo ?post.\n' +
                '                  ?str rdfs:label ?strLabel.\n' +
                '                  filter(STRSTARTS(str(?strLabel),"' + streetaddress + '")).\n' +
                '                  ?post adres:postcode "'+ postalCode + '".\n' +
                '                  ?adr adres:huisnummer "'+ houseNumber +'".\n' +
                '                 }\n' +
                '                 LIMIT 20';
        } else {
            query = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
                '                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
                '                PREFIX adres: <http://data.vlaanderen.be/ns/adres#>\n' +
                '                 SELECT distinct ?adr WHERE {\n' +
                '                  ?adr a adres:Adres;\n' +
                '                       adres:heeftStraatnaam ?str;\n' +
                '                       adres:heeftPostinfo ?post.\n' +
                '                  ?str rdfs:label ?strLabel.\n' +
                '                  filter(STRSTARTS(str(?strLabel),"' + streetaddress + '")).\n' +
                '                  ?post adres:postcode "'+ postalCode + '".\n' +
                '                 }\n' +
                '                 LIMIT 20';
        }


        let result = await new Promise(resolve => {
            const endpoint = new SparqlHttp({endpointUrl: 'https://data.vlaanderen.be/sparql/', headers :{ Origin : 'dwight.vanlancker@UGent.be'}});
            endpoint.selectQuery(query).then((res) => {
                return res.json();
            }).then(body => {
                //console.log(body);
                //const result = JSON.parse(body);
                resolve(body);
            }).catch(err => {
                //console.log(err);
            })
        });
        return result;
    }



}