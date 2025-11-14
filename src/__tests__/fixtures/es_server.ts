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
  notificationsCount: {
    "0": "No tienes notificaciones",
    "1": "Tienes una notificación",
    "[notificationsCount] >= 2 && [notificationsCount] <= 10":
      "Tienes [notificationsCount] notificaciones",
    "[notificationsCount] > 10": "Tienes muchas notificaciones",
  },
  status: {
    active: "Tu cuenta está activa",
    inactive: "Tu cuenta está inactiva",
    pending: "Tu cuenta está pendiente de aprobación",
  },
  premium: {
    true: "Tienes acceso premium",
    false: "Actualiza a premium",
  },
  pagination: {
    rowsPerPage: "Filas por página",
    selected: {
      "0": "Ninguna fila seleccionada",
      "1": "1 fila seleccionada de [total]",
      "[selected] === [total]": "Todas las [total] filas seleccionadas",
      "[selected] > 1 && [selected] < [total]":
        "[selected] de [total] filas seleccionadas",
    },
    page: "Página",
    of: "de",
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

  // The 'true' flag forces the server to close all connections immediately.
  server.stop(true);
  server = null;

  return Promise.resolve();
};

export const startServer = listen;
export const stopServer = close;
export { server };
