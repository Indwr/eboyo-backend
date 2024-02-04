const BaseJoi = require("joi");
const Joi = BaseJoi;
const UniversalFunctions = require("../../Utils/UniversalFunctions");
const TokenManagerAdmin = require("../../Utils/TokenManagerAdmin");
const Controller = require("../../Controllers");
const CONFIG = require("../../Config");
const APP_CONSTANTS = CONFIG.APP_CONSTANTS;

const checkAccessToken = TokenManagerAdmin.getTokenFromDBForAdmin;

let basePath="/api/v1/admin/wallet";

let create = {
  method: "POST",
  path: basePath+"/create",
  handler: function (request, reply) {
    let UserData = request.pre.verify || {};
    return Controller.AdminWalletController.create(request.payload,UserData).then((response) => {
      return UniversalFunctions.successResponse(null, response);
    }).catch((error) => {
      return UniversalFunctions.sendError(error);
    });
  },
  config: {
    description:"Choose user types to send wallet",
    tags: ["api", "Admin Wallet"],
    pre: [{ method: checkAccessToken, assign: "verify" }],
    validate: {
      payload: Joi.object({
        _id: Joi.string().required(),
        userType:Joi.string().valid(APP_CONSTANTS.USER_ROLES.CUSTOMER,
          APP_CONSTANTS.USER_ROLES.DRIVER,APP_CONSTANTS.USER_ROLES.RESTAURANT
        ),
        amount: Joi.number().required(),
        description: Joi.string().trim(),
      }),
      headers: Joi.object({
        authorization: Joi.string().trim().required(),
      }).options({ allowUnknown: true }),
      failAction: UniversalFunctions.failActionFunction,
    },
    plugins: {
      "hapi-swagger": {
        payloadType: "form",
        responseMessages: APP_CONSTANTS.swaggerDefaultResponseMessages,
      },
    },
  },
};


module.exports = [
  create,
];
