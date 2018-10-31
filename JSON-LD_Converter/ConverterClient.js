"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DatasetAntwerpConverter_1 = require("./DatasetAntwerpConverter");
try {
    // TODO :
    // 1. Maybe standard opening hours?
    // 2. Use sparql to get an URI for the streetaddress
    //Ghent
    /*const GhentKMLConverter = new DatasetGhentConverter("files/Fietsenstallingen.kml");
    GhentKMLConverter.parse();
    GhentKMLConverter.createJSONLD();*/
    //Antwerp
    var AntwerpKMLConverter = new DatasetAntwerpConverter_1.DatasetAntwerpConverter('files/buurtparkings.kml');
    AntwerpKMLConverter.parse();
    AntwerpKMLConverter.createJSONLD();
}
finally {
}
