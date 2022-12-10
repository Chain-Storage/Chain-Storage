import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import JsonSocket from "json-socket";
import net from "net";

export async function connectTcp(req: Request, res: Response) {
  const fileData = req?.files?.myFile as any | UploadedFile[];

  if (typeof fileData === "undefined") {
    res.status(404).json({
      status: "success",
      data: {
        data: `Pleas provide a file`,
      },
    });
  }

  const port = 9001;
  const host = "192.168.56.1";

  let clientAddress: string[] = [];
  console.log(fileData);

  var socket = new JsonSocket(new net.Socket()); //Decorate a standard net.Socket with JsonSocket
  socket.connect(port, host);
  socket.on("connect", function () {
    console.log("Connected");

    //Don't send until we're connected
    socket.sendMessage(
      {
        fileName: fileData.name.toString(),
        fileDecode: fileData.data.toString(),
        encoding: fileData.encoding.toString(),
      },
      (data) => {
        console.log(data);
      }
    );

    socket.on("message", function (message) {
      console.log("The result is: " + message.result);
    });
  });

  socket.on("data", function (data: string) {
    console.log("Server Says : " + data);
  });

  socket.on("close", function () {
    console.log("Connection closed");
  });

  res.status(200).json({
    status: "success",
    data: {
      data: `Hello From Client: ${fileData}`,
      clientId: clientAddress,
    },
  });

  //const myFile = req?.files?.myFile as any | UploadedFile[];
}
