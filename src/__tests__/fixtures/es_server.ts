/**
 * basic bun server to return en.json
 */
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

let server: ReturnType<typeof Bun.serve> | null = null;

const listen = () => {
  if (server) {
    return Promise.resolve();
  }

  server = Bun.serve({
    port: 3710,
    fetch(request) {
      const { pathname } = new URL(request.url);

      if (pathname === "/es.json") {
        return new Response(JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        });
      }

      return new Response("not found", { status: 404 });
    },
  });

  return Promise.resolve();
};

const close = () => {
  if (!server) {
    return Promise.resolve();
  }

  server.stop(true);
  server = null;

  return Promise.resolve();
};

export const startServer = listen;
export const stopServer = close;
export { server };
