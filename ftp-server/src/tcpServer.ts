import net from "net";
import { Schema, model, connect } from "mongoose";
import JsonSocket from "json-socket";

// 1. Create an interface representing a document in MongoDB.
interface IFile {
  fileDecode: string;
  fileName: string;
  encoding: string;
  userPublicKey: string;
}

// 2. Create a Schema corresponding to the document interface.
const fileSchema = new Schema<IFile>({
  userPublicKey: { type: String, required: true },
  fileName: { type: String, required: true },
  encoding: { type: String, required: true },
  fileDecode: { type: String, required: true },
});

const port = 9001;
const host = "192.168.56.1";

const server = net.createServer();

server.listen(port, host, () => {
  console.log("TCP Server is running on port " + port + ".");
});

let sockets: any[] = [];

server.on("connection", function (sock: any) {
  sockets.push(sock);
  sock = new JsonSocket(sock); //Now we've decorated the net.Socket to be a JsonSocket

  // 3. Create a Model.
  const File = model<IFile>("File", fileSchema);

  sock.on("message", function (message: any) {
    console.log(
      `Json tcp server data: ${message.fileName} and ${message.fileDecode}`
    );

    async function runDatabase() {
      // 4. Connect to MongoDB
      await connect("mongodb://localhost:27017/chain-storage-tcp-server");

      const file = new File({
        userPublicKey: "0X45345fsd3r2",
        fileName: message.fileName,
        encoding: message.encoding,
        fileDecode: message.fileDecode,
      });
      await file.save();
    }

    runDatabase().catch((err: Error) => console.log(err));
  });

  // Add a 'close' event handler to this instance of socket
  sock.on("close", function (data: any) {
    let index = sockets.findIndex(function (o) {
      return (
        o.remoteAddress === sock.remoteAddress &&
        o.remotePort === sock.remotePort
      );
    });
    if (index !== -1) sockets.splice(index, 1);
    console.log("CLOSED: " + sock.remoteAddress + " " + sock.remotePort);
  });
});
