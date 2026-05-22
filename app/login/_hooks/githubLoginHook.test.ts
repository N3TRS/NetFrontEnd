import { githubLoginHook } from "./githubLoginHook";

describe("githubLoginHook", () => {
  const realLocation = window.location;
  beforeAll(() => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });
  });
  afterAll(() => {
    Object.defineProperty(window, "location", { writable: true, value: realLocation });
  });

  it("redirects to /auth/github on gateway base", () => {
    const { handleGithubLogin } = githubLoginHook();
    handleGithubLogin();
    expect(window.location.href).toMatch(/\/auth\/github$/);
  });
});
