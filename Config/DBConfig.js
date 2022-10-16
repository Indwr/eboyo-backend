"use strict";
const MongoClient = require("mongoose");
let DB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

// let DB_USERNAME="namishAdmin";
// let DB_PASSWORD="SscdUv74WwmHY46b";
// let DB_HOST="127.0.0.1";
// let DB_PORT=27017;
// let DB_NAME = "eboyoFoodApp";
// const databaseUrl =`mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

//app.eboyo.co.in/
// let DB_USERNAME="inderEboyo";
// let DB_PASSWORD="HVdzm87qQnxkrNcG";
// let DB_HOST="127.0.0.1";
// let DB_PORT=27017;
// let DB_NAME = "eboyoFoodApp";
// const databaseUrl =`mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// 3.137.115.62
let DB_USERNAME = "";
let DB_PASSWORD = "";
let DB_HOST = "127.0.0.1" || "localhost";
let DB_PORT = 27017;
let DB_NAME = "deondeApp";
const databaseUrl = "mongodb://" + DB_HOST + "/" + DB_NAME;

let mongodb = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const client = await MongoClient.connect(databaseUrl, DB_OPTIONS);
      console.log("***********mongodb db connected sucessfully***********");
      return resolve(client);
    } catch (error) {
      console.log(error, "***********db connection Error***********");
      return reject(error);
    }
  });
};
//MongoClient.set('debug', false);
mongodb();
