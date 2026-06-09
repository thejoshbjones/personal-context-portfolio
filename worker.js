export default {
  async fetch(request, env) {
    const authHeader = request.headers.get("Authorization");
    const expectedAuth = `Bearer ${env.API_TOKEN}`;

    if (!env.API_TOKEN) {
      return Response.json(
        {
          ok: false,
          error: "Server is missing API_TOKEN secret"
        },
        { status: 500 }
      );
    }

    if (authHeader !== expectedAuth) {
      return Response.json(
        {
          ok: false,
          error: "Unauthorized"
        },
        {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Bearer realm="personalcontextportfolio"'
          }
        }
      );
    }

    return Response.json(
      {
        ok: true,
        message: "Authorized",
        worker: "personalcontextportfolio",
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  }
};
