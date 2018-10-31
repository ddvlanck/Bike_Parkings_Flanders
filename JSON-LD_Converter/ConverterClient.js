"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DatasetGhentConverter_1 = require("./DatasetGhentConverter");
try {
    // TODO :
    // 1. Maybe standard opening hours?
    // 2. Use sparql to get an URI for the streetaddress
    //Ghent
    var GhentKMLConverter = new DatasetGhentConverter_1.DatasetGhentConverter("files/Fietsenstallingen.kml");
    GhentKMLConverter.parse();
    GhentKMLConverter.createJSONLD();
    //Antwerp
    /*const AntwerpKMLConverter = new DatasetAntwerpConverter('files/buurtparkings.kml');
    AntwerpKMLConverter.parse();
    AntwerpKMLConverter.createJSONLD();*/
}
finally {
}
