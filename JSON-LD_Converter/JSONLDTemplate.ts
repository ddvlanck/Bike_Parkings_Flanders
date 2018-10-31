
export class JSONLDTemplate {

    constructor(){}

    public getTemplate(){
        return this.template;
    }

    public removeEmptyFields(){
        Object.keys(this.template).forEach( (key) => {
            if(typeof this.template[key] === 'object'){
                Object.keys(this.template[key]).forEach( (key2) => {
                    if(this.template[key][key2] === ''){
                        delete this.template[key][key2];
                    }
                });

                // If only the @type field is left, we can remove the whole tag
                if(Object.keys(this.template[key]).length === 1){
                    delete this.template[key];
                }

            } else if(this.template[key] === ''){
                delete this.template[key];
            }
        });
    }

    private template = {
        "@type" : "schema:ParkingFacility",
        "@id" : "",
        "schema:name" : "",
        "schema:description" : "",
        "dcterms:identifier" : "",
        "bp:vehicleType" : "",
        "datex:numberOfVacantParkingSpaces" : "",
        "datex:parkingNumberOfSpaces" : "",
        "schema:address" : {
            "@type" : "schema:PostalAddress",
            "@id" : "",
            "schema:addressCountry" : "",
            "schema:postalCode" : "",
            "schema:streetAddress" : ""
        },
        "schema:geo" : {
            "@type" : "schema:GeoCoordinates",
            "schema:latitude" : "",
            "schema:longitude" : ""
        },
        "schema:publicAccess" : "",
        "schema:isAccessibleForFree" : "",
        "schema:price" : "",

        "schema:openingHours" : "",
        "bp:state" : "",
        "schema:contactPoint" : {
            "@type" : "schema:ContactPoint",
            "schema:email" : "",
            "schema:telephone" : ""
        },
        "schema:landlord" : "",
        "bp:manager" : {
            "@type" : "schema:Organization",
            "schema:name" : ""
        }
    };
}