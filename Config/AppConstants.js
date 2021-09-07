'use strict';
 /*----------------------------------------------------------------------------------
   * @ file        : AppConstants.js
   * @ description : It includes all the Constant values using in the application.
   * @ author      : Anurag Gupta
   * @ date        : 19/03/19.
-----------------------------------------------------------------------------------*/

let APP_DETAILS = {
    APP_NAME:'Eboyo',
    LOGO : 'https://eboyofood.s3.us-east-2.amazonaws.com/eboyologo.png',
    PDF_FILE_PATH : './pdfFile/',
    BASE_URL: 'http://localhost:3002/',
    FRONT_END_BASE_URL_FOR_RESET_PASSWORD: 'https://admin.eboyo.co.in/#/reset_password',
}

let EMAIL_TEMPLATES = {
    FORGOT_PASSWORD : 'forgotPassword.html',
    ORDER_PLACE : 'placeOrder.html',
}

let WORKING_DAYS = {
    MONDAY : 'Monday',
    TUESDAY : 'Tuesday',
    WEDNESDAY : 'Wednesday',
    THURSDAY : 'Thursday',
    FRIDAY : 'Friday',
    SATURDAY : 'Saturday',
    SUNDAY : 'Sunday'
}

// let MOBILE_SMS = Math.floor(1000 + Math.random() * 9000);
let MOBILE_SMS = 1234;

let NOTIFICATION_MESSAGE={
    ORDER_ACCEPTED:"Restaurent has accepted your order"
}

let SEND_GRID_DETAILS = { //SendgridTransport
    HOST:"smtp.sendgrid.net",
    FROM:"kushmalout@gmail.com",
    SMTP_USER:"deondeApp",
    SMTP_PASSWORD:"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",
}

let SMS_KEYS_DETAILS = {
    URL:"http://sms.gniwebsolutions.com/submitsms.jsp",
    API_USER:"gniweb2",
    API_KEY:"a08f1ade94XX",
    SENDER_ID:"SEPLBZ",
}

let RAZORPAY_KEYS_DETAILS = {
    KEY_ID: "rzp_live_TiE8K23NIZP59S", //rzp_test_e529MbkfogutlO
    KEY_SECRET: "QUGgGIKZ8wbkomdWuqm10epg",
  };

  let RAZORPAY_X_KEYS_DETAILS = {
    KEY_ID: "rzp_live_TiE8K23NIZP59S", //rzp_test_65XcijwZsuxIGr
    KEY_SECRET: "QUGgGIKZ8wbkomdWuqm10epg", //VxawI2eWSo9H0krjCj1jxYQT
    ACCOUNT_NUMBER: "2323230061968016",
  };

  let RAZORPAY_X_BASE_URL = {
      URL: "https://api.razorpay.com/v1/",
  }


let S3_BUCKET_CREDENTIALS= {
    "bucket": "glimpsters",
    "accessKeyId": "AKIAWTJXM4TMH6R57UW2",//"AKIA3OPX7BUORQOVAQ7T",  
    "secretAccessKey": "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",//"wEgyOH0bYGeov5C0hfcn4EKDi6wkt++6mJlPdCVg",  
    "s3URL": "https://glimpsters.s3.amazonaws.com",//"https://eboyo.s3.ap-south-1.amazonaws.com",
    "region":"us-east-1",//"ap-south-1",  
    "folder": {
        "profilePicture": "profilePicture",
        "thumb": "thumb"
    }
}

let LANGUAGE_SPECIFIC_MESSAGE  = {  //languageSpecificMessages
    verificationCodeMsg : {
        EN : 'Your 4 digit verification code for Eboyo is ',
        ES_MX : 'Your 4 digit verification code for Eboyo is '
    }
};

let FOLDER_NAME={
    images:"images",
    Driver_KYC:"driverKyc",
    BANNER_IMAGES:"banner"
}

let DRIVER_BONUS_TYPES={
    DAILY   : "Daily",
    WEEKLY  : "Weekly",
    MONTHLY : "Monthly",
    YEARLY  : "Yearly",

}

let EVENT_TYPE = {
    LOGIN : "Login",
    LOGOUT : "Logout",
}

let SETTINGS_TYPE = {
    BUSSINESS_AVAILABILITY   : "Bussiness_Availability",
    BUSSINESS_HOURS          : "Bussiness_Hours",
    SERVER_KEYS              : "Server_Keys",
    DELIVERY_PERSONS         : "Delivery_Persons",
    APP_VERSIONS             : "App_Versions",
    SMS_KEYS                 : "Sms_Keys",
    PANEL_THEMES             : "Panel_Themes",
}

let FRONT_END_ROUTES = {
    LOGIN_ROUTE                 : "login",
    REGISTER_ROUTE              : "register",
    FORGOT_PASSWORD_ROUTE       : "forgot_password",
    ABOUT_US_ROUTE              : "about",
    CONTACT_US_ROUTE            : "contact",
    FAQ_ROUTE                   : "faq",
}

let USER_AGENT_OPTIONS = {
    USER_ID     : "userId",
    PLATFORM    : "platForm",    
    BROWSER     : "browser" ,     
    IP_ADDRESS  : "ipAddress",
}

// 1 Rupay in Paise
let RUPAY_TO_PAISE = 100;

let ADMIN_COMMISSION_TYPES = {
    FIXED:"Fixed",
    PERCENTAGE:"Percentage",
}
let RESTAURANT_FOOD_TYPE= {
    All:"All",
    PURE_VEG:"PureVeg",
    NON_VEG:"NonVeg",    
    NOT_APPLICABLE:"Not Applicable",
}

let DELIVERY_TYPES = {
    BOTH:"Both",
    DELIVERY:"Delivery",
    PICKUP:"Pickup",
}

let DEVICE_TYPES = {
    ANDROID:"ANDROID",
    IOS:"IOS",
    WEB:"WEB"
}

let GENDER_TYPES= {
    MALE:"Male",
    FEMALE:"Female",
}

let SOCIAL_MODE_TYPE ={
    FACEBOOK:"Facebook",
    GOOGLE:"GOOGLE",
}

let CURRENCY = {
   INR:"INR",
}

let PAYMENT_MODE = {
    IMPS:"IMPS",
}

let DOCUMENT_FILE_SIZE= {
    IMAGE_SIZE:1000000*11,//11 MB
    VIDEO_SIZE:1000000*21,//21 MB
}

let TRANSACTION_TYPES = {
    DRIVER_ADD_MONEY_TO_RAZORPAY:"Driver_Add_Money_To_Razorpay",
    CUSTOMER_ADD_MONEY_TO_RAZORPAY:"Customer_Add_Money_To_Razorpay",
    ADMIN_ADD_MONEY_TO_CUSTOMER:"Admin_Add_Money_To_Customer",
    ADMIN_ADD_MONEY_TO_DRIVER : "Admin_Add_Money_To_Driver",
    ADMIN_ADD_MONEY_TO_RESTAURANT :"Admin_Add_Money_To_Restaurant",
    ORDER_CREATE_RAZORPAY:"ORDER_CREATE_RAZORPAY",
    ORDER_TRANSACTION:"ORDER_TRANSACTION",
    SUBMIT_WITHDRAW_FROM_DRIVER:"SUBMIT_WITHDRAW_FROM_DRIVER",
    SUBMIT_WITHDRAW_FROM_RESTAURANTS:"SUBMIT_WITHDRAW_FROM_RESTAURANTS",
}
//let FCM_KEY = "AAAAvzuBO9Q:APA91bGYSYkDkjHX1TgSCkMB2F6AfBCISGliiLP-wuK78Utx2fzHC2augr1KfjEWqrK_9C7N6jTL633Lp6GEcON1aaMOoeN3X_DkYENxGhFt808YfvWq1X7FxWYiUH00gKDt6a1JpBuK";
let FCM_KEY ="AAAA2jm6Z1U:APA91bFuyY14y1s-rXNU2nnAVw0F149sg1AX2FCjwoaZhH7UqAOFWtJYwv_7K7ljxtr-ukmkA99f365hytQJ7xxo2HN1YJ7lxlxtCm1CW1DN3Bjp0lcUtp5S52al0t3MuuDWYRKmbbA8"


let  swaggerDefaultResponseMessages = [
    {code: 200, message: 'OK'},
    {code: 400, message: 'Bad Request'},
    {code: 401, message: 'Unauthorized'},
    {code: 404, message: 'Data Not Found'},
    {code: 500, message: 'Internal Server Error'}
];


let DEFAULT_RESTAURANT_WORKING_TIME=[
    {"dayName" : "Monday","isRestaurantOpenOrNot" : true,"startHour" : 0,"startMinutes" : 0,
    "endHour" : 23,"endMinutes" : 59},
    {"dayName" : "Tuesday","isRestaurantOpenOrNot" : true,"startHour" : 0,"startMinutes" : 0,
    "endHour" : 23,"endMinutes" : 59},
    {"dayName" : "Wednesday","isRestaurantOpenOrNot" : true,"startHour" : 0,"startMinutes" : 0,
    "endHour" : 23,"endMinutes" : 59},
    {"dayName" : "Thursday","isRestaurantOpenOrNot" : true,"startHour" : 0,"startMinutes" : 0,
    "endHour" : 23,"endMinutes" : 59},
    {"dayName" : "Friday","isRestaurantOpenOrNot" : true,"startHour" : 0,"startMinutes" : 0,
    "endHour" : 23,"endMinutes" : 59},
    {"dayName" : "Saturday","isRestaurantOpenOrNot" : true,"startHour" : 0,"startMinutes" : 0,
    "endHour" : 23,"endMinutes" : 59},
    {"dayName" : "Sunday","isRestaurantOpenOrNot" : true,"startHour" : 0,"startMinutes" : 0,
    "endHour" : 23,"endMinutes" : 59},
]






let STATUS_MSG = {
    SUCCESS: {
        CREATED: {
            statusCode:201,
            customMessage : 'Created Successfully',
            type : 'CREATED'
        },
        DEFAULT: {
            statusCode:200,
            customMessage : 'Success',
            type : 'DEFAULT'
        },
        DELETED: {
            statusCode:200,
            customMessage : 'Deleted Successfully',
            type : 'DELETED'
        },
        LOGOUT: {
            statusCode:200,
            customMessage : 'Logged Out Successfully',
            type : 'LOGOUT'
        },
        UPDATED: {
            statusCode:200,
            customMessage : 'Updated Successfully',
            type : 'UPDATED'
        },
    },
    ERROR: {
        ALREADY_ORDER_REQUEST_SEND_DRIVER: {
            statusCode:400,
            customMessage : 'Alreday send request to driver',
            type : 'ALREADY_ORDER_REQUEST_SEND_DRIVER'
        },
    	APP_ERROR: {
            statusCode:400,
            customMessage : 'Application Error',
            type : 'APP_ERROR'
        },
        PAYMENT_GETEWAY_ALREADY_EXIST: {
            statusCode:400,
            customMessage : 'Payment Geteway already exist please try another..',
            type : 'PAYMENT_GETEWAY_ALREADY_EXIST'
        },
        BANNER_NAME_ALREADY_EXISTS:{
            statusCode:400,
            customMessage : 'Banner name already exists',
            type : 'BANNER_NAME_ALREADY_EXISTS'
        },
        EVENT_NAME_ALREADY_EXIST:{
            statusCode:400,
            customMessage : 'Event name already exists please try another event',
            type : 'EVENT_NAME_ALREADY_EXIST'
        },
        CITY_ALREADY_EXISTS: {
            statusCode:400,
            customMessage : 'City already exists',
            type : 'CITY_ALREADY_EXISTS'
        },
        CUSTOMER_ALREADY_EXISTS: {
            statusCode:400,
            customMessage : 'Customer already exists',
            type : 'CUSTOMER_ALREADY_EXISTS'
        },
        MENU_ALREADY_EXISTS: {
            statusCode:400,
            customMessage : 'Menu already exists',
            type : 'MENU_ALREADY_EXISTS'
        },
        INVALID_CUSTOMER_ID: {
            statusCode:400,
            customMessage : 'Invalid customer Id',
            type : 'INVALID_CUSTOMER_ID'
        },
        INVALID_NOTIFICATION_ID: {
            statusCode:400,
            customMessage : 'Invalid notification Id',
            type : 'INVALID_NOTIFICATION_ID'
        },
        INVALID_PROMOCODE_ID: {
            statusCode:400,
            customMessage : 'Invalid promo code Id',
            type : 'INVALID_PROMOCODE_ID'
        },
        INVALID_BANNER_ID: {
            statusCode:400,
            customMessage : 'Invalid banner code Id',
            type : 'INVALID_BANNER_ID'
        },
        INVALID_RESTAURANT_SERVICE_AREA_ID: {
            statusCode:400,
            customMessage : 'Invalid restaurant service area Id',
            type : 'INVALID_RESTAURANT_SERVICE_AREA_ID'
        },
        INVALID_MENU_ID: {
            statusCode:400,
            customMessage : 'Invalid Menu Id',
            type : 'INVALID_MENU_ID'
        },
        INVALID_PAYMENT_GETEWAY_ID: {
            statusCode:400,
            customMessage : 'Invalid Payment Geteway Id',
            type : 'INVALID_PAYMENT_GETEWAY_ID'
        },
        INVALID_LOCATION_ID: {
            statusCode:400,
            customMessage : 'Invalid location Id',
            type : 'INVALID_LOCATION_ID'
        },
        RESTAURANT_ALREADY_MAPED_OTHER_POLYGON: {
            statusCode:400,
            customMessage : 'Restaurant alreday maped in other polygon',
            type : 'RESTAURANT_ALREADY_MAPED_OTHER_POLYGON'
        },
        PAYMENT_ALREADY_BEEN_CAPTURED: {
            statusCode:400,
            customMessage : 'Payment already been captured',
            type : 'PAYMENT_ALREADY_BEEN_CAPTURED'
        },
        PAYMENTS_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Payment not found',
            type : 'PAYMENTS_NOT_FOUND'
        },
        CUSTOMER_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Customer not found',
            type : 'CUSTOMER_NOT_FOUND'
        },
        BANNER_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Banner not found',
            type : 'BANNER_NOT_FOUND'
        },
        MENU_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Menu not found',
            type : 'MENU_NOT_FOUND'
        },
        PAYMENT_ID_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Payment id not found',
            type : 'PAYMENT_ID_NOT_FOUND'
        },
        DB_ERROR: {
            statusCode:400,
            customMessage : 'DB Error.',
            type : 'DB_ERROR'
        },
        DEVICE_TOKEN_ALREADY_EXISTS:{
            statusCode:400,
            customMessage : 'Device Token already exists',
            type : 'DEVICE_TOKEN_ALREADY_EXISTS'
        },
        DUPLICATE: {
            statusCode:400,
            customMessage : 'Duplicate entry',
            type : 'DUPLICATE'
        },
        DISH_ALREADY_EXISTS: {
            statusCode:400,
            customMessage : 'Dish already exists',
            type : 'DISH_ALREADY_EXISTS'
        },
        RESTAURANT_DAY_ALREADY_EXISTS: {
            statusCode:400,
            customMessage : 'Restauran Day already exists',
            type : 'RESTAURANT_DAY_ALREADY_EXISTS'
        },
        EMAIL_ALREADY_EXISTS: {
            statusCode:400,
            customMessage : 'Email already exists',
            type : 'EMAIL_ALREADY_EXISTS'
        },
        EMAIL_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Email not found',
            type : 'EMAIL_NOT_FOUND'
        },
        ERROR_IN_EXECUTION:{
            statusCode:400,
            customMessage : 'ERROR INEXECUTION',
            type : 'ERROR_IN_EXECUTION'
        },
        FACEBOOK_ID_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Facebook id not found',
            type : 'FACEBOOK_ID_NOT_FOUND'
        },
        FACEBOOK_ID_PASSWORD_ERROR: {
            statusCode:400,
            customMessage : 'Only one field should be filled at a time, either facebookId or password',
            type : 'FACEBOOK_ID_PASSWORD_ERROR'
        },
        IMP_ERROR: {
            statusCode:500,
            customMessage : 'Implementation Error',
            type : 'IMP_ERROR'
        },
        INCORRECT_OLD_PASS: {
            statusCode:400,
            customMessage : 'Incorrect old password',
            type : 'INCORRECT_OLD_PASS'
        },
        INCORRECT_PASSWORD_OTP: {
            statusCode:400,
            customMessage : 'Incorrect OTP',
            type : 'INCORRECT_PASSWORD_OTP'
        },
        INVALID_IMAGE_FORMAT: {
            statusCode:400,
            customMessage : 'Invalid image format',
            type : 'INVALID_IMAGE_FORMAT'
        },
        RAZORPAY_ID_IS_REQUIRED: {
            statusCode:400,
            customMessage : 'Razorpay Id id required',
            type : 'RAZORPAY_ID_IS_REQUIRED'
        },
        SCHEDULE_ORDER_DATE_IS_REQUIRED: {
            statusCode:400,
            customMessage : 'Schedule Order is required.',
            type : 'SCHEDULE_ORDER_DATE_IS_REQUIRED' 
        },
        PLEASE_FUTURE_DATE: {
            statusCode:400,
            customMessage : 'Please select the future date from 24 hours after now.',
            type : 'PLEASE_FUTURE_DATE'
        },
        INVALID_RAZORPAY_ID: {
            statusCode:400,
            customMessage : 'Invalid razorpay Id',
            type : 'INVALID_RAZORPAY_ID'
        },
        INVALID_ADDRESS_ID: {
            statusCode:400,
            customMessage : 'Invalid address Id',
            type : 'INVALID_ADDRESS_ID'
        },
        ACCESS_TOKEN_NULL: {
            statusCode:401,
            customMessage : 'Access token can not null',
            type : 'ACCESS_TOKEN_NULL'
        },
        
        INVALID_ACCESS_TOKEN: {
            statusCode:401,
            customMessage : 'Invalid access token',
            type : 'INVALID_ACCESS_TOKEN'
        },
        INVALID_DRIVER_ID: {
            statusCode:400,
            customMessage : 'Invalid driver Id',
            type : 'INVALID_DRIVER_ID'
        },
        INVALID_FAQ_ID: {
            statusCode:400,
            customMessage : 'Invalid faq Id',
            type : 'INVALID_FAQ_ID'
        },
        INVALID_BANNER_ID: {
            statusCode:400,
            customMessage : 'Invalid banner Id',
            type : 'INVALID_BANNER_ID'
        },
        INVALID_CUISINE_ID: {
            statusCode:400,
            customMessage : 'Invalid cuisine Id',
            type : 'INVALID_CUISINE_ID'
        },
        INVALID_SETTING_ID: {
            statusCode:400,
            customMessage : 'Invalid setting Id',
            type : 'INVALID_SETTING_ID'
        },
        ROUTE_ALREADY_EXIST: {
            statusCode:400,
            customMessage : 'route already exist',
            type : 'ROUTE_ALREADY_EXIST'
        },
        INVALID_BANK_ID: {
            statusCode:400,
            customMessage : 'Invalid bank Id',
            type : 'INVALID_BANK_ID'
        },
        BANK_DETAIL_NOT_FOUND: {
            statusCode:400,
            customMessage : 'Bank detail not found.',
            type : 'BANK_DETAIL_NOT_FOUND'
        },
        INVALID_SUB_ADMIN_ID: {
            statusCode:400,
            customMessage : 'Invalid sub admin Id',
            type : 'INVALID_SUB_ADMIN_ID'
        },
        INVALID_ADDRESS_ID: {
            statusCode:400,
            customMessage : 'Invalid address Id',
            type : 'INVALID_ADDRESS_ID'
        },
        INVALID_RESTAURANT_ID : {
            statusCode:400,
            customMessage : 'Invalid restaurant Id',
            type : 'INVALID_RESTAURANT_ID'
        },
        INVALID_PROMO_CODE_ID : {
            statusCode:400,
            customMessage : 'Invalid promo code Id',
            type : 'INVALID_PROMO_CODE_ID'
        },
        DRIVER_RATING_ALREADY_SUBMITED: {
            statusCode:400,
            customMessage : 'You have already submited rating for this order.',
            type : 'DRIVER_RATING_ALREADY_SUBMITED'
        },
        RESTAURANT_RATING_ALREADY_SUBMITED: {
            statusCode:400,
            customMessage : 'You have already submited rating for this restaurant.',
            type : 'RESTAURANT_RATING_ALREADY_SUBMITED'
        },
        INVALID_CUISINE_ID: {
            statusCode:400,
            customMessage : 'Invalid cuisine Id',
            type : 'INVALID_CUISINE_ID'
        },
        INVALID_ORDER_ID: {
            statusCode:400,
            customMessage : 'Invalid order Id',
            type : 'INVALID_ORDER_ID'
        },
        INVALID_COUNTRY_CODE: {
            statusCode:400,
            customMessage : 'Invalid Country Code, Should be in the format +91',
            type : 'INVALID_COUNTRY_CODE'
        },
        YOU: {
            statusCode:400,
            customMessage : 'Invalid image format',
            type : 'INVALID_IMAGE_FORMAT'
        },
        INVALID_COMMENT_ID: {
            statusCode:400,
            customMessage : 'Invalid comment id',
            type : 'INVALID_COMMENT_ID'
        },
        INVALID_INVITATION_ID: {
            statusCode:400,
            customMessage : 'Invalid invitation id',
            type : 'INVALID_INVITATION_ID'
        },
        INVALID_LATITUDE_LOGITUDE: {
            statusCode:400,
            customMessage : "Please enter Valid latitude and longitude",
            type : 'INVALID_LATITUDE_LOGITUDE'
        }, 
        
        INVALID_EMAIL_PASSWORD: {
            statusCode:400,
            customMessage : 'Invalid email or password',
            type: 'INVALID_EMAIL_PASSWORD'
        },
        INVALID_PHONE_NUMBER_AND_PASSWORD: {
            statusCode:400,
            customMessage : 'Invalid mobile or password',
            type: 'INVALID_PHONE_NUMBER_AND_PASSWORD'
        },
        INVALID_FILE: {
            statusCode:400,
            customMessage : 'Invalid file',
            type: 'INVALID_FILE'
        },
        INVALID_ID: {
            statusCode:400,
            customMessage : 'Invalid Id Provided.',
            type : 'INVALID_ID'
        }, 
        INVALID_CITY_ID: {
            statusCode:400,
            customMessage : 'Invalid cityId.',
            type : 'INVALID_CITY_ID'
        }, 
        INVALID_CATEGORY_ID: {
            statusCode:400,
            customMessage : 'Invalid category.',
            type : 'INVALID_CATEGORY_ID'
        },
        INVALID_OTP: {
            statusCode:400,
            customMessage : 'Please enter correct verification code',
            type : 'INVALID_OTP'
        },              
        INVALID_PROMO_CODE: {
            statusCode:400,
            customMessage : 'Invalid Promo Code',
            type : 'INVALID_PROMO_CODE'
        },
        INVALID_ADMIN_MENU_ID: {
            statusCode:400,
            customMessage : 'Invalid admin menu Id',
            type : 'INVALID_ADMIN_MENU_ID'
        },
        INVALID_USER_PASS: {
            statusCode:400,
            type: 'INVALID_USER_PASS',
            customMessage : 'Invalid username or password'
        },
        MOBILE_NUMBER_ALREADY_EXISTS: {
            statusCode:400,
            customMessage : 'Mobile number already exists',
            type : 'MOBILE_NUMBER_ALREADY_EXISTS'
        },
        NOT_FOUND: {
            statusCode:400,
            customMessage : 'User not found',
            type : 'NOT_FOUND'
        },
        NOT_FRIEND_REQUEST_FOUND: {
            statusCode:400,
            customMessage : 'No friend request Found',
            type : 'NOT_FRIEND_REQUEST_FOUND'
        },
        CATEGORY_NAME_EXISTS: {
            statusCode:400,
            customMessage : 'Category name exists',
            type : 'CATEGORY_NAME_EXISTS'
        },       
        PHONE_NO_EXIST: {
            statusCode:400,
            customMessage : 'Phone no already exist',
            type : 'PHONE_NO_EXIST'
        },
        TOKEN_NOT_VALID: {
            statusCode: 400,        
            customMessage: 'Invalid Token.',
            type: "TOKEN_NOT_VALID"
        },
        TOKEN_ALREADY_EXPIRED: {
            statusCode:401,
            customMessage : 'Token Already Expired',
            type : 'TOKEN_ALREADY_EXPIRED'
        },
        TOKEN_EXPIRED: {
            statusCode:400,
            customMessage : 'Token Expired Or Invalid',
            type : 'TOKEN_EXPIRED'
        },
        TOPPING_TITLE_ALREADY_EXISTS: {
            statusCode:400,
            customMessage : 'topping title exists',
            type : 'TOPPING_TITLE_ALREADY_EXISTS'
        },
        TOPPING_ITEM_ALREADY_EXISTS: {
            statusCode:400,
            customMessage : 'Topping item alredy exists',
            type : 'TOPPING_ITEM_ALREADY_EXISTS'
        },
        SUB_TOPPING_ITEM_ALREADY_EXISTS: {
            statusCode:400,
            customMessage : 'Sub topping item alredy exists',
            type : 'SUB_TOPPING_ITEM_ALREADY_EXISTS'
        },
        SOMETHING_WENT_WRONG: {
            statusCode:400,
            customMessage : 'Something went wrong. please try again after sometime.',
            type : 'SOMETHING_WENT_WRONG'
        },
        SELECT_EITHER_DISCOUNT_IN_PERCENTAGE_OR_AMOUNT:{
            statusCode:400,
            customMessage:'Either Select discountInPercentage or discountInAmount',
            type:'SELECT_EITHER_DISCOUNT_IN_PERCENTAGE_OR_AMOUNT'
        },
        UNAUTHORIZED: {
            statusCode:401,
            customMessage : 'You are not authorized to perform this action',
            type : 'UNAUTHORIZED'
        }, 
        USEAR_IS_BLOCK: {
            statusCode:400,
            customMessage : 'User is block.',
            type : 'USEAR_IS_BLOCK'
        },
        IMAGE_SIZE_LIMIT: {
            statusCode:400,
            customMessage : 'You can upload maxmuim 10mb image.',
            type : 'IMAGE_SIZE_LIMIT'
        },
        
        POLYGON_INTERSECTS: {
            statusCode:400,
            customMessage : 'Polygon Intersects',
            type : 'POLYGON_INTERSECTS'
        },
        PROMO_CODE_EXISTS: {
            statusCode:400,
            customMessage : 'Promo code exists',
            type : 'PROMO_CODE_EXISTS'
        },
        PROMO_CODE_ALREADY_EXPIRED: {
            statusCode:401,
            customMessage : 'Promo code  Expired',
            type : 'PROMO_CODE_ALREADY_EXPIRED'
        }, 
        ORDER_ALREADY_ACCEPTED: {
            statusCode:400,
            customMessage : 'Order already accepted by anotherdriver ',
            type : 'ORDER_ALREADY_ACCEPTED'
        },
        YOU_ALREADY_ACCEPT_ORDER: {
            statusCode:400,
            customMessage : 'you alreday accept the order.',
            type : 'YOU_ALREADY_ACCEPT_ORDER'
        },
        YOU_CAN_ADD_FOOD_ITEM_OF_DIFFERENT_RESTAURANT: {
            statusCode:400,
            customMessage : 'Please clear food item of another restaurant then add .',
            type : 'YOU_CAN_ADD_FOOD_ITEM_OF_DIFFERENT_RESTAURANT'
        },
        YOU_ALREADY_PICKED_THE_ORDER: {
            statusCode:400,
            customMessage : 'you alreday picked the order.',
            type : 'YOU_ALREADY_PICKED_THE_ORDER'
        },
        YOU_ALREADY_REACHED_CUSTOMER_LOCATION: {
            statusCode:400,
            customMessage : 'you alreday reached customer location.',
            type : 'YOU_ALREADY_REACHED_CUSTOMER_LOCATION'
        },
        YOU_ALREADY_DELIVERED_THE_RIDER: {
            statusCode:400,
            customMessage : 'you alreday delivered customer location.',
            type : 'YOU_ALREADY_DELIVERED_THE_RIDER'
        },
        YOU_CAN_NOT_PERFORM_THIS_ACTION: {
            statusCode:400,
            customMessage : 'You can not perform this action.',
            type : 'YOU_CAN_NOT_PERFORM_THIS_ACTION'
        },
        YOU_CAN_NOT_ADDRESS_DEFAULT: {
            statusCode:400,
            customMessage : 'You can not delete defalut address',
            type : 'YOU_CAN_NOT_ADDRESS_DEFAULT'
        },
        INVALID_USER_TYPE: {
            statusCode:400,
            customMessage : 'Entered user invalid please check and try again later...',
            type : 'INVALID_USER_TYPE'
        },
        AMOUNT_NOT_SUFFICIENT: {
            statusCode:400,
            customMessage : 'Entered amount not sufficient please check and try again later...',
            type : 'AMOUNT_NOT_SUFFICIENT'
        },
        RESTAURANT_NOT_AVAILABLE_ON_THIS_LOCATION: {
            statusCode:400,
            customMessage : 'Restaurant not available on this location',
            type : 'RESTAURANT_NOT_AVAILABLE_ON_THIS_LOCATION'
        },
        ADMIN_RESTAURANT_PERCENTAGE_CAN_NOT_ZERO: {
            statusCode:400,
            customMessage : 'ADMIN_RESTAURANT_PERCENTAGE_CAN_NOT_ZERO',
            type : 'ADMIN_RESTAURANT_PERCENTAGE_CAN_NOT_ZERO'
        },
        PERCENTAGE_NOT_GREATER_THEN_100: {
            statusCode:400,
            customMessage : 'PERCENTAGE_NOT_GREATER_THEN_100',
            type : 'PERCENTAGE_NOT_GREATER_THEN_100'
        },
        

    }

}
let JWT_KEY = "asedrftgyhujikadfaffererdeondeAppwesdfds@#$ds1257889"; 

let USER_ROLES = {
    ADMIN      : 'Admin',
    CUSTOMER   : 'Customer',
    DRIVER     : 'Driver',
    RESTAURANT : 'Restaurant',
    SUB_ADMIN  : 'SubAdmin'
}

let USER_FAVOURITE_TYPES = {
    RESTAURANT : 'Restaurant',
}


let USER_PERMISSIONS_OPTIONS = {
    ORDER              : 'order',
    VENDORS            : 'vendors',
    DELIVERY_ZONE      : 'deliveryZone',
    PROMO_CODE         : 'promoCode',
    DELIVERY_BOY       : 'deliveryBoy',
    CUSTOMERS          : 'customers',
    SETTINGS           : 'settings',
    CONTENT_PAGES      : 'contentPages',
    Finance            : 'finance',
    Cuisine            : 'cuisine',
    VENDOR_REQUESTS    : 'vendorRequests',
    REPORTS            : 'reports',
    PUSH_NOTIFICATION  : 'pushNotification',
    EAGLE_VIEW         : 'eagleView',
}

let USER_PERMISSIONS = {
    READ              : 'read',
    WRITE             : 'write',
    DENY              : 'deny'
}

let PAYMENT_TYPES = {
    ONLINE:"Online",
    CASH:"Cash",
    RAZORPAY:"Razorpay"
}

let PAYMENT_GETEWAYS = {
    PAYTM:"Paytm",
    PHONE_PAY:"PhonePay",
    GOOGLE_PAY:"GPay"
}

let ORDER_TYPE = {
    PICK_UP_SERVICE:"Pick Up Service",
    DELIVERY_SERVICE:"Delivery Service",
}

let ORDER_STATUS = {
    ACCEPTED:"Accepted",
    CANCELLED_BY_RESTAURANT:"Cancelled by Restaurant",
    CANCELLED_BY_CUSTOMER:"Cancelled by Customer",
    CANCELLED_BY_RIDER:"Cancelled_By_Driver",
    COOKED:"Cooked",
    COMPLETED:"Completed", 
    DELIVERED_BY_RIDER:"Delivered_By_Driver",
    PENDING:"Pending",
    PREPARING:"Preparing",
    PICKED_BY_RIDER:"Picked_By_Driver",
    RIDER_REACHED_LOCATION:"Driver_Reached_Location",
    REJECTED_BY_DRIVER:"Rejected_By_Driver",
    ACCEPTED_BY_DRIVER:"Accepted_By_Driver",
    DRIVER_REQUEST_SEND:"Driver_Request_Send"
}

let APP_CONSTANTS = {
    ADMIN_COMMISSION_TYPES:ADMIN_COMMISSION_TYPES,
    RESTAURANT_FOOD_TYPE:RESTAURANT_FOOD_TYPE,
    DELIVERY_TYPES:DELIVERY_TYPES,
	DEVICE_TYPES: DEVICE_TYPES,
    GENDER_TYPES: GENDER_TYPES,
	SOCIAL_MODE_TYPE : SOCIAL_MODE_TYPE,
	swaggerDefaultResponseMessages:swaggerDefaultResponseMessages,
	STATUS_MSG:STATUS_MSG,
    USER_ROLES             :  USER_ROLES,
    JWT_KEY                :  JWT_KEY,
    
    DOCUMENT_FILE_SIZE:DOCUMENT_FILE_SIZE,
    FCM_KEY:FCM_KEY,
    SMS_KEYS_DETAILS:SMS_KEYS_DETAILS,
    SEND_GRID_DETAILS:SEND_GRID_DETAILS,
    LANGUAGE_SPECIFIC_MESSAGE:LANGUAGE_SPECIFIC_MESSAGE,
    PAYMENT_TYPES:PAYMENT_TYPES,
    ORDER_STATUS:ORDER_STATUS,
    ORDER_TYPE:ORDER_TYPE,
    S3_BUCKET_CREDENTIALS:S3_BUCKET_CREDENTIALS,
    FOLDER_NAME:FOLDER_NAME,
    RAZORPAY_KEYS_DETAILS:RAZORPAY_KEYS_DETAILS,
    RUPAY_TO_PAISE:RUPAY_TO_PAISE,
    TRANSACTION_TYPES:TRANSACTION_TYPES,
    USER_PERMISSIONS_OPTIONS:USER_PERMISSIONS_OPTIONS,
    USER_PERMISSIONS:USER_PERMISSIONS,
    APP_DETAILS:APP_DETAILS,
    EMAIL_TEMPLATES:EMAIL_TEMPLATES,
    DRIVER_BONUS_TYPES:DRIVER_BONUS_TYPES,
    WORKING_DAYS:WORKING_DAYS,
    DEFAULT_RESTAURANT_WORKING_TIME:DEFAULT_RESTAURANT_WORKING_TIME,
    NOTIFICATION_MESSAGE:NOTIFICATION_MESSAGE,
    RAZORPAY_X_KEYS_DETAILS:RAZORPAY_X_KEYS_DETAILS,
    RAZORPAY_X_BASE_URL:RAZORPAY_X_BASE_URL,
    CURRENCY,CURRENCY,
    PAYMENT_MODE,PAYMENT_MODE,
    PAYMENT_GETEWAYS,PAYMENT_GETEWAYS,
    SETTINGS_TYPE:SETTINGS_TYPE,
    MOBILE_SMS:MOBILE_SMS,
    FRONT_END_ROUTES:FRONT_END_ROUTES,
    EVENT_TYPE:EVENT_TYPE,
    USER_AGENT_OPTIONS:USER_AGENT_OPTIONS,
    USER_FAVOURITE_TYPES:USER_FAVOURITE_TYPES,
}


module.exports = APP_CONSTANTS