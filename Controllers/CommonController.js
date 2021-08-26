/**
 * Created by Anurag on 15/04/19.
 */
const Path = require('path');
const _ = require('underscore');
const { v4: uuidv4 } = require('uuid');
//const fs = require('fs').promises;
//const readFilePromise = require('fs-readfile-promise');
const Mongoose = require('mongoose');
var pdf = require("pdf-creator-node");
var fs = require("fs");
const Service = require('../Services');
const Models  = require('../Models');
const Config = require('../Config');
const UniversalFunctions      = require('../Utils/UniversalFunctions');
const readFilePromise = require('fs-readfile-promise');


const APP_CONSTANTS   =  Config.APP_CONSTANTS;
const DEVICE_TYPES    =  APP_CONSTANTS.DEVICE_TYPES;
//const ALLOWED_DOC_EXT_DRIVER    =  APP_CONSTANTS.ALLOWED_DOC_EXT_DRIVER;
const STATUS_MSG      =  APP_CONSTANTS.STATUS_MSG;
const SOCIAL_MODE_TYPE       =  APP_CONSTANTS.SOCIAL_MODE_TYPE;
//const ALLOWED_IMAGE_EXT      =  APP_CONSTANTS.ALLOWED_IMAGE_EXT;
//const DOCUMENT_IMAGES_PREFIX =  APP_CONSTANTS.DOCUMENT_IMAGES_PREFIX;
const DOCUMENT_FILE_SIZE = APP_CONSTANTS.DOCUMENT_FILE_SIZE;


let getCatgory = async (payloadData,UserData)=> { console.log("getCatgory==init");
   try {
     let criteria = {"isDeleted" : false}
     let projection = {createdAt:0,updatedAt:0,__v:0}
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true,sort:{categoryName:1}}
    let queryResult= await Promise.all([
      Service.CategoryService.getData(criteria, projection, {}),
      Service.CategoryService.getData(criteria, projection, options)
    ]);
    let totalCount = queryResult[0] || [];
    return {
      totalCount:totalCount.length,
      categoryData:queryResult[1] || []
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}
let getRestaurant = async (payloadData,UserData)=> {
  let projection = {
    createdAt:0,
    updatedAt:0,
    __v:0,
    adminCommssionType:0,
    email:0,password:0,
    accessToken:0,deviceToken:0,deviceType:0,deliveryServiceArea:0
  }
  let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true,sort:{categoryName:1}}
  try{
    let nearByRestaurant = await checkPointExistInPolygon(payloadData,UserData);
    let restaurantWorkingId = [];
    if(nearByRestaurant.length>0){
      restaurantWorkingId = await checkRestaurantWorking(nearByRestaurant);
      if(restaurantWorkingId.length>0){
        let criteria3 = {_id:{$in:restaurantWorkingId}}
        let queryResult= await Promise.all([
          Service.RestaurantService.getData(criteria3, projection, {}),
          Service.RestaurantService.getData(criteria3, projection, options),
          Service.RestaurantService.getData(criteria3, projection, options),
        ]);
        let finalData=[]
        for(let element of queryResult[1]){ //console.log("element",element);
          let tempData= element;
          let menuC = {"availabilityStatus" : true,"isDeleted" : false,restaurant:element._id};
          let promocodeC= {
            restaurant:{$in:element._id},
            //isDeleted:false
          };
          let workingC= {restaurant:element._id}
          let queryRes= await Promise.all([            
            Service.RestaurantMenuService.getData(menuC,{menuName:1,},{lean:true,skip:0,limit:5}),
            //Service.RestaurantWorkingTimeService.getData(workingC, {__v:0,restaurant:0}, {lean:true}),
            Service.PromoCodeService.getData(promocodeC, {__v:0,restaurant:0,customer:0}, {lean:true,skip:0,limit:2}),
          ]);
          tempData.menuList = queryRes[0];
          //tempData.WorkingTime = queryRes[1];
          tempData.promoCode = queryRes[1];
          finalData.push(tempData);  
        }
        let totalCount = queryResult[0] || [];
        return {
          totalCount:totalCount.length,
          restaurantData:finalData || [],
          topPicks: queryResult[2] || []
        };
      }
    } 
    return {
      totalCount:0,
      restaurantData: []
    }
  }catch(error){
    throw error;
  }
}

let getNearByRestaurant =async (payloadData,UserData)=> {
  let restaurantId = []
  try{
    let criteria = {
      $geoNear: {
          near: {
              type: "Point",
              coordinates: [payloadData.longitude,payloadData.latitude] //[ 76.83091565966606, 30.733033957112543 ]
          },
          distanceField: "dist.calculated",
          maxDistance: 5000,
          query: {}, //"busy":false,Islogin:true,Isverified:true,IsBlock:false
          distanceMultiplier: 0.001,
          includeLocs: "dist.location",
          $limit: 50,
          spherical: true
      }
    }
    let checkPointExistsInPolygonOrNot = await Service.RestaurantService.aggregateQuery([criteria]);
    if(checkPointExistsInPolygonOrNot.length>0){
      for(let element of checkPointExistsInPolygonOrNot){
        for(let innerElement of element.restaurant){ 
          restaurantId.push(innerElement)
        }//restaurantId.push(element._id)
      }
    }
    console.log("restaurantId",restaurantId);
    return restaurantId;
  }catch(error){
    throw error;
  }

}

let checkPointExistInPolygon=async (payloadData,UserData)=> {
  let restaurantId = []; 
  try{
    let criteria = {
      //"_id" : ObjectId("5ffadb2020323b8aeacff428"),
      //"isDeleted" : false,
      deliveryServiceArea: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [payloadData.longitude,payloadData.latitude]// [76.3762860641881,27.739843018855876 ]
          }
        }
      },
    }
    let checkPointExistsInPolygonOrNot = await Service.RestaurantAreaService.getData(criteria,{}, {lean:true});
    if(checkPointExistsInPolygonOrNot.length>0){
      for(let element of checkPointExistsInPolygonOrNot){ 
        for(let innerElement of element.restaurant){ 
          restaurantId.push(innerElement)
        }//console.log("checkPointExistInPolygon==element",element.restaurant);
      }
    };console.log("checkPointExistInPolygon",restaurantId);
    return restaurantId;
  }catch(error){
    throw error;
  }

}

let checkRestaurantWorking = async(nearByRestaurant)=>{
  let criteria2 = {restaurant:{$in:nearByRestaurant},
    //"dayName": payloadData.dayName  
  }
  let restaurantId= []
  try{
    let restaurant = await Service.RestaurantWorkingTimeService.getData(criteria2,{},{lean:true});
    for(let element of restaurant){ //console.log("checkRestaurantWorking===element==182",element); 
      restaurantId.push(element.restaurant)
    }; //console.log("restaurantId",restaurantId);
    return restaurantId;
  }catch(error){
    throw error;
  }
}



let getRestaurant_old = async (payloadData,UserData)=> { 
  /*
  var criteria = {
    //"_id" : ObjectId("5ffadb2020323b8aeacff428"),
    "isDeleted" : false,
    deliveryServiceArea: {
      $geoIntersects: {
        $geometry: {
          type: "Point",
          coordinates: [76.3762860641881,27.739843018855876 ]
        }
      }
    },
  } */
  let criteria = {
    $geoNear: {
        near: {
            type: "Point",
            coordinates: [payloadData.longitude,payloadData.latitude] //[ 76.83091565966606, 30.733033957112543 ]
        },
        distanceField: "dist.calculated",
        maxDistance: 5000,
        query: {"busy":false,Islogin:true,Isverified:true,IsBlock:false},
        distanceMultiplier: 0.001,
        includeLocs: "dist.location",
        num: 50,
        spherical: true
    }
  }
   
  try {
    //let criteria = {"isDeleted" : false}
    
    let projection = {
      createdAt:0,
      updatedAt:0,
      __v:0,
      adminCommssionType:0,
      email:0,password:0,
      accessToken:0,deviceToken:0,deviceType:0,
    }
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true,sort:{categoryName:1}}
    let queryResult= await Promise.all([
      Service.RestaurantService.getData(criteria, projection, {}),
      Service.RestaurantService.getData(criteria, projection, options)
    ]);
    let totalCount = queryResult[0] || [];
    return {
      totalCount:totalCount.length,
      restaurantData:queryResult[1] || []
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let getRestaurantMenu = async (payloadData,UserData)=> { 
  let collectionOptions =[
    {
      path: 'toppingTitleId',
      model: 'toppingtitle',
      select: '_id title isChildExists isVegetarian toppingTitleAutoIncrementId maxItemSelection necessaryItemSelection toppingId',
      options: {lean: true}
    },    
  ];
  let nestedModel = [
    {
      path: 'toppingTitleId.toppingId',
      model: 'topping',
      select: '_id title toppingName price isVegetarian toppingAutoIncrementId subToppingId isChildExists',
      options: {lean: true}
    },
  ]
   try {
     let finalMenuData = []
     let criteriaR = {_id:payloadData.restaurantId}
     let criteria = {restaurant:payloadData.restaurantId,
      availabilityStatus:true,
      "isDeleted" : false
    }
     let projection = {
       createdAt:0,
       updatedAt:0,
       __v:0,isDeleted:0,isEnabled:0,
       adminCommssionType:0,
       email:0,password:0,
       accessToken:0,deviceToken:0,deviceType:0,
    }
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true,sort:{categoryName:1}};
    let projection2 ={logo:1,restaurantName:1,_id:1,contactNumber:1,city:1,state:1,country:1,restaurantFoodType:1,averageProcessingTime:1,minimumOrderAmount:1,costForTwoPerson:1};
    let queryResult= await Promise.all([
      Service.RestaurantMenuService.getData(criteria, projection, {}),
      Service.RestaurantMenuService.getData(criteria,projection,options),
      Service.RestaurantService.getData(criteriaR, projection2, {}),
    ]);
    let restaurantMenuData = queryResult[1] || [];
    let countMenu = restaurantMenuData.length;
     let optionsD = {skip:0,limit:5}
    if(countMenu>0){
      for(let i=0;i<countMenu;i++){
        let tempData= restaurantMenuData[i];
        let disheCriteria ={menuId:tempData._id}        
        let dishesData = await Service.DAOService.getDataDeepPopulateFixed(Models.Dishes,disheCriteria,{__v:0,createdAt:0,updatedAt:0},optionsD,collectionOptions,nestedModel);
        tempData.dishes = dishesData || []        
        finalMenuData.push(tempData);
      }
    }
    let totalCount = queryResult[0] || [];
    return {
      totalCount:totalCount.length,
      restaurantData:queryResult[2][0] || {},
      restaurantMenuData:finalMenuData
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let getRestaurantDishes = async (payloadData,UserData)=> {
  let collectionOptions =[
    {
      path: 'toppingTitleId',
      model: 'toppingtitle',
      select: '_id title isChildExists isVegetarian toppingTitleAutoIncrementId maxItemSelection necessaryItemSelection toppingId',
      options: {lean: true}
    },    
  ];
  let nestedModel = [
    {
      path: 'toppingTitleId.toppingId',
      model: 'topping',
      select: '_id title toppingName price isVegetarian toppingAutoIncrementId subToppingId isChildExists',
      options: {lean: true}
    },
  ] 
  try {
    let criteria ={menuId:payloadData.menuId,availabilityStatus:true,isDeleted:false} 
    let projection = {
      createdAt:0,
      updatedAt:0,
      __v:0,
    }
   let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true,sort:{categoryName:1}}
   let queryResult= await Promise.all([
     Service.DishesService.getData(criteria, projection, {}),
     Service.DAOService.getDataDeepPopulateFixed(Models.Dishes,criteria,{__v:0,createdAt:0,updatedAt:0},options,collectionOptions,nestedModel)
   ]);
   let totalCount = queryResult[0] || [];
   return {
     totalCount:totalCount.length,
     restaurantDishesData:queryResult[1] || []
   };
 }catch(err){ //console.log("err",err);
   throw err;
 }
}

let getRestaurantSubToppings = async (payloadData,UserData)=> {
  try {
    let criteria ={menuId:payloadData.menuId,toppingId:payloadData.toppingId,isDeleted:false} 
    let projection = {
      createdAt:0,
      updatedAt:0,
      __v:0,isDeleted:0,isEnabled:0
    }
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true,sort:{categoryName:1}}
    let queryResult= await Promise.all([
      Service.SubToppingItemService.getData(criteria, projection, {}),
      Service.SubToppingItemService.getData(criteria,projection,options),
    ]);
    let totalCount = queryResult[0] || [];
    return {
     totalCount:totalCount.length,
     subToppingData:queryResult[1] || []
    };
 }catch(err){ //console.log("err",err);
   throw err;
 }
}

const sendNotificationTest  = async(payloadData)=> {
  try{
    let message = payloadData.message;
    let deviceToken = payloadData.deviceToken;
    let notificationObject = { message, deviceToken };
    await UniversalFunctions.sendNotificationUsingFCM(notificationObject);
    return {}
  }catch(err){  console.log("err",err);
    throw err;
  }
}

const sendEmail = async(payloadData) => {
  try{
    let templatepath      = Path.join(__dirname, '../emailTemplates/');
    let fileReadStream    =  templatepath + payloadData.emailTemplate;  
    let emailTemplate     = await readFilePromise(fileReadStream);  
    emailTemplate         = emailTemplate.toString(); 
    let appName           = APP_CONSTANTS.APP_DETAILS.APP_NAME;
    let logo              =  APP_CONSTANTS.APP_DETAILS.LOGO;
    let sendStr = emailTemplate.replace('{{appName}}', appName).replace('{{logo}}',logo).payloadData.replaceString;
    payloadData.html = sendStr;
    await UniversalFunctions.sendMail(payloadData);
    return {}
  }catch(err){  console.log("err",err);
    throw err;
  }
}

let getCityList = async (payloadData,UserData)=> {
  try {
    let match ={
      $match: {
        countryName: payloadData.countryId,
        stateName: payloadData.stateId
      }
    }
    let groupBy ={
      $group: {
        _id: "$cityName",
      }
    }
    let sortbyCount= {$sortByCount:"$tags"};
    let skip ={$skip:payloadData.skip}
    let limit ={$limit:payloadData.limit}
   
    let queryResult= await Promise.all([
      Service.CityService.aggregateQuery([match,groupBy,sortbyCount]),
      Service.CityService.aggregateQuery([match,groupBy,{$sort:{"_id":1}},skip,limit])
    ]);
    let totalCount = queryResult[0] || []
    
    return {
     totalCount:totalCount.length >0 ? totalCount[0].count : 0,
     cityData:queryResult[1] || []
    };
 }catch(err){ //console.log("err",err);
   throw err;
 }
}

let getAllCityList = async (payloadData,UserData)=> {
  try {
    let criteria = {};
    let options = {skip:payloadData.skip,limit:payloadData.limit}
    let queryResult= await Promise.all([
      Service.CityService.countData(criteria),
      Service.CityService.getData(criteria,{},options)
    ]);
    let totalCount = queryResult[0] || 0
    
    return {
     totalCount:totalCount,
     cityData:queryResult[1] || []
    };
 }catch(err){ //console.log("err",err);
   throw err;
 }
}

let getRestaurantTiming = async (payloadData,UserData)=> {
  try {
    let isValid = Mongoose.Types.ObjectId.isValid(payloadData.restaurantId); //true
   if(isValid === false){
    throw STATUS_MSG.ERROR.INVALID_RESTAURANT_ID;
   }
   let date = new Date();
   let newDate = new Date();
   let currentDay = date.toLocaleString('en-US', { weekday: 'long'});
  //  let optionss = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        //  let completeTime =date.toLocaleDateString('en-US', optionss);
          


    //let currentDay = 'Wednesday';

    let criteria = {restaurant:payloadData.restaurantId};
    let options = {lean:true}
      queryResult = await  Service.RestaurantWorkingTimeService.getData(criteria,{},options);
     let getNewArray = [];
     let yesterdaysArray = [];
     let checkTodayCondition = false;
     let finalArray ;
     let j = 1;
    let  newDateData = [];
      queryResult.forEach(element => {
        let newData;
        if(j == 1){
          newData = newDate.setDate(newDate.getDate() + 0)
        }else{
          newData = newDate.setDate(newDate.getDate() + 1)
        }

        let finalDataa = new Date(newData);
        finalDataa.getTime()
        console.log(finalDataa)
        newDateData.push(finalDataa);
        j++
        if(checkTodayCondition === false){
          yesterdaysArray.push(element);
        }
        if(element.dayName == currentDay || checkTodayCondition === true){
          checkTodayCondition = true;
          getNewArray.push(element);
        }
      });
      finalArray = getNewArray.concat(yesterdaysArray);
      let getUniqueData = [...new Set(finalArray)]
      for (let kk = 0; kk < getUniqueData.length; kk++) {
        getUniqueData[kk].fullTime = newDateData[kk];
      }
    return {
     timeSlot:15, 
     restaurantTimmingData:getUniqueData || []
    };
 }catch(err){ //console.log("err",err);
   throw err;
 }
}

let getStateList = async (payloadData,UserData)=> {
  try {
    let match ={
      $match: {
        countryName: payloadData.countryId,
      }
    }
    let groupBy ={
      $group: {
        _id: "$stateName",
      }
    }
    let sortbyCount= {$sortByCount:"$tags"};
    let skip ={$skip:payloadData.skip}
    let limit ={$limit:payloadData.limit}
    let queryResult= await Promise.all([
      Service.CityService.aggregateQuery([match,groupBy,sortbyCount]),
      Service.CityService.aggregateQuery([match,groupBy,{$sort:{"_id":1}},skip,limit])
    ]);
    let totalCount = queryResult[0] || []
    return {
     totalCount:totalCount.length >0 ? totalCount[0].count : 0, //totalCount[0].count || 0,
     stateData:queryResult[1] || []
    };
 }catch(err){ //console.log("err",err);
   throw err;
 }
}


let getCountryList = async (payloadData,UserData)=> {
  try {
    let groupBy ={
      $group: {
        _id: "$countryName",
      }
    }
    let sortbyCount= {$sortByCount:"$tags"};
    let skip ={$skip:payloadData.skip}
    let limit ={$limit:payloadData.limit}
   
    let queryResult= await Promise.all([
      Service.CityService.aggregateQuery([groupBy,sortbyCount]),
      Service.CityService.aggregateQuery([groupBy,{$sort:{"_id":1}},skip,limit])
    ]);
    let totalCount = queryResult[0] || []    
    return {
      totalCount:totalCount.length >0 ? totalCount[0].count : 0,
     countryData:queryResult[1] || []
    };
 }catch(err){ //console.log("err",err);
   throw err;
 }
}


let allFaq = async (payloadData,UserData)=> { console.log("getFaq==init");
   try {
     let criteria = {"isDeleted" : false,"userType" :payloadData.userType }
     let projection = {createdAt:0,updatedAt:0,__v:0}
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true}
    let queryResult= await Promise.all([
      Service.FaqService.getData(criteria, projection, options),
    ]);
    let totalCount = queryResult[0] || [];
    return {
      totalCount:totalCount.length,
      faqData:queryResult[0] || []
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let getRestaurantMenuDetail = async (payloadData,UserData)=> { 
  try {
     let criteria = {restaurant:payloadData.restaurantId,_id:payloadData.menuId}
     let projection = {
       createdAt:0,
       updatedAt:0,
       __v:0,isDeleted:0,isEnabled:0,
       adminCommssionType:0,
       email:0,password:0,
       accessToken:0,deviceToken:0,deviceType:0,
    }
    let options = {lean:true};
    let queryResult= await Promise.all([
      Service.RestaurantMenuService.getData(criteria,projection,options),
    ]);
    let restaurantMenuData = queryResult[0] || [];
    return {
      restaurantMenuData:restaurantMenuData
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let getRestaurantDisheDetail = async (payloadData,UserData)=> {
  try {
    let collectionOptions =[
      {
        path: 'menuId',
        model: 'menu',
        select: '_id menuName menuImage availabilityStatus menuAutoIncrementId ',
        options: {lean: true}
      }, 
      {
        path: 'toppingTitleId',
        model: 'toppingtitle',
        select: '_id title isChildExists isVegetarian toppingTitleAutoIncrementId ',
        options: {lean: true}
      },    
    ];
    let criteria ={_id:payloadData.dishId} 
    let projection = {createdAt:0,updatedAt:0,__v:0,}
    let options = {lean:true}
    let queryResult= await Promise.all([
      Service.DAOService.getDataWithReferenceFixed(Models.Dishes,criteria, projection,options,collectionOptions),
    ]);
    return {
      restaurantDishesData:queryResult[0] || []
    };
  }catch(err){ //console.log("err",err);
   throw err;
  }
}

let allBanner = async (payloadData,UserData)=> { console.log("getFaq==init");
   try {
     let promoCodeData = [];
     let criteria = {"isDeleted" : false,type:payloadData.type}
     let projection = {createdAt:0,updatedAt:0,__v:0,bannerAuoIncrement:0}
     let projectionForPromoCode = {createdAt:0,updatedAt:0,__v:0}
     let projectionForCuisine = {createdAt:0,updatedAt:0,__v:0}
     let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true}

  
    let queryResult= await Promise.all([
      Service.BannerService.countData(criteria),
      Service.BannerService.getData(criteria, projection, options),
      Service.PromoCodeService.getData({},projectionForPromoCode,{lean:true}),
      Service.CuisineService.getData({isEnabled:true,isDeleted:false},projectionForCuisine,{lean:true}),
    ]);
    let totalCount = queryResult[0] || [];
    if(payloadData.type == APP_CONSTANTS.USER_ROLES.CUSTOMER){
       promoCodeData = queryResult[2];
    }
    return {
      totalCount:totalCount,
      bannerData:queryResult[1] || [],
      promoCodeData: promoCodeData,
      cuisine : queryResult[3] || []
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let getRestaurantMenuAndDishes = async (payloadData,UserData)=> { 
  try {
     let finalMenuData = []
     let criteriaR = {_id:payloadData.restaurantId}
     let criteria = { restaurant:payloadData.restaurantId,
      availabilityStatus:true,
      "isDeleted" : false
    }
    let projection2 ={logo:1,restaurantName:1,_id:1,contactNumber:1,city:1,state:1,country:1,restaurantFoodType:1,averageProcessingTime:1,minimumOrderAmount:1,costForTwoPerson:1}
     let projection = {
       createdAt:0,
       updatedAt:0,
       __v:0,isDeleted:0,isEnabled:0,
       adminCommssionType:0,
       email:0,password:0,
       accessToken:0,deviceToken:0,deviceType:0,availabilityStatus:0,
    }
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true,sort:{categoryName:1}};
    
    let queryResult= await Promise.all([
      Service.RestaurantMenuService.countData(criteria),
      Service.RestaurantService.getData(criteriaR,projection2,options),
      Service.RestaurantMenuService.getData(criteria,projection,options),
      //Service.DAOService.getDataWithReferenceFixed(Models.Dishes,disheCriteria,projection,options,collectionOptions),
    ]);
    let restaurantMenuData = queryResult[2] || [] 
    let countMenu = restaurantMenuData.length;
    if(countMenu>0){
      let optionsD = {lean:true,sort:{itemName:1}};
      let projectionD={__v:0,createdAt:0,updatedAt:0,isDeleted:0,toppingTitleId:0,availabilityStatus:0}
      for (let element of restaurantMenuData){
        let tempData= element;
        let disheCriteria = {
          restaurant:payloadData.restaurantId,
          menuId:tempData._id,
          availabilityStatus:true,
          isDeleted:false
        }                 
        let dishesData = await Service.DishesService.getData(disheCriteria,projectionD,optionsD);
        tempData.dishes = dishesData || []        
        finalMenuData.push(tempData);
      }
    }
    let totalCount = queryResult[0] || [];
    return {
      totalCount:totalCount,
      restaurantData:queryResult[1][0] || {},
      restaurantMenuData:finalMenuData
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let dishesTitelAndTopping = async (payloadData,UserData)=> {  console.log("dishesTitelAndTopping====init");
  let collectionOptions =[
    {
      path: 'toppingId',
      model: 'topping',
      select: '_id title toppingName price isVegetarian toppingAutoIncrementId  isChildExists isDefault subToppingId',
      options: {lean: true}
    },   
  ];
  let nestedModel = [
    {
      path: 'toppingId.subToppingId',
      model: 'subtopping',
      match:{isDefault:true},
      select: '_id title toppingName price isVegetarian toppingAutoIncrementId subToppingId isDefault isChildExists',
      options: {lean: true}
    },
  ] 
  try {
     let finalMenuData = [];     
     let criteria = { dishId:payloadData.dishId,
      //availabilityStatus:true,
      //"isDeleted" : false
    }
     let projection = {restaurant:0,isDeleted:0,createdAt:0,updatedAt:0,__v:0,menuId:0 }
    let options = {skip:payloadData.skip,limit:payloadData.limit,lean:true,sort:{title:1}};
    let queryResult= await Promise.all([
      Service.ToppingTitleService.countData(criteria),
      Service.DAOService.getDataDeepPopulateFixed(Models.ToppingTitle,criteria,projection,options,collectionOptions,nestedModel),
    ]);
    let totalCount = queryResult[0] || [];
    let restaurantMenuData = queryResult[1] || [];
    return {
      totalCount:totalCount,
      //restaurantData:queryResult[1][0] || {},
      restaurantMenuData:restaurantMenuData
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let generatePdf = async (payloadData)=> { 
  try {
    let templatepath      = Path.join(__dirname, '../pdfTemplates/'+payloadData.pdfTemplate);
    
  let html = fs.readFileSync(templatepath, "utf8");
  var options = {
    format: "A3",
    orientation: "landscape",
    border: "10mm",
    header: {
        height: "0mm"
        // contents: `<div style="text-align: center;">${APP_CONSTANTS.APP_DETAILS.APP_NAME}</div>`
    },
      footer: {
          height: "28mm",
          contents: {
              first: 'Cover page',
              2: 'Second page', // Any page number is working. 1-based index
              default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
              last: 'Last Page'
          }
      }
  };
        var headers = payloadData.headers;
        var pdfData = payloadData.pdfData;
        var document = {
          html: html,
          data: {
            pdfData: pdfData,headers:headers,logo:APP_CONSTANTS.APP_DETAILS.LOGO,
          },
          path: APP_CONSTANTS.APP_DETAILS.PDF_FILE_PATH+uuidv4()+`.pdf`,
          type: "",
        };

        let url = await pdf.create(document, options).then((res) => {
            return res;
          }).catch((error) => {
            console.error(error);
          });
          let arr = url.filename.split('/');
          let fileName = arr.slice(Math.max(arr.length - 1, 1))
          let finalUrl = 'pdfFile/'+fileName[0];
    return { finalUrl };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

module.exports ={
  getCatgory : getCatgory,
  getRestaurant:getRestaurant,
  getRestaurantMenu:getRestaurantMenu,
  getRestaurantDishes:getRestaurantDishes,
  getRestaurantSubToppings:getRestaurantSubToppings,
  sendNotificationTest:sendNotificationTest,
  getCityList:getCityList,
  getStateList:getStateList,
  getCountryList:getCountryList,
  allFaq:allFaq,
  getRestaurantMenuDetail:getRestaurantMenuDetail,
  getRestaurantDisheDetail:getRestaurantDisheDetail,
  sendEmail:sendEmail,
  allBanner:allBanner,
  getRestaurantMenuAndDishes:getRestaurantMenuAndDishes,
  dishesTitelAndTopping:dishesTitelAndTopping,
  getAllCityList:getAllCityList,
  getRestaurantTiming:getRestaurantTiming,
  generatePdf:generatePdf,
}