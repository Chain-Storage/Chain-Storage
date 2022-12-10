"use strict";

const FtpSrv = require("ftp-srv");
const { networkInterfaces } = require("os");
const os = require("os");

const nets = networkInterfaces();
const results = Object.create(null);

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
    const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
    if (net.family === familyV4Value && !net.internal) {
      if (!results[name]) {
        results[name] = [];
      }
      results[name].push(net.address);
    }
  }
}

console.log(os.type());
let hostUrl = "";
const port = 9001;

if (os.type() === "Windows_NT") {
  hostUrl = `ftp://${results["VirtualBox Host-Only Network"][0]}:` + port;
} else if (os.type() === "Linux") {
  hostUrl = `ftp://${results.wlp8s0[0]}:` + port;
} else {
  console.error("This ftp server only support Windows");
}

const ftpServer = new FtpSrv({
  url: hostUrl,
  anonymous: true,
});

ftpServer.on("login", ({ connection, username, password }, resolve, reject) => {
  if (username === "yurikaza" && password === "anonymous") {
    return resolve({
      root: `${__dirname}/files`,
    });
  }
  return reject(new errors.GeneralError("Invalid username or password", 401));
});

ftpServer.listen().then(() => {
  console.log("Ftp server is starting...");
});
