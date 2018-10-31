import {Readable} from "stream";

export interface IConverter {
    parse();
    onTag(tagName: string, tagValue: string);
    createJSONLD();
    resolveAddress(streetaddress: string, postalCode: string, houseNumber: string);
}