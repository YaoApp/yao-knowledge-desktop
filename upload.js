const fs = require("fs");
const url = require("url");
const crypto = require("crypto");
const md4 = crypto.createHash("md4");

const Upload = (file, urlstr, cb) => {
  fs.readFile(file, (err, data) => {
    if (err) {
      console.error(err);
      cb("error", err.message);
      return;
    }

    const md4 = crypto.createHash("md4");
    md4.update(data.toString());
    const hash = md4.digest("hex");

    var body = Buffer.from(
      JSON.stringify({
        file: file,
        content: data.toString("base64"),
        fingerprint: hash,
      }),
      "utf8"
    );

    const uri = url.parse(urlstr);

    const options = {
      hostname: uri.hostname,
      port: uri.port,
      path: uri.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "Content-Length": body.length,
      },
    };

    console.log(options);
    const http = uri.protocol === "http:" ? require("http") : require("https");
    const req = http.request(options, (res) => {
      console.log(`状态码：${res.statusCode}`);
      console.log(`响应头：${JSON.stringify(res.headers)}`);
      if (res.statusCode != 200) {
        cb("error", res.statusCode);
        return;
      }

      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        console.log(`响应主体：${chunk}`);
        cb("chunk", chunk);
      });

      res.on("end", () => {
        cb("success", res.statusCode);
        console.log("响应中已无数据。", res.statusCode);
      });
    });

    req.on("error", (e) => {
      console.error(`请求遇到问题：${e.message}`);
      cb("error", e.message);
    });

    // 将数据写入请求主体。
    req.write(body);
    req.end();
  });
};

module.exports = Upload;
