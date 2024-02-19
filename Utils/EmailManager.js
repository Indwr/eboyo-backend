"use strict";
/**
 * Created by Indersein on 03/08/2021.
 */

const Path = require("path");
const sendgridMail = require("@sendgrid/mail");
const readFilePromise = require("fs-readfile-promise");

const CONFIG = require("../Config");
const Service = require("../Services");
const APP_CONSTANTS = CONFIG.APP_CONSTANTS;
const SEND_GRID_DETAILS = APP_CONSTANTS.SEND_GRID_DETAILS;

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
  sendMail: sendMail,
  generateOrderHtmlAndSendEmail: generateOrderHtmlAndSendEmail,
};
