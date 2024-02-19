const BaseJoi = require("joi");
const Joi = BaseJoi;
const Boom = require("boom");
const MD5 = require("md5");
const jwt = require("jsonwebtoken");
const HapiJWT = require("hapi-jsonwebtoken");
const fsExtra = require("fs-extra");
const timezoner = require("timezoner");
const axios = require("axios").default;
const Handlebars = require("handlebars");
const generator = require("generate-password");

const FCM = require("fcm-node");
const Path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

const sendgridMail = require("@sendgrid/mail");
const AWS_SDK = require("aws-sdk");
const csvToJson = require("csvtojson");
//const xlsx          =  require('xlsx')
const readFilePromise = require("fs-readfile-promise");
const cloudinary = require("cloudinary").v2;

const CONFIG = require("../Config");
const Service = require("../Services");
const APP_CONSTANTS = CONFIG.APP_CONSTANTS;
const DOCUMENT_FILE_SIZE = APP_CONSTANTS.DOCUMENT_FILE_SIZE;
const STATUS_MSG = APP_CONSTANTS.STATUS_MSG;
const SUCCESS = STATUS_MSG.SUCCESS;
const ERROR = STATUS_MSG.ERROR;
const FCM_KEY = APP_CONSTANTS.FCM_KEY;
const SMS_KEYS_DETAILS = APP_CONSTANTS.SMS_KEYS_DETAILS;
const SEND_GRID_DETAILS = APP_CONSTANTS.SEND_GRID_DETAILS;
const S3_BUCKET_CREDENTIALS = APP_CONSTANTS.S3_BUCKET_CREDENTIALS;
sendgridMail.setApiKey(SEND_GRID_DETAILS.SMTP_PASSWORD);

//console.log("FCM_KEY",FCM_KEY);
cloudinary.config({
  cloud_name: "indersein",
  api_key: "262946273574155",
  api_secret: "B14vRxNMb_rjmKHwsNhwGHVVRYk",
});

let generatePassword = async (length = 8, numbers = true) => {
  try {
    let newPassword = generator.generate({
      length: length,
      numbers: numbers,
    });
    console.log("newPassword", newPassword);
    return newPassword;
  } catch (error) {
    throw error;
  }
  let adminEmail = "kushmalout@gmail.com";
  let criteria = { email: adminEmail };
  let getData = await Service.AdminService.getData(criteria, {}, {});
  if (getData.length == 0) {
    await Service.AdminService.InsertData({
      email: adminEmail,
      role: "Admin",
      password: encryptedPassword("admin@2200"),
    });
  }
  return true;
};

let createAdmin = async () => {
  let adminEmail = "admin@gmail.com";
  let criteria = { email: adminEmail };
  let getData = await Service.AdminService.getData(criteria, {}, {});
  if (getData.length == 0) {
    await Service.AdminService.InsertData({
      email: adminEmail,
      role: "Admin",
      name: "bytebots",
      password: encryptedPassword("admin@2200"),
    });
  }
  return true;
};

createAdmin();
let sendSMS = async (mobileNumber, fourDigitCode, textMessage) => {
  try {
    //console.log("SMS_KEYS_DETAILS",SMS_KEYS_DETAILS);
    let finalUrl =
      (await SMS_KEYS_DETAILS.URL) +
      "?user=" +
      SMS_KEYS_DETAILS.API_USER +
      "&&key=" +
      SMS_KEYS_DETAILS.API_KEY +
      "&&mobile=" +
      mobileNumber +
      "&&senderid=" +
      SMS_KEYS_DETAILS.SENDER_ID +
      "&&message=" +
      textMessage +
      "&&accusage=1";
    //console.log("finalUrl",finalUrl);
    // let sms = axios.get(finalUrl);
    return true;
  } catch (err) {
    throw err;
  }
};
//sendSMS('9988842200','hiiiiiiiiiiiii');
let sendMail = async (emailDetail) => {
  try {
    let emailParams = {
      to: emailDetail.to || "indersein416@gmail.com",
      from: emailDetail.from || SEND_GRID_DETAILS.FROM,
      subject: emailDetail.subject || "test mail",
      html: emailDetail.html,
    }; //console.log("create=========emailParams",emailParams);
    if (emailDetail.CcAddresses) {
      emailDetail.Destination.CcAddresses = emailDetail.CcAddresses;
    }
    if (emailDetail.ReplyToAddresses) {
      emailParams.ReplyToAddresses = emailDetail.ReplyToAddresses;
    }
    let sendPromise = sendgridMail.send(emailParams);
    return true;
  } catch (err) {
    console.error("==========sendingMail=======errrr====================", err);
    throw err;
  }
};

// sendMail({
//   to:'indersein416@gmail.com',
//   subject:'test mail',
//   html :"<html><head></head><body><h1>Amazon SES Test (SDK for JavaScript in Node.js)</h1><p>This email was sent with<a href='https://aws.amazon.com/ses/'>Amazon SES</a> Amazon SES Test (SDK for JavaScript in Node.js)\r\n"+ "This email was sent with Amazon SES using the using the AWS SDK for JavaScript in Node.js. <a href='https://aws.amazon.com/sdk-for-node-js/'> AWS SDK for JavaScript in Node.js</a>.</p></body></html>"
// });

let sendError = function (data) {
  //console.log("===sendError===",data);
  if (
    typeof data == "object" &&
    data.hasOwnProperty("statusCode") &&
    data.hasOwnProperty("customMessage")
  ) {
    let errorToSend = {};
    if (data.statusCode == 401) {
      errorToSend = Boom.unauthorized(data.customMessage, data.statusCode);
    } else {
      errorToSend = Boom.badRequest(data.customMessage, data.statusCode);
    }
    errorToSend.output.payload.responseType = data.type; //console.log("===sendError===26",errorToSend);
    return errorToSend;
  } else {
    const error = Boom.badRequest(data);
    error.reformat();
    return error;
  }
};

let failActionFunction = function (request, h, error) {
  //console.log("===failActionFunction======error===",JSON.stringify(error));
  let customErrorMessage = "";
  if (
    (typeof error != "undefined") &
    (error.output.payload.message.indexOf("[") > -1)
  ) {
    customErrorMessage = error.output.payload.message.substr(
      error.output.payload.message.indexOf("[")
    );
  } else {
    customErrorMessage = error.output.payload.message;
  }
  customErrorMessage = customErrorMessage.replace(/"/g, "");
  customErrorMessage = customErrorMessage.replace("[", "");
  customErrorMessage = customErrorMessage.replace("]", "");
  error.output.payload.message = customErrorMessage;
  delete error.output.payload.validation;
  throw error;
};

let successResponse = function (successMsg, data) {
  //console.log("sendSucces",successMsg,data);
  successMsg = successMsg || SUCCESS.DEFAULT.customMessage;
  if (
    typeof successMsg == "object" &&
    successMsg.hasOwnProperty("statusCode") &&
    successMsg.hasOwnProperty("customMessage")
  ) {
    return {
      statusCode: successMsg.statusCode,
      message: successMsg.customMessage,
      data: data || null,
    };
  } else {
    return { statusCode: 200, message: successMsg, data: data || null };
  }
};

let generateAuthToken = (userData) => {
  let expTime = Math.floor(Date.now() / 1000) + 60 * 60 * 7;
  let jwtToken = jwt.sign(
    { exp: expTime, data: userData },
    APP_CONSTANTS.JWT_KEY
  ); //console.log("jwtToken",jwtToken);
  //return callbackRoute(null,jwtToken);
  return jwtToken;
};

let encryptedPassword = (password) => {
  let dbPassword = MD5(password);
  return dbPassword;
};

let generateRandomString = (length) => {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

let checkAdminToken = async (payloadData) => {
  let criteria = {
    email: payloadData.email,
    _id: payloadData._id,
    accessToken: payloadData.accessToken,
  };
  let projection = { password: 0, __v: 0 };
  try {
    let userData = await Service.AdminService.getData(criteria, projection, {
      lean: true,
    });
    if (userData.length == 0) {
      throw ERROR.INVALID_ACCESS_TOKEN;
    }
    return userData[0];
  } catch (err) {
    console.log("err", err);
    throw err;
  }
};

let checkCustomerToken = async (payloadData) => {
  let criteria = {
    //email:payloadData.email,
    _id: payloadData._id,
    accessToken: payloadData.accessToken,
  };
  let projection = { password: 0, __v: 0 };
  try {
    let userData = await Service.CustomerService.getData(criteria, projection, {
      lean: true,
    }); // console.log("userData",userData);
    if (userData.length == 0) {
      throw ERROR.INVALID_ACCESS_TOKEN;
    }
    return userData[0];
  } catch (err) {
    console.log("err", err);
    throw err;
  }
};

let getTokenFromDBForAdmin = async (request, res, next) => {
  var token =
    request.payload != null && request.payload.authorization
      ? request.payload.authorization
      : request.params && request.params.authorization
      ? request.params.authorization
      : request.headers["authorization"];
  var userData = null;
  var usertype, userId, criteria; //console.log("token==1",token);
  try {
    let decoded = jwt.verify(token, APP_CONSTANTS.JWT_KEY);
    if (decoded.data.role == APP_CONSTANTS.USER_ROLES.ADMIN) {
      let userData = decoded.data;
      userData.accessToken = token;
      let checkToken = await checkCustomerToken(userData); //console.log("checkToken11",checkToken);
      return checkToken;
    } else {
      throw ERROR.INVALID_ACCESS_TOKEN;
    }
    //return decoded.data
  } catch (err) {
    //console.log("==========catch=======errrrr====",err);
    return sendError(ERROR.INVALID_ACCESS_TOKEN);
    next();
  }
};

let checkDeviceTokenAndDelete = async (
  deviceData,
  userType = APP_CONSTANTS.USER_ROLES.CUSTOMER
) => {
  try {
    let criteria = {
      deviceType: deviceData.deviceType,
      deviceToken: deviceData.deviceToken,
    };
    let projection = { _id: 1 };
    if (userType == APP_CONSTANTS.USER_ROLES.CUSTOMER) {
      let getDeviceToken = await Service.CustomerService.getData(
        criteria,
        projection,
        { lean: true }
      );
      if (getDeviceToken.length > 0) {
        let updateCriteria = { _id: getDeviceToken[0]._id };
        let dataToSet = { $unset: { deviceToken: 1 } };
        let finalData = await Service.CustomerService.updateMultipleDocuments(
          updateCriteria,
          dataToSet,
          { new: true, multi: true }
        );
      }
    } else if (userType == APP_CONSTANTS.USER_ROLES.DRIVER) {
      let getDeviceToken = await Service.DriverService.getData(
        criteria,
        projection,
        { lean: true }
      );
      if (getDeviceToken.length > 0) {
        console.log("getDeviceToken==if", getDeviceToken.length);
        let updateCriteria = { _id: getDeviceToken[0]._id };
        let dataToSet = { $unset: { deviceToken: 1 } };
        let finalData = await Service.DriverService.updateMultipleDocuments(
          updateCriteria,
          dataToSet,
          { new: true, multi: true }
        );
      }
    }
    return true;
  } catch (err) {
    //console.log("==========catch=======errrrr====",err);
    throw err;
  }
};

let uploadDocumentOnLocalMachine = async (ImageData, UserData, filePrefix) => {
  try {
    let ext = ImageData.hapi.filename.substr(
      ImageData.hapi.filename.lastIndexOf(".") + 1
    );
    let filename =
      filePrefix +
      generateRandomString(10) +
      "_" +
      Math.floor(Date.now() / 1000) +
      "_" +
      UserData._id +
      "." +
      ext.substr(0, ext.length);
    let fieSavePath = Path.join("./uploads", filename);
    return new Promise((resolve, reject) => {
      fs.writeFile(fieSavePath, ImageData["_data"], (err) => {
        if (err) {
          reject(err);
        } //console.log("fieSavePath",fieSavePath);
        resolve(fieSavePath);
      });
    });
  } catch (error) {
    throw error;
  }
};

let uploadDocumentOnLocalMachineUsingFile = async (
  ImageData,
  UserData,
  filePrefix
) => {
  let ext = ImageData.hapi.filename.substr(
    ImageData.hapi.filename.lastIndexOf(".") + 1
  );
  let filename =
    filePrefix +
    generateRandomString(10) +
    "_" +
    Math.floor(Date.now() / 1000) +
    "_" +
    UserData._id +
    "." +
    ext.substr(0, ext.length);
  let fieSavePath = Path.join("./uploads", filename);
  return new Promise((resolve, reject) => {
    fs.writeFile(fieSavePath, ImageData["_data"], (err) => {
      if (err) {
        reject(err);
      } //console.log("fieSavePath",fieSavePath);
      resolve(fieSavePath);
    });
  });
};

const uploadFiles = async (
  document,
  imagePrefix = "catImage_",
  uniqueId = Date.now(),
  folderName = "restaurant",
  contentType = ""
) => {
  try {
    let dataImageArray = [];
    if (Array.isArray(document) == true) {
      for (var i = 0; i < document.length; i++) {
        let imageList = await uploadDocumentOnLocalMachine(
          document[i],
          { _id: uniqueId },
          imagePrefix + i
        );
        let s3bucketpath = await uploadDocumentOnS3BucketAWSSDK(
          imageList,
          folderName,
          contentType
        );
        dataImageArray.push({
          original: s3bucketpath.Location,
          thumbnail: s3bucketpath.Location,
        });
      }
    } else {
      let imageList = await uploadDocumentOnLocalMachine(
        document,
        { _id: uniqueId },
        imagePrefix
      );
      let s3bucketpath = await uploadDocumentOnS3BucketAWSSDK(
        imageList,
        folderName,
        contentType
      ); //console.log("s3bucketpath",s3bucketpath)
      dataImageArray.push({
        original: s3bucketpath.Location,
        thumbnail: s3bucketpath.Location,
      });
    } //console.log("dataImageArray",dataImageArray);
    return dataImageArray;
  } catch (err) {
    //console.log("uploadFiles===err",err);
    throw err;
  }
};

const uploadFilesWithCloudinary = async (
  document,
  imagePrefix = "catImage_",
  uniqueId = Date.now(),
  folderName = "restaurant",
  contentType = ""
) => {
  try {
    let dataImageArray = [];
    if (Array.isArray(document) == true) {
      for (var i = 0; i < document.length; i++) {
        let imageList = await uploadDocumentOnLocalMachine(
          document[i],
          { _id: uniqueId },
          imagePrefix + i
        );
        let ImageDate = await cloudinary.uploader.upload(
          imageList,
          { resource_type: "image" },
          function (error, result) {}
        );
        dataImageArray.push({
          original: ImageDate.secure_url,
          thumbnail: ImageDate.secure_url,
        });
      }
    } else {
      let imageList = await uploadDocumentOnLocalMachine(
        document,
        { _id: uniqueId },
        imagePrefix
      );

      let ImageDate = await cloudinary.uploader.upload(
        imageList,
        { resource_type: "image" },
        function (error, result) {}
      );
      dataImageArray.push({
        original: ImageDate.secure_url,
        thumbnail: ImageDate.secure_url,
      });
    } //console.log("dataImageArray",dataImageArray);
    return dataImageArray;
  } catch (err) {
    //console.log("uploadFiles===err",err);
    throw err;
  }
};

const uploadMultipleFiles = async (
  document,
  imagePrefix = "catImage_",
  uniqueId = Date.now(),
  folderName = "restaurant"
) => {
  try {
    let dataImageArray = [];
    if (Array.isArray(document) == true) {
      for (var i = 0; i < document.length; i++) {
        if (document[i]["_data"].length > DOCUMENT_FILE_SIZE.IMAGE_SIZE) {
          throw STATUS_MSG.ERROR.IMAGE_SIZE_LIMIT;
        }
        let contentType = document[i].hapi.headers["content-type"];
        let imageList = await uploadDocumentOnLocalMachine(
          document[i],
          { _id: uniqueId },
          imagePrefix + i + "_"
        );
        let s3bucketpath = await uploadDocumentOnS3BucketAWSSDK(
          imageList,
          folderName,
          contentType
        );
        dataImageArray.push({
          original: s3bucketpath.Location,
          thumbnail: s3bucketpath.Location,
        });
      }
    } else {
      let contentType = document.hapi.headers["content-type"];
      let imageList = await uploadDocumentOnLocalMachine(
        document,
        { _id: uniqueId },
        imagePrefix
      );
      let s3bucketpath = await uploadDocumentOnS3BucketAWSSDK(
        imageList,
        folderName,
        contentType
      ); //console.log("s3bucketpath",s3bucketpath)
      dataImageArray.push({
        original: s3bucketpath.Location,
        thumbnail: s3bucketpath.Location,
      });
    }
    //console.log("dataImageArray",dataImageArray);
    return dataImageArray;
  } catch (err) {
    throw err;
  }
};

let getTokenFromDBForCustomer = async (request, res, next) => {
  console.log(
    "======================getTokenFromDBForCustomer================"
  );
  var token =
    request.payload != null && request.payload.authorization
      ? request.payload.authorization
      : request.params && request.params.authorization
      ? request.params.authorization
      : request.headers["authorization"];
  let userData = null;
  let usertype, userId, criteria; //console.log("token==1",token);
  try {
    if (typeof token == "undefined" || token == "null" || token == null) {
      throw ERROR.ACCESS_TOKEN_NULL;
    }
    let decoded = jwt.verify(token, APP_CONSTANTS.JWT_KEY);

    if (decoded.data.role == APP_CONSTANTS.USER_ROLES.CUSTOMER) {
      let userData = decoded.data;
      userData.accessToken = token;
      let checkToken = await checkCustomerToken(userData);
      return checkToken;
    } else {
      throw ERROR.INVALID_ACCESS_TOKEN;
    }
  } catch (err) {
    //console.log("==========catch=======errrrr====",err);
    if (typeof err == "object" && err.hasOwnProperty("statusCode")) {
      return sendError(err);
    } else {
      return sendError(ERROR.INVALID_ACCESS_TOKEN);
    }
  }
};

const sendNotificationUsingFCM = async (payloadData) => {
  var fcmCli = new FCM(FCM_KEY); // YOUR_API_KEY_HERE.
  try {
    var message = {
      //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: payloadData.deviceToken,
      notification: {
        title: payloadData.message, //'Title of your push notification',
        body: payloadData,
        sound: "default",
        badge: "1",
        image:
          "https://image.shutterstock.com/image-photo/surreal-image-african-elephant-wearing-600w-1365289022.jpg",
      },
      //data:payloadData.userData || {}
    };
    await fcmCli.send(message, function (err, response) {
      if (err) {
        console.log("Something has gone wrong!", err);
      } else {
        console.log("Successfully sent with response: ", response);
      }
    });
  } catch (err) {
    console.log("err", err);
    throw err;
  }
};

const sendNotificationMultipleDeviceUsingFCM2 = async (payloadData) => {
  var fcmCli = new FCM(FCM_KEY); // YOUR_API_KEY_HERE.
  try {
    let firstName = "";
    let lastName = "";
    //  let finalMessage = payloadData.message.replace("{FirstName}", firstName).replace("{LastName}", lastName);
    //  console.log(finalMessage)
    payloadData.getNotificationData.forEach((element) => {
      console.log("array there", element);
      console.log("type", payloadData.type);
      if (payloadData.type == APP_CONSTANTS.USER_ROLES.CUSTOMER) {
        firstName = element.firstName;
        // lastName = element.lastName;
      } else if (payloadData.type == APP_CONSTANTS.USER_ROLES.DRIVER) {
        firstName = element.fullName;
      } else if (payloadData.type == APP_CONSTANTS.USER_ROLES.RESTAURANT) {
        firstName = element.restaurantName;
      } else {
        throw APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_USER_TYPE;
      }

      let finalMessage = payloadData.message
        .replace("{FirstName}", firstName)
        .replace("{LastName}", lastName);
      console.log(finalMessage);
      var message = {
        //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: element.deviceToken,
        notification: {
          title: payloadData.title, //'Title of your push notification',
          body: finalMessage,
          sound: "default",
          badge: "1",
          image: payloadData.fileUrl,
        },
        //data:payloadData.userData || {}
      };
      fcmCli.send(message, function (err, response) {
        console.log("Response", response);
        console.log("err", err);
      });
    });
  } catch (err) {
    console.log("err", err);
    throw err;
  }
};

const sendNotificationMultipleDeviceUsingFCM = async (payloadData) => {
  var fcmCli = new FCM(FCM_KEY); // YOUR_API_KEY_HERE.
  try {
    let deviceIds = [];
    payloadData.getNotificationData.forEach((element) => {
      deviceIds.push(element.deviceToken);
    });
    var message = {
      //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      registration_ids: deviceIds,
      notification: {
        title: payloadData.title, //'Title of your push notification',
        body: payloadData.message,
        sound: "default",
        badge: "1",
        image:
          "https://image.shutterstock.com/image-photo/surreal-image-african-elephant-wearing-600w-1365289022.jpg",
      },
      data: payloadData.userData || {},
    };
    console.log("message", message);
    await fcmCli.send(message, function (err, response) {
      if (err) {
        console.log("Something has gone wrong!", err);
      } else {
        console.log("Successfully sent with response: ", response);
      }
    });
  } catch (err) {
    console.log("err", err);
    throw err;
  }
};

let uploadDocumentOnS3BucketAWSSDK = async (ImagePath, folder, contentType) => {
  AWS_SDK.config.update({
    accessKeyId: S3_BUCKET_CREDENTIALS.accessKeyId,
    secretAccessKey: S3_BUCKET_CREDENTIALS.secretAccessKey,
    region: S3_BUCKET_CREDENTIALS.region,
  });
  let s3 = new AWS_SDK.S3({ apiVersion: "2014-10-01" });
  let filePath = Path.resolve(".") + "/" + ImagePath;
  if (folder) {
    folderPath = folder;
  } else {
    folderPath = "restaurant/";
  }
  let params = {
    Bucket: S3_BUCKET_CREDENTIALS.bucket,
    ContentType: contentType, //'image/jpg',
    Body: fs.createReadStream(filePath),
    //Key : "category1/"+Path.basename(filePath),
    Key: folderPath + "/" + Path.basename(filePath),
    ACL: "public-read",
  };
  let promiseT = s3.upload(params).promise();
  try {
    let d1 = await promiseT
      .then((data) => {
        deleteFileOnOnLocalMachine(ImagePath);
        return data;
      })
      .catch(function (err) {
        let SOMETHING_WENT_WRONG = ERROR.SOMETHING_WENT_WRONG;
        SOMETHING_WENT_WRONG.genuineError = JSON.stringify(err);
        throw SOMETHING_WENT_WRONG; //SOMETHING_WENT_WRONG
      });
    return d1;
  } catch (err) {
    throw err;
  }
};

let deleteFileOnOnLocalMachine = async (path) => {
  try {
    await fsExtra.remove(path);
    // fsExtra.remove(path, function (err) {
    //   if(err) {
    //       console.log("========deleteFileOnLocalMachine===errr=",err);
    //   }
    //   console.log('======deleteFileOnLocalMachine========',path)
    // });
    console.log("===deleteFileOnLocalMachine===", path);
    return true;
  } catch (error) {
    throw error;
  }
};

let convertCsvToJson = async (filePath) => {
  console.log("asasdasdsa", filePath);
  try {
    let fileData = await csvToJson().fromFile(filePath);
    return fileData;
  } catch (error) {
    throw error;
  }
};

let storePushNotification = async (NotificationData) => {
  try {
    await Service.NotificationStoreService.InsertData(NotificationData);
    return true;
  } catch (err) {
    //console.log("==========catch=======errrrr====",err);
    throw err;
  }
};

let generateOrderHtmlAndSendEmail = async (htmlData) => {
  try {
    let rowHtml = `<div style="margin:0;padding:0 15px">
    <table width="100%" cellspacing="0" cellpadding="0" style="margin:0;padding:0">
        <thead style="margin:0;padding:0;text-align:left;background:#e9e9e9;border-collapse:collapse;border-spacing:0;border-color:#ccc">
        <tr style="margin:0;padding:0">
            <th style="margin:0;padding:10px 15px;font-size:13px">Item Name</th>
            <th style="margin:0;padding:10px 15px;font-size:13px;text-align:right;padding-right:180px">Quantity</th>
            <th align="right" style="margin:0;padding:10px 15px;font-size:13px">Price</th>
        </tr>
        </thead>
        <tbody style="margin:0;padding:0">`;
    htmlData.emailDataHtml.forEach((element) => {
      rowHtml =
        rowHtml +
        `<tr style="margin:0;padding:0">
                        <td style="vertical-align:top;margin:0;padding:10px;font-weight:normal;font-size:13px">` +
        element.dishName +
        `</td>
                        <td style="margin:0;text-align:right;padding:10px;font-weight:normal;font-size:13px;padding-right:200px">` +
        element.quantity +
        `</td>
                        
                        <td align="right" style="margin:0;padding:10px;font-weight:normal;font-size:13px;padding-right:15px">₹&nbsp;` +
        element.itemTotalPrice +
        ` </td>
                    </tr>
                    
                    <tr width="100%">
                        <td>
                            <div style="min-height:1px;width:100%;background:#e9e9e9;clear:both"></div>
                        </td>
                        <td>
                            <div style="min-height:1px;width:100%;background:#e9e9e9;clear:both"></div>
                        </td>
                        <td>
                            <div style="min-height:1px;width:100%;background:#e9e9e9;clear:both"></div>
                        </td>
                    </tr>`;
    });
    rowHtml = rowHtml + `<tr><td><span><span></span></span></td></tr>`;
    rowHtml =
      rowHtml +
      `<tr style="margin:0;padding:0">
                    <td width="80%" scope="row" colspan="2" style="margin:0;padding:10px 0;text-align:right;font-weight:normal;border:0;font-size:13px">Item Total:</td>
                    
                    <td width="20%" style="margin:0;padding:5px 0;font-weight:normal;border-bottom:0px solid #e9e9e9;font-size:13px;text-align:right;border:0;padding-right:15px"> ₹&nbsp;210.00</td>
                </tr>`;
    rowHtml = rowHtml + `<tr><td><span><span></span></span></td></tr>`;
    rowHtml =
      rowHtml +
      `<tr style="margin:0;padding:0">
                    <td width="80%" scope="row" colspan="2" style="margin:0;padding:10px 0;text-align:right;font-weight:normal;border:0;font-size:13px">Order Packing Charges:</td>
                    
                    <td width="20%" style="margin:0;padding:5px 0;font-weight:normal;border-bottom:0px solid #e9e9e9;font-size:13px;text-align:right;border:0;padding-right:15px"> ₹&nbsp;10.00</td>
                </tr>`;
    rowHtml = rowHtml + `<tr><td><span><span></span></span></td></tr>`;
    rowHtml =
      rowHtml +
      `<tr style="margin:0;padding:0"><td width="80%" scope="row" colspan="2" style="margin:0;padding:10px 0;text-align:right;font-weight:normal;border:0;font-size:13px">Delivery Charges:</td>
    <td width="20%" style="margin:0;padding:5px 0;font-weight:normal;border-bottom:0px solid #e9e9e9;font-size:13px;text-align:right;border:0;padding-right:15px"> ₹&nbsp;15.00</td></tr>`;
    //Discount Applied
    rowHtml = rowHtml + `<tr><td><span><span></span></span></td></tr>`;
    rowHtml =
      rowHtml +
      `<tr style="margin:0;padding:0"><td width="80%" scope="row" colspan="2" style="margin:0;padding:10px 0;text-align:right;font-weight:normal;border:0;font-size:13px">Discount Applied (BIRTHDAY):</td><td width="20%" style="margin:0;padding:5px 0;font-weight:normal;border-bottom:0px solid #e9e9e9;font-size:13px;text-align:right;border:0;padding-right:15px">- ₹&nbsp;99.99</td></tr>`;
    //Taxes
    rowHtml = rowHtml + `<tr><td><span><span></span></span></td></tr>`;
    rowHtml =
      rowHtml +
      `<tr style="margin:0;padding:0"><td width="80%" scope="row" colspan="2" style="margin:0;padding:10px 0;text-align:right;font-weight:normal;border:0;font-size:13px">Taxes:</td>
    <td width="20%" style="margin:0;padding:5px 0;font-weight:normal;border-bottom:0px solid #e9e9e9;font-size:13px;text-align:right;border:0;padding-right:15px"> ₹&nbsp;7.80</td></tr>`;
    //back row
    rowHtml =
      rowHtml +
      `<tr width="100%"><td><div style="width:100%;clear:both"></div></td><td><div style="min-height:15px;width:100%;clear:both"></div></td><td><div style="min-height:15px;width:100%;clear:both"></div></td></tr>`;

    rowHtml =
      rowHtml +
      `<tr style="margin:0;padding:0;color:#79b33b;background:#f9f9f9"><th width="80%" scope="row" colspan="2" style="margin:0;padding:10px 0;text-align:right;font-weight:bold;border:0;font-size:13px">Grand Total:</th><td width="20%" style="margin:0;padding:10px 0;font-weight:bold;border-bottom:1px solid #e9e9e9;font-size:13px;text-align:right;border:0;padding-right:15px"> ₹&nbsp;143</td></tr>`;
    rowHtml = rowHtml + `</table></div>`;

    let EmailPayloadData = {
      to: htmlData.customerData.email,
      subject:
        "Your bytebots order summary for order no." + htmlData.orderAuoIncrement,
    };
    let templatepath = Path.join(__dirname, "../emailTemplates/");
    let fileReadStream =
      templatepath + APP_CONSTANTS.EMAIL_TEMPLATES.ORDER_PLACE;
    let emailTemplate = await readFilePromise(fileReadStream);
    emailTemplate = emailTemplate.toString();
    let appName = APP_CONSTANTS.APP_DETAILS.APP_NAME;
    let logo = APP_CONSTANTS.APP_DETAILS.LOGO;
    let userName =
      htmlData.customerData.firstName + " " + htmlData.customerData.lastName;
    console.log("EmailPayloadData", EmailPayloadData);

    let sendStr = emailTemplate
      .replace("{{appName}}", appName)
      .replace("{{logo}}", logo)
      .replace("{{orderNumber}}", htmlData.orderAuoIncrement)
      .replace("{{userName}}", userName)
      .replace("{{restaurantName}}", htmlData.restaurantName)
      .replace("{{orderNumber}}", htmlData.orderAuoIncrement)
      .replace("{{orderPlaceDate}}", htmlData.createdAt)
      .replace("{{vendorFullAddress}}", htmlData.vendorFullAddress)
      .replace("{{addressFirstLine}}", htmlData.address)
      .replace("{{buildingAddress}}", htmlData.buildingAddress)
      .replace("{{flatNumber}}", htmlData.flatNumber)
      .replace("{{landmark}}", htmlData.landmark)
      .replace("{{restaurantName}}", htmlData.restaurantName)
      .replace("{{userName}}", userName)
      .replace("{{tableData}}", rowHtml);
    EmailPayloadData.html = sendStr;
    sendMail(EmailPayloadData);

    //console.log("rowHtml",rowHtml);
    return rowHtml;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generatePassword: generatePassword,
  sendError: sendError,
  generateRandomString: generateRandomString,
  encryptedPassword: encryptedPassword,
  generateAuthToken: generateAuthToken,
  successResponse: successResponse,
  failActionFunction: failActionFunction,
  getTokenFromDBForCustomer: getTokenFromDBForCustomer,
  checkDeviceTokenAndDelete: checkDeviceTokenAndDelete,
  uploadFiles: uploadFiles,
  uploadMultipleFiles: uploadMultipleFiles,
  uploadDocumentOnLocalMachine: uploadDocumentOnLocalMachine,
  uploadDocumentOnLocalMachineUsingFile: uploadDocumentOnLocalMachineUsingFile,
  uploadDocumentOnS3BucketAWSSDK: uploadDocumentOnS3BucketAWSSDK,
  sendNotificationUsingFCM: sendNotificationUsingFCM,
  sendSMS: sendSMS,
  sendMail: sendMail,
  sendNotificationMultipleDeviceUsingFCM:
    sendNotificationMultipleDeviceUsingFCM,
  convertCsvToJson: convertCsvToJson,
  storePushNotification: storePushNotification,
  generateOrderHtmlAndSendEmail: generateOrderHtmlAndSendEmail,
  sendNotificationMultipleDeviceUsingFCM2:
    sendNotificationMultipleDeviceUsingFCM2,
  uploadFilesWithCloudinary: uploadFilesWithCloudinary,
};
