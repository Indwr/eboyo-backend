// Converts numeric degrees to radians
let toRad =async(Value)=>{
    let finaltoRad= await Value * Math.PI / 180;//console.log("finaltoRad",finaltoRad);
    return finaltoRad
}
//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
calculateDistance = async function (lat1, lon1, lat2, lon2){
    console.log("calculateDistance",lat1, lon1, lat2, lon2);
    let R = 6371; // km
    // let dLat = await toRad(lat2-lat1);
    // let dLon = await toRad(lon2-lon1);
    //  lat1 = await toRad(lat1);
    //  lat2 = await toRad(lat2);
    let queryResult= await Promise.all([
        toRad(lat2-lat1),
        toRad(lon2-lon1),
        toRad(lat1),
        toRad(lat2),
    ])
    let dLat = queryResult[0];
    let dLon =  queryResult[1];
    lat1 =  queryResult[2];
    lat2 =  queryResult[3];  
    let a = await (Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2)); 
    let c = await (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))); 
    let d = await(R * c);
    return d.toFixed(2);
    //return true;
}

module.exports = {
    calculateDistance:calculateDistance, 
}