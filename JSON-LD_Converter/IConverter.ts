import {Readable} from "stream";

export interface IConverter {
    parse();
    onTag(tagName: string, tagValue: string);
    createGraph( callback: (graph) => void);
    resolveAddress(streetaddress: string, postalCode: string, houseNumber?: string);
}