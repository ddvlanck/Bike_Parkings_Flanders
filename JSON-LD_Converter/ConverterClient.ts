import {DatasetAntwerpConverter} from "./DatasetAntwerpConverter";
import {DatasetGhentConverter} from "./DatasetGhentConverter";
import {JSONLDTemplate} from "./JSONLDTemplate";
import * as fs from "fs";

try {

    // TODO :
    // 1. Maybe standard opening hours?
    // 2. Use sparql to get an URI for the streetaddress

    //Ghent
    const GhentKMLConverter = new DatasetGhentConverter("files/Fietsenstallingen.kml");
    GhentKMLConverter.parse();
    GhentKMLConverter.createJSONLD();

    //Antwerp
    /*const AntwerpKMLConverter = new DatasetAntwerpConverter('files/buurtparkings.kml');
    AntwerpKMLConverter.parse();
    AntwerpKMLConverter.createJSONLD();*/

} finally {

}