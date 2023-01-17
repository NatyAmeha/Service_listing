export interface GeoSpacial{
    type : String 
    coordinates : number[]
}

export class Address{
    location? : GeoSpacial
    phoneNumber? : String
    localAddress? : String
}