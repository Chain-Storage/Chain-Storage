import bodyParser from "body-parser";
import compression from "compression";
import express, { Express, Request, Response } from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import cors from "cors";

import tcpRouter from "./router/tcp.router";

// Craete port an express server
const port: number = 4000;
const app: Express = express();

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

console.log("Connecting Server...");

app.use("/", tcpRouter);

app.listen(port, () => {
  console.log(`Server Listen on: http://localhost:${port}`);
});
