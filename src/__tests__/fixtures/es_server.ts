/**
 * basic node server to return en.json
 */
import { createServer, IncomingMessage, ServerResponse } from "http";
import { createReadStream } from "fs";
var server = createServer(function (req: IncomingMessage, res: ServerResponse) {
  if (req.url === "/es.json") {
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
    });
    const data = {
      home: {
        greetings: "Hola [name]",
        title: "Bienvenido a mi sitio web",
      },
      profile: {
        greetings: {
          default: "Hola [name]",
          gender: {
            male: {
              "[age] >= 18": "Hola Sr [name]",
            },
            female: {
              "[age] >= 18": "Hola Sra [name]",
              "[age] < 18": "Hola Srta [name]",
            },
            noBinary: {
              "[age] >= 18": "Hola Sre [name]",
            },
          },
        },
        vote: {
          "[age] >= 18": "Eres lo suficientemente viejo para votar",
        },
      },
    };
    res.end(JSON.stringify(data));
  } else {
    res.writeHead(404);
    res.end("not found");
  }
});

server.listen(3710);

module.exports = server;
