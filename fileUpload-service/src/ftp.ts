import * as ftp from "basic-ftp";
import fs from "fs";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import fileUpload, { UploadedFile } from "express-fileupload";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import compression from "compression";
import morgan from "morgan";
import crypto, { createHmac } from "node:crypto";
import { Contract, providers } from "ethers";
import * as SendFile from "./artifacts/contracts/SendFile.sol/SendFile.json";

const app = express();
const port = 4000;

dotenv.config();

app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());
app.use(hpp());
app.use(morgan("dev"));
app.use(cors());

app.post("/sendMultipleFile/", async (req: Request, res: Response) => {
  const fileData = req?.files?.myFile as any | UploadedFile[];
  console.log("filedata line 27 " + fileData);

  let myArray: any[] = [];

  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: `${process.env.HOST}`,
      port: Number(process.env.PORT),
      user: "yurikaza",
      password: `${process.env.PASSWORD}`,
      secure: false,
    });
    //await client.ensureDir(fileData.path);

    for (let index = 0; index < fileData.length; index++) {
      const element = fileData[index];
      console.log(element);

      fs.writeFileSync(element.name, element.data);
      await client.uploadFrom(element.name, element.name);
      fs.unlinkSync(element.name);

      let myObj: any = {
        link: "none",
        name: element.name,
        size: element.size,
      };

      myArray.push(myObj);
    }

    //await client.downloadTo("getFile.js", "getFile.js");
  } catch (err) {
    console.log(err);
  }
  client.close();

  res.status(201).json({
    status: "success",
    data: myArray,
  });
});

app.post("/sendSingleFile", async (req: Request, res: Response) => {
  const fileData = req?.files?.myFile as any | UploadedFile[];
  let myArray: any[] = [];

  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: `${process.env.HOST}`,
      port: Number(process.env.PORT),
      user: "yurikaza",
      password: `${process.env.PASSWORD}`,
      secure: false,
    });
    //await client.ensureDir(fileData.path);
    fs.writeFileSync(fileData.name, fileData.data);
    await client.uploadFrom(fileData.name, fileData.name);
    fs.unlinkSync(fileData.name);

    //await client.downloadTo("getFile.js", "getFile.js");
  } catch (err) {
    console.log(err);
  }
  client.close();

  let myObj: any = {
    link: "none",
    name: fileData.name,
    size: fileData.size,
  };

  myArray.push(myObj);

  res.status(201).json({
    status: "success",
    message: "File Uploaded Succesfuly",
    data: myArray,
  });
});

app.post("/getFiles/", async (req: Request, res: Response) => {
  let myArray: any[] = [];
  console.log(process.env.PROVIDER);

  const provider = new providers.JsonRpcProvider(`${process.env.PROVIDER}`);

  const contract = new Contract(
    `${process.env.CREATE_FILE_KEY}`,
    SendFile.abi,
    provider
  );

  const data = await contract.getFiles();

  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    const publicKey = req.body.publicKey;

    if (element[0].toLowerCase() === publicKey) {
      const newArray: any[] = [
        element[0],
        element[1],
        element[2],
        element[3],
        "https://ipfs.io/",
      ];

      myArray.push(newArray);
    }
  }

  console.log(myArray);

  res.status(201).json({
    status: "success",
    data: myArray,
  });
});

app.get("/downloadFile/", async (req: Request, res: Response) => {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: `${process.env.HOST}`,
      port: Number(process.env.PORT),
      user: "yurikaza",
      password: `${process.env.PASSWORD}`,
      secure: false,
    });
    //await client.ensureDir(fileData.path);
    await client.downloadTo(req.body.fileName, req.body.fileName);
  } catch (err) {
    console.log(err);
  }
  client.close();

  res.status(201).json({
    status: "success",
    data: "File Downloaded",
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
