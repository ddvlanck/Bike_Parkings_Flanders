
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

        "schema:dateModified" : "",
        "bp:dataOwner" : "",

        "schema:photos" : [
            {
                "@type": "schema:ImageObject",
                "schema:image" : ""
            },
            {
                "@type" : "schema:ImageObject",
                "schema:image" : ""
            }
        ],

        "dcterms:identifier" : "",
        "schema:name" : "",
        "schema:landlord" : "",
        "bp:manager" : "",

        "schema:address" : {
            "@type" : "schema:PostalAddress",
            "@id" : "",
            "schema:addressCountry" : "",
            "schema:postalCode" : "",
            "schema:streetAddress" : ""
        },
        "schema:geo" : [
            {
                "@type" : "schema:GeoCoordinates",
                "schema:description" : "",
                "schema:latitude" : "",
                "schema:longitude" : ""
            },
            {
                "@type" : "schema:GeoShape",
                "schema:polygon" : ""
            }
        ],
        "bp:entranceLocation" : {
            "@type" : "schema:GeoCoordinates",
            "schema:description" : "",
            "schema:latitude" : "",
            "schema:longitude" : ""
        },
        "foaf:based_near" : "",
        "bp:numberOfFloors" : "",
        "schema:map" : {
            "@type" : "schema:URL",
            "schema:url" : ""
        },

        "schema:startDate" : "",
        "schema:endDate" : "",
        "schema:openingHours" : "",

        "schema:contactPoint" : {
            "@type" : "schema:ContactPoint",
            "schema:email" : "",
            "schema:telephone" : "",
            "schema:interactionService" : {
                "@type" : "schema:WebSite",
                "schema:url" : ""
            }
        },

        "bp:vehicleType" : "",
        "bp:storageType" : "",
        "bp:regulations" : "",

        "bp:accessType" : "",
        "bp:firstUse" : {
            "@type" : "schema:WebSite",
            "schema:url" : ""
        },
        "bp:securityMeasures" : "",
        "bp:cameraSurveillance" : "",

        "bp:maintenanceOperator" : "",

        "schema:publicAccess" : "",
        "schema:isAccessibleForFree" : "",
        "schema:currency" : "",
        "bp:unit" : "",
        "schema:price" : "",
        "bp:warrantyCost": "",
        "bp:warrantyForKey" : "",

        "datex:parkingNumberOfSpaces" : "",
        "datex:numberOfVacantParkingSpace" : "",
        "schema:amenityFeature": [
            {
                "@type" : "schema:LocationFeatureSpecification",
                "schema:description" : "Pumps"
            },
            {
                "@type" : "schema:LocationFeatureSpecification",
                "schema:description" : "Bicycle repair"
            }
        ]

    };
}