export interface GeoSpacial{
    type? : String 
    coordinates? : number[]
}

export class Address{
    _id? : String
    location? : GeoSpacial
    mapLink? : String
    localAddress? : String
} 