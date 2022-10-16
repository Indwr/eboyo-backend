"use strict";
/**
 * Created by Indersein on 18/06/2021.
 */
const redis = require("redis");
const client = redis.createClient();
client.on("connect", () => {
  console.log("\n\n***********Redis Connected***********\n\n");
});

const setString = (keyName, saveData, expires = 0, database = "") => {
  try {
    client.set(keyName, saveData);
    if (expires !== 0) {
      client.expire(keyName, expires * 60);
    }
    return true;
  } catch (error) {
    throw error;
  }
};

// Get String value for given key
const getString = (keyName, database = "") => {
  try {
    let result = client.get(keyName);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getString: getString,
  setString: setString,
};
