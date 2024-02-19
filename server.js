"use strict";

const Hapi = require("@hapi/hapi");
const HapiSwagger = require("hapi-swagger");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const Pack = require("./package");

//const io = require("socket.io")(3004);
//const SocketManager = require('./Utils/SocketManager');

const Routes = require("./Routes");
//const RedisHelper = require('./Utils/RedisHelper.js');

const init = async () => {
  try {
    const server = Hapi.server({
      port: 3002,
      //host: '127.0.0.1',
      routes: {
        cors: {
          origin: ["*"],
          //additionalHeaders: ['x-logintoken'],
          //additionalExposedHeaders: ['x-logintoken']
        },
      },
    });
    //SocketManager.connectSocket(server);
    const swaggerOptions = {
      info: {
        title: "Bytebots Food API Documentation",
        version: Pack.version,
      },
      grouping: "tags",
    };
    // await server.register(Inert);
    // await server.register(Vision);

    // await server.register({
    //     plugin: HapiSwagger,
    //     options: swaggerOptions
    // });
    await server.register([
      Inert,
      Vision,
      {
        plugin: HapiSwagger,
        options: swaggerOptions,
      },
    ]);
    server.route({
      path: "/uploads/{path*}",
      method: "GET",
      handler: {
        directory: {
          path: "./uploads",
          listing: false,
          index: false,
        },
      },
    });

    server.route({
      path: "/pdfFile/{path*}",
      method: "GET",
      handler: {
        directory: {
          path: "./pdfFile",
          listing: false,
          index: false,
        },
      },
    });

    server.route({
      method: "GET",
      path: "/",
      handler: (request, h) => {
        return "Hello World!";
      },
    });
    server.route(Routes);
    await server.start();
    console.log("Server running on %s", server.info.uri);
    return server;
  } catch (e) {
    throw e;
  }
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
