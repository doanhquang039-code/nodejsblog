const assert = require("node:assert/strict");

process.env.SKIP_DB_CONNECT = "true";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const { server } = require("../app");

async function main() {
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.service, "my-blog-node");

    console.log("Smoke test passed: GET /health");

    const renderRoutes = [
      "/notifications",
      "/themes",
      "/messaging",
      "/achievements",
      "/media-gallery",
      "/search-advanced",
      "/drafts",
      "/settings",
      "/modern-blog",
      "/engagement-dashboard",
      "/bookmarks",
    ];

    for (const route of renderRoutes) {
      const page = await fetch(`${baseUrl}${route}`);
      assert.equal(page.status, 200, `${route} should render`);
    }

    console.log(`Smoke test passed: rendered ${renderRoutes.length} public UI routes`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
