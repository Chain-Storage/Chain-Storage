import Client from "ftp";

const c = new Client();
c.on("ready", function () {
  c.put(
    "Yusuf Mirza Pıçakcı Özgeçmiş (CV).pdf",
    "Yusuf-Mirza-Pıçakcı-Özgeçmiş-copy(CV).pdf",
    function (err: Error) {
      if (err) throw err;
      c.end();
    }
  );
});

// connect to localhost:21 as anonymous
c.connect({
  host: "192.168.56.1",
  port: 9001,
  user: "yurikaza",
  password: "anonymous",
});
