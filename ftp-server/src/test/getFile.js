var fs = require("fs");
const mongoose = require("mongoose");

async function main() {
  // 4. Connect to MongoDB
  await mongoose.connect("mongodb://localhost:27017/chain-storage-tcp-server");

  const fileSchema = new mongoose.Schema({
    userPublicKey: { type: String, required: true },
    fileName: { type: String, required: true },
    encoding: { type: String, required: true },
    fileDecode: { type: String, required: true },
  });

  const File = mongoose.model("File", fileSchema);
  const files = await File.findOne({
    fileName: "0xQrpay (1).pdf",
  });
  
  console.log(files.fileDecode);

  var bytes = files.fileDecode.split("%");

  var b = new Buffer.alloc(bytes.length);
  var c = "";
  for (var i = 0; i < bytes.length; i++) {
    b[i] = bytes[i];
    c = c + " " + bytes[i];
  }

  fs.writeFile(
    "0xQrpay (1).pdf",
    c,
    {
      encoding: "utf-8",
      flag: "w",
    },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("The file was saved!");
      }
    }
  );
}

main();
