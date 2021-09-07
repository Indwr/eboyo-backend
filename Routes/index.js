/**
 * Created by Anurag on 20/03/19.
 */
'use strict';
let AdminUserRoute           =   require('./admin/AdminUserRoute');
let AdminRestaurantRoute     =   require('./admin/AdminRestaurantRoute');
let AdminBannerRoute         =   require('./admin/AdminBannerRoute');
let AdminDriverRoute         =   require('./admin/AdminDriverRoute');
let AdminFaqRoute            =   require('./admin/AdminFaqRoute');
let AdminSubRoute            =   require('./admin/AdminSubRoute');
let AdminMenuRoute           =   require('./admin/AdminMenuRoute');
let AdminPolygonRoute        =   require('./admin/AdminPolygonRoute');
let AdminOrderRoute          =   require('./admin/AdminOrderRoute');
let AdminCuisineRoute        =   require('./admin/AdminCuisineRoute');
let AdminPromoCodeRoute      =   require('./admin/AdminPromoCodeRoute');
let AdminCustomerRoute       =   require('./admin/AdminCustomerRoute');
let AdminBankDetailRoute     =   require('./admin/AdminBankDetailRoute');
let AdminNotificationRoute   =   require('./admin/AdminNotificationRoute');
let AdminPaymentGetewayRoute        =   require('./admin/AdminPaymentGetewayRoute');
let AdminSettingsRoute       =   require('./admin/AdminSettingsRoute');
let AdminFrontEndSettingsRoute       =   require('./admin/AdminFrontEndSettingsRoute');
let AdminWalletRoute       =   require('./admin/AdminWalletRoute');
//let AdminRoute           =   require('./AdminRoute');



let CommonRoute          =   require('./CommonRoute');
let CronRoute            =   require('./CronRoute');
let CustomerRoute        =   require('./CustomerRoute');

let RestaurantRoute  =  require('./RestaurantRoute');
let RestaurantMenuRoute  =  require('./RestaurantMenuRoute');
let DriverRoute      =  require('./DriverRoute');
let RazorpayRoute  =  require('./RazorpayRoute');
let RazorpayXRoute  = require('./RazorpayXRoute');
let all = [].concat(AdminUserRoute, AdminRestaurantRoute,AdminBannerRoute,AdminDriverRoute,AdminFaqRoute,AdminMenuRoute,AdminBankDetailRoute,AdminOrderRoute,AdminSubRoute,AdminPolygonRoute,AdminCuisineRoute,AdminPromoCodeRoute,AdminCustomerRoute,AdminNotificationRoute,AdminPaymentGetewayRoute,AdminSettingsRoute,AdminFrontEndSettingsRoute,AdminWalletRoute,CronRoute,CommonRoute,CustomerRoute,DriverRoute,RestaurantRoute,RestaurantMenuRoute,RazorpayRoute,RazorpayXRoute);

module.exports = all;