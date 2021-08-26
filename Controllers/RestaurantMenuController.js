const Service = require('../Services');
const Models  = require('../Models');
const Config = require('../Config');
const UniversalFunctions = require('../Utils/UniversalFunctions');

const APP_CONSTANTS          =  Config.APP_CONSTANTS;
const DEVICE_TYPES           =  APP_CONSTANTS.DEVICE_TYPES;
const STATUS_MSG             =  APP_CONSTANTS.STATUS_MSG
const ALLOWED_IMAGE_EXT      =  APP_CONSTANTS.ALLOWED_IMAGE_EXT;
const DOCUMENT_IMAGES_PREFIX =  APP_CONSTANTS.DOCUMENT_IMAGES_PREFIX;
const ORDER_STATUS           =  APP_CONSTANTS.ORDER_STATUS;  
//const WORKING_HOURS_OF_RESTAURANT    = APP_CONSTANTS.WORKING_HOURS_OF_RESTAURANT;
const DOCUMENT_FILE_SIZE = APP_CONSTANTS.DOCUMENT_FILE_SIZE;
const LANGUAGE_SPECIFIC_MESSAGE = APP_CONSTANTS.LANGUAGE_SPECIFIC_MESSAGE;

const async = require("async");
const Mongoose = require('mongoose');

const _ = require('underscore');
const fs = require('fs').promises;

//const fs = promiseBluebird.promisifyAll(require('fs'));
const Path = require('path');


const addMenu = async (payloadData,UserData)=> {
  try{
    let folderName=APP_CONSTANTS.FOLDER_NAME.images;
    payloadData.restaurant = UserData._id;
    if(payloadData.menuId){
      if(typeof payloadData.menuImage!='undefined'){
        if(payloadData.menuImage['_data'].length>DOCUMENT_FILE_SIZE.IMAGE_SIZE){
          throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
        }
        let contentType   = payloadData.menuImage.hapi.headers['content-type'];
        let imageFile = await UniversalFunctions.uploadFiles(payloadData.menuImage,"menuImage_",UserData._id,folderName,contentType);
        payloadData.menuImage = imageFile[0];
      }
      let criteria = {_id:payloadData.menuId}
      let menuData = await Service.RestaurantMenuService.updateData(criteria,payloadData,{new:true,lean:true});
      return {menuData}
    }else{ console.log("else",payloadData);
      if(typeof payloadData.menuImage=='undefined'){
        throw STATUS_MSG.ERROR.INVALID_FILE;
      }
      if(payloadData.menuImage['_data'].length>DOCUMENT_FILE_SIZE.IMAGE_SIZE){
        throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
      }
      let contentType   = payloadData.menuImage.hapi.headers['content-type'];
      let imageFile = await UniversalFunctions.uploadFiles(payloadData.menuImage,"menuImage_",UserData._id,folderName,contentType);
      payloadData.menuImage = imageFile[0];
      let menuData  = await Service.RestaurantMenuService.InsertData(payloadData);
      return {menuData}
    }
    
  }catch(err){
    throw err;
  }
}

const addAdminMenu = async (payloadData,UserData)=> {
  try{
    let adminCriteria ={_id:payloadData.adminMenuId}, projection ={menuImage:1,menuName:1}, options={lean:true};
    let adminMenuData = await Service.AdminMenuService.getData(adminCriteria,projection,options);
    if(adminMenuData.length==0){
      throw STATUS_MSG.ERROR.INVALID_ADMIN_MENU_ID;
    }
    let saveData = adminMenuData[0];
    saveData.restaurant= UserData._id;
    saveData.adminMenuId= saveData._id;
    delete saveData._id;
    console.log("saveData=====",saveData);
    let menuData  = await Service.RestaurantMenuService.InsertData(saveData);
    return {menuData}    
  }catch(err){
    throw err;
  }
}

const editMenuOnlieStatus = async (payloadData,UserData)=> {
  try{
    let dataToSet = {availabilityStatus:payloadData.availabilityStatus}
    await Service.RestaurantMenuService.updateMultipleDocuments({_id:payloadData.menuId},dataToSet, {new:true});
    return {};
  }catch(err){
    throw err;
  }
}

const getMenuList = async (payloadData,UserData)=> {
  try{
    let criteria = {restaurant:UserData._id,isDeleted:false};
    let options =  {lean:true,skip:payloadData.skip,limit:payloadData.limit}
    let match =  {$match:{"restaurant" : UserData._id}};
    let lookup = {
      $lookup:
        {
          from: "dishes",
          localField: "_id",
          foreignField: "menuId",
          as: "result"
        }
    }
    let project = {
      $project:{
        _id:"$_id",
        menuName:"$menuName",
        numOfDishes:{$size:"$result"},
        menuAutoIncrementId:"$menuAutoIncrementId",
        menuImage:"$menuImage",
        availabilityStatus:"$availabilityStatus",
        restaurant:"$restaurant",             
        isDeleted:"$isDeleted", 
        createdAt:"$createdAt",
        updatedAt :"$updatedAt",
      } 
    }
    let skip ={$skip:payloadData.skip}
    let limit ={$limit:payloadData.limit}
    
    let result = await Promise.all([
      Service.RestaurantMenuService.countData(criteria),
      Service.RestaurantMenuService.aggregateQuery([match,lookup,project,{$sort:{"menuName":1}},skip,limit])
    ])
    let totalCount = result[0];
    let menuData  = result[1]; //await Service.RestaurantMenuService.getData(criteria, {__v:0}, {lean:true});
    return {totalCount,menuData}
  }catch(err){
    throw err;
  }
}

let deleteMenu = async (payload,UserData)=>{ 
  try{
    let  criteria = {_id: payload.menuId }; 
    let options = {lean: true}
    let dataToSet={isDeleted:true}
    await Service.RestaurantMenuService.updateMultipleDocuments(criteria,dataToSet,options);
    return {};
  }catch(err){
    throw err;
  }
};

const addDishes = async (payloadData,UserData)=> {
  payloadData.restaurant = UserData._id;
  let folderName=APP_CONSTANTS.FOLDER_NAME.images;
  try{
    if(payloadData.dishId){
      let criteria={_id:payloadData.dishId}
      let dataToSet =payloadData;
      if(typeof payloadData.itemImage!='undefined'){
        if(payloadData.itemImage['_data'].length>DOCUMENT_FILE_SIZE.IMAGE_SIZE){
          throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
        }
        payloadData.itemImage = payloadData.itemImage
        
        let contentType   = payloadData.itemImage.hapi.headers['content-type'];
        let imageFile = await UniversalFunctions.uploadMultipleFiles(payloadData.itemImage,"itemImage_",UserData._id,folderName,contentType);
        dataToSet.$addToSet={image:imageFile[0]};
      }
      let dishesData  = await Service.DishesService.updateData(criteria,payloadData,{new:true,lean:true});
      return {dishesData}
    }else{      
      // if(typeof payloadData.itemImage=='undefined'){
      //   throw STATUS_MSG.ERROR.INVALID_FILE;
      // }
      if(typeof payloadData.itemImage!='undefined'){
        if(payloadData.itemImage['_data'].length>DOCUMENT_FILE_SIZE.IMAGE_SIZE){
          throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
        }
        payloadData.itemImage = payloadData.itemImage 
        let imageFile = await UniversalFunctions.uploadMultipleFiles(payloadData.itemImage,"itemImage_",UserData._id,folderName);
        payloadData.image = imageFile[0];   
      }
      let dishesData  = await Service.DishesService.InsertData(payloadData);
      return {dishesData}
    }    
  }catch(err){
    throw err;
  }
}

const addDisheImages = async (payloadData,UserData)=> {
  payloadData.restaurant = UserData._id;
  console.log("addDisheImages===init",typeof payloadData.itemImage,payloadData.itemImage)
  try{    
    if(typeof payloadData.itemImage=='undefined'){
      throw STATUS_MSG.ERROR.INVALID_FILE;
    }
    payloadData.itemImage = payloadData.itemImage
    let folderName=APP_CONSTANTS.FOLDER_NAME.images;
    let imageFile;
    if(Array.isArray(payloadData.itemImage)==true){
      imageFile = await UniversalFunctions.uploadMultipleFiles(payloadData.itemImage,"itemImage_",UserData._id,folderName);
    }else{ console.log("addDisheImages===init==147",)
      if(payloadData.itemImage['_data'].length>DOCUMENT_FILE_SIZE.IMAGE_SIZE){
        throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
      }
      let contentType   = payloadData.itemImage.hapi.headers['content-type'];
      imageFile = await UniversalFunctions.uploadFiles(payloadData.itemImage,"itemImage_",UserData._id,folderName,contentType);
    }
    let criteria={_id:payloadData.dishId};
    let dataToSet ={$addToSet:{image:imageFile}} 
    let options ={new:true,lean:true} 
    let dishesData  = await Service.DishesService.updateData(criteria,dataToSet,options);
    return {dishesData}
  }catch(err){
    throw err;
  }
}

let deleteDisheImages = async (payload,UserData)=>{ 
  try{
    let  criteria = {_id: payload.dishId }; 
    let options = {new: true}
    let dataToSet={
      "$pull" : {
        "image" :{_id:payload.imageId}
      }
    }
   let dishesData = await Service.DishesService.updateData(criteria,dataToSet,options);
    return {dishesData};
  }catch(err){
    throw err;
  }
};

const editDisheOnlieStatus = async (payloadData,UserData)=> {
  try{
    let dataToSet = {availabilityStatus:payloadData.availabilityStatus}
    let data  = await Service.DishesService.updateMultipleDocuments({_id:payloadData.dishId},dataToSet,{new:true});
    return {};
  }catch(err){
    throw err;
  }
}
 


const getDishesList = async (payloadData,UserData)=> {
  try{
    let criteria = {restaurant:UserData._id,menuId:payloadData.menuId,isDeleted:false};
    let options = {lean:true,skip:payloadData.skip,limit:payloadData.limit,sort:{itemName:1}}
    if(payloadData.dishName){
      criteria.itemName ={$regex:payloadData.dishName}
    }
    let queryResult= await Promise.all([
      Service.DishesService.getData(criteria,{__v:0,isDeleted:0},options),
      Service.DishesService.countData(criteria)
    ]);
    let countDishes=queryResult[1];
    let dishesData  = queryResult[0];
    return {countDishes:countDishes, dishesData}
  }catch(err){
    throw err;
  }
}

let deleteDishes = async (payload,UserData)=>{ 
  try{
    let  criteria = {_id: payload.dishId }; 
    let options = {lean: true}
    let dataToSet={isDeleted:true}
    await Service.DishesService.updateMultipleDocuments(criteria,dataToSet,options);
    return {};
  }catch(err){
    throw err;
  }
};

const addToppingTitle = async (payloadData,UserData)=> {
  payloadData.restaurant = UserData._id;
  try{       
    let saveTitle = await Service.ToppingTitleService.InsertData(payloadData);
    let dataToSet = {
      isChildExists:1, 
      $addToSet: { toppingTitleId:saveTitle._id} 
    }
    let setTitleId  = await Service.DishesService.updateMultipleDocuments({_id:payloadData.dishId},dataToSet, {new:true});
    return {saveTitle}
  }catch(err){
    throw err;
  }
}


const addToppinItem = async (payloadData,UserData)=> {
  payloadData.restaurant = UserData._id;
  try{
    payloadData.toppingTitleId  = payloadData.titleId; 
    if(payloadData.toppingId){
      let criteria = {_id:payloadData.toppingId}
      let toppingData = await Service.ToppingItemService.updateData(criteria, payloadData, {new:true});
      return {toppingData} 
    }else{
      let toppingData = await Service.ToppingItemService.InsertData(payloadData);
      let dataToSet = {
        isChildExists:1,
        $addToSet: { toppingId:toppingData._id} 
      }    
      let setToppingId  = await Service.ToppingTitleService.updateMultipleDocuments({_id:payloadData.titleId},dataToSet,{new:true});
      return {toppingData}
    }
  }catch(err){
    throw err;
  }
}

const addSubToppinItem = async (payloadData,UserData)=> {
  payloadData.restaurant = UserData._id;
  try{
    payloadData.toppingTitleId  = payloadData.titleId;
    let criteria = {_id:payloadData.subToppinId}
    if(payloadData.subToppinId){
      let toppingData = await Service.SubToppingItemService.updateData(criteria, payloadData, {new:true});
      return {toppingData}
    }else{
      let toppingData = await Service.SubToppingItemService.InsertData(payloadData);
      let dataToSet = {
        isChildExists:1,
        $addToSet: { subToppingId:toppingData._id} 
      }    
      let setToppingId  = await Service.ToppingItemService.updateMultipleDocuments({_id:payloadData.toppingId},dataToSet, {new:true});
      return {toppingData}
    }
  }catch(err){
    throw err;
  }
}

let setDefaultToppinItem = async (payload,UserData)=>{ 
  try{
    let  criteria = {_id: payload.toppingId }; 
    let options = {lean: true}
    let dataToSet={isDefault:payload.isDefault}
    if(payload.toppingName){
      dataToSet.toppingName = payload.toppingName;
    }
    if(payload.price){
      dataToSet.price = payload.price;
    }
    let queryResult= await Promise.all([
      Service.ToppingItemService.updateMultipleDocuments(criteria,dataToSet,options),
    ]);
    return {};
  }catch(err){
    throw err;
  }
};

let getTopping = async (payloadData,UserData)=> { 
  try {
    let collectionOption =[
      {
        path: 'subToppingId',
        model: 'subtopping',
        select: '_id toppingName isDefault price ',
        options: {lean: true}
      },
    ]
    let criteria = {dishId:payloadData.dishId,toppingTitleId:payloadData.titleId,isDeleted:false}; //console.log("criteria",criteria)
    let projection = {
      createdAt:0,
      updatedAt:0,
      __v:0,isDeleted:0,isEnabled:0,
    }
    let options = {lean:true};
    console.log("Models.Topping",Models.Toppings);
    let queryResult= await Promise.all([
      Service.DAOService.getDataWithReferenceFixed(Models.Toppings,criteria,projection,options,collectionOption),
    ]);
    let restaurantMenuData = queryResult[0] || [];
    return {
      dishesToppingData:restaurantMenuData
    };
  }catch(err){ //console.log("err",err);
    throw err;
  }
}

let deleteTopping = async (payload,UserData)=>{ 
  try{
    let  criteria = {_id: payload.toppingId }; 
    let options = {lean: true}
    let dataToSet={isDeleted:true}
    let queryResult= await Promise.all([
      Service.ToppingItemService.updateMultipleDocuments(criteria,dataToSet,options),
    ]);
    return {};
  }catch(err){
    throw err;
  }
};

let deleteToppingTitle = async (payload,UserData)=>{ 
  try{
    let  criteria = {_id: payload.titleId }; 
    let options = {lean: true}
    let dataToSet={isDeleted:true}
    let queryResult= await Promise.all([
      Service.ToppingTitleService.updateMultipleDocuments(criteria,dataToSet,options),
    ]);
    return {};
  }catch(err){
    throw err;
  }
};


let setDefaultSubToppinItem = async (payload,UserData)=>{ 
  try{
    let  criteria = {_id: payload.subToppingId }; 
    let options = {lean: true}
    let dataToSet={isDefault:payload.isDefault}
    if(payload.toppingName){
      dataToSet.toppingName = payload.toppingName;
    }
    if(payload.price){
      dataToSet.price = payload.price;
    }
    let queryResult= await Promise.all([
      Service.SubToppingItemService.updateMultipleDocuments(criteria,dataToSet,options),
    ]);
    return {};
  }catch(err){
    throw err;
  }
};

let deleteSubTopping = async (payload,UserData)=>{ 
  try{
    let  criteria = {_id: payload.subToppingId }; 
    let options = {lean: true}
    let dataToSet={isDeleted:true}
    let queryResult= await Promise.all([
      Service.SubToppingItemService.updateMultipleDocuments(criteria,dataToSet,options),
    ]);
    return {};
  }catch(err){
    throw err;
  }
};

let importMenuUsingCSV = async (payloadData, UserData) => {
  console.log("importMenuUsingCSV=====init");
  try {
    let ext = payloadData.document.hapi.filename.substr(payloadData.document.hapi.filename.lastIndexOf('.') + 1);
    let criteria = { _id: UserData._id };
    if (typeof payloadData.document == "undefined") {
      throw STATUS_MSG.ERROR.INVALID_FILE;
    }
    if (payloadData.document["_data"].length > DOCUMENT_FILE_SIZE.IMAGE_SIZE) {
      throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
    }

    let folderName=APP_CONSTANTS.FOLDER_NAME.images;
    let contentType   = payloadData.document.hapi.headers['content-type'];
    let csvFile = await UniversalFunctions.uploadDocumentOnLocalMachine(payloadData.document,"customerPic_",UserData._id,folderName,contentType);
    let convertCsvToJson = await UniversalFunctions.convertCsvToJson(csvFile);
    await saveImportDataToDB(convertCsvToJson,UserData);
    //let customerData = await Service.CustomerService.getData(criteria,project,{lean:true});
    return {};
  } catch (err) { //console.log("err",err);
    throw err;
  }
};

let saveImportDataToDB = async (convertCsvToJson, UserData) => {
  try{
    let countData= convertCsvToJson.length;
    for(let element of convertCsvToJson){ console.log("element",element);
      let newMenuData={},newDisheData={};
      let rCriteria={restaurant:UserData._id,menuName:element.menuName}, projection={}, options={lean:true};
      let checkMenuExistsORNot = await Service.RestaurantMenuService.getData(rCriteria,projection,options);
      let checkMenulength= checkMenuExistsORNot.length;
      if(checkMenulength==0){
        newMenuData = await Service.RestaurantMenuService.InsertData({
          availabilityStatus:false,
          restaurant:UserData._id,
          menuName:element.menuName
        });
        checkMenuExistsORNot = [newMenuData];
      }
      let dCriteria={restaurant:UserData._id,menuId:checkMenuExistsORNot[0]._id,itemName:element.DishName}
      let checkDisheExistsORNot = await Service.DishesService.getData(dCriteria,projection,options);
      let checkDishlength = checkDisheExistsORNot.length;
      if(checkDishlength==0){
        newDisheData = await Service.DishesService.InsertData({
          restaurant:UserData._id,
          menuId:checkMenuExistsORNot[0]._id,
          itemName:element.DishName,
          price:element.price || 0
        });
        checkDisheExistsORNot = [newDisheData];
      }; //console.log("checkMenuExistsORNot",checkDisheExistsORNot);
    }
    return {};
  }catch(error){
    throw error;
  }

}

const getReviewList = async (payloadData,UserData)=> {
  let collectionOptions =[
    {
      path: 'customerId',
      model: 'customer',
      select: '_id firstName lastName profilePicURL custermerAutoIncrementId',
      options: {lean: true}
    },    
  ];
  let projection = {customerId:1,restaurantRatingByCustomer:1,createdAt:1,orderAuoIncrement:1}
  try{
    let criteria = {restaurantId:UserData._id,restaurantRating:true};
    let options = {lean:true,skip:payloadData.skip,limit:payloadData.limit,sort:{itemName:1}}
    if(payloadData.dishName){
      criteria.itemName ={$regex:payloadData.dishName}
    }
    let queryResult= await Promise.all([
      Service.DAOService.getDataWithReferenceFixed(Models.OrderTable,criteria,projection,options,collectionOptions),
      Service.OrderService.countData(criteria)
    ]);
    let totalCount=queryResult[1];
    let reviewList  = queryResult[0];
    return {totalCount, reviewList}
  }catch(err){
    throw err;
  }
}

const getTopDeliveryBoy = async (payloadData,UserData)=> {
  
  try{
    
    let project = {$project:{restaurantId:1,driverId:1,createdAt:1,status:1}};
    let match = {$match:{"restaurantId" : UserData._id,driverId:{$exists:true}}};
    let group = {
      $group: {
        //_id: { driverId : "$driverId" },
        _id: "$driverId",
        driverlist: { $addToSet: {driverId:"$driverId"}},
        totalOrder:{$sum:1}
      }
    },
    lookup = {
      $lookup:
        {
          from: "drivers",
          localField: "driverlist.driverId",
          foreignField: "_id",
          as:"result"
        }
    },
    sort= { $sort: {totalOrder: -1} },
    project2={
      $project:{_id:1,totalOrder:1,// "result":1,
        "result._id":1,"result.email":1 ,"result.fullName":1,"result.phoneNo":1,"result.rating":1
      }
    };
    let skip ={$skip: payloadData.skip},limit = {$limit: payloadData.limit};
    let count = {$count: "totalDocument"};
    let match2 = {$match:{"_id" : {$ne:null}}};

    let queryResult= await Promise.all([
      Service.OrderService.aggregateQuery([project,match,group,match2,count]),
      Service.OrderService.aggregateQuery([project,match,group,lookup,project2,match2,sort,skip,limit])
    ]);
    let totalCount= (queryResult[0].length>0) ? queryResult[0][0].totalDocument:0;
    let result  = queryResult[1];
    let bestRiders  = []
    if(result.length>0){ 
      result.forEach((element)=>{
        let tempData={}
        tempData._id= element._id; 
        tempData.totalOrder= element.totalOrder;
        tempData.riderData= (element.result && element.result.length>0) ? element.result[0]: {}; 
        bestRiders.push(tempData);
      }) 
    }
    return {totalCount, bestRiders}
  }catch(err){
    throw err;
  }
}

const getTopCustomer = async (payloadData,UserData)=> {
  try{
    
    let project = {$project:{restaurantId:1,customerId:1,createdAt:1,status:1}};
    let match = {$match:{"restaurantId" : UserData._id,customerId:{$exists:true}}};
    let group = {
      $group: {
        //_id: { customerId : "$customerId" },
        _id: "$customerId" ,
        customerlist: { $addToSet: {customerId:"$customerId"}},
        totalOrder:{$sum:1}
      }
    },
    lookup = {
      $lookup:
        {
          from: "customers",
          localField: "customerlist.customerId",
          foreignField: "_id",
          as:"result"
        }
    },
    sort= { $sort: {totalOrder: -1} },
    project2={
      $project:{_id:1,totalOrder:1,// "result":1,
        "result._id":1,"result.email":1 ,"result.firstName":1,"result.custermerAutoIncrementId":1,
        "result.lastName":1,"result.phoneNo":1,"result.rating":1
      }
    };
    let skip ={$skip: payloadData.skip},limit = {$limit: payloadData.limit};
    let count = {$count: "totalDocument"};
    let match2 = {$match:{"_id" : {$ne:null}}};

    let queryResult= await Promise.all([
      Service.OrderService.aggregateQuery([project,match,group,match2,count]),
      Service.OrderService.aggregateQuery([project,match,group,lookup,project2,match2,sort,skip,limit])       
    ]);
    let totalCount= (queryResult[0].length>0) ? queryResult[0][0].totalDocument:0;
    let result  = queryResult[1];
    let bestConsumer  = []
    if(result.length>0){ 
      result.forEach((element)=>{
        let tempData={}
        tempData._id= element._id; 
        tempData.totalOrder= element.totalOrder;
        tempData.customerData= (element.result && element.result.length>0) ? element.result[0]: {}; 
        bestConsumer.push(tempData);
      }) 
    }
    return {totalCount, bestConsumer}
  }catch(err){
    throw err;
  }
}

const getTopSellingDish = async (payloadData,UserData)=> {
  try{
    let project = {$project:{restaurantId:1,dishId:1,createdAt:1,status:1}};
    let match = {$match:{"restaurantId" : UserData._id}};
    let group = {
      $group: {
        //_id: { dishId : "$dishId" },
        _id: "$dishId" ,
        dishlist: { $addToSet: {dishId:"$dishId"}},
        totalOrder:{$sum:1}
      }
    },
    lookup = {
      $lookup:
        {
          from: "dishes",
          localField: "dishlist.dishId",
          foreignField: "_id",
          as:"result"
        }
    },
    sort= { $sort: {totalOrder: -1} },
    project2={
      $project:{totalOrder:1,  
        "result._id":1,"result.email":1 ,"result.itemName":1,"result.dishesAutoIncrementId":1,"result.price":1,"result.image":1,
      }
    };
    let skip ={$skip: payloadData.skip},limit = {$limit: payloadData.limit};
    let count = {$count: "totalDocument"};
    let match2 = {$match:{"_id" : {$ne:null}}};
    let queryResult= await Promise.all([
      Service.OrderDetailService.aggregateQuery([project,match,group,match2,count]),
      Service.OrderDetailService.aggregateQuery([project,match,group,lookup,project2,match2,sort,skip,limit]), 
    ]);
    let totalCount= (queryResult[0].length>0) ? queryResult[0][0].totalDocument:0;
    let result  = queryResult[1];
    let popularItems= []
    if(result.length>0){ 
      result.forEach((element)=>{
        let tempData={}
        tempData._id= element._id; 
        tempData.totalOrder= element.totalOrder;
        tempData.dish= (element.result && element.result.length>0) ? element.result[0]: {}; 
        popularItems.push(tempData);
      }) 
    }
    return {totalCount,popularItems}
  }catch(err){
    throw err;
  }
}


module.exports ={ 
  addAdminMenu:addAdminMenu,
  addMenu             : addMenu,
  editMenuOnlieStatus : editMenuOnlieStatus,
  getMenuList         : getMenuList,
  deleteMenu          : deleteMenu,

  addDishes:addDishes,
  addDisheImages:addDisheImages,
  deleteDisheImages:deleteDisheImages,
  deleteDishes:deleteDishes,
  getDishesList:getDishesList,
  addToppingTitle:addToppingTitle,
  addToppinItem:addToppinItem,
  addSubToppinItem:addSubToppinItem,
    
  editDisheOnlieStatus:editDisheOnlieStatus,  
  setDefaultToppinItem:setDefaultToppinItem,
  getTopping:getTopping,
  deleteTopping:deleteTopping,
  deleteToppingTitle:deleteToppingTitle,
  setDefaultSubToppinItem:setDefaultSubToppinItem,
  deleteSubTopping:deleteSubTopping,
  importMenuUsingCSV:importMenuUsingCSV,
  getReviewList:getReviewList,
  getTopDeliveryBoy:getTopDeliveryBoy,
  getTopCustomer:getTopCustomer,
  getTopSellingDish:getTopSellingDish,
}