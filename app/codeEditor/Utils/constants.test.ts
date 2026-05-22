import {
  FILE_EXTENSIONS,
  LANGUAGE_COLORS,
  LANGUAGE_VERSIONS,
  PISTON_LANGUAGE_MAP,
} from "./constants";

const LANGS = ["typescript", "python", "java"] as const;

describe("Language constants", () => {
  it("expose the supported languages", () => {
    LANGS.forEach((l) => {
      expect(LANGUAGE_VERSIONS).toHaveProperty(l);
      expect(PISTON_LANGUAGE_MAP).toHaveProperty(l);
      expect(FILE_EXTENSIONS).toHaveProperty(l);
      expect(LANGUAGE_COLORS).toHaveProperty(l);
    });
  });

  it("versions look like semver", () => {
    LANGS.forEach((l) =>
      expect(LANGUAGE_VERSIONS[l]).toMatch(/^\d+\.\d+\.\d+$/),
    );
  });

  it("file extensions start with a dot", () => {
    LANGS.forEach((l) => expect(FILE_EXTENSIONS[l].startsWith(".")).toBe(true));
  });

  it("piston map keys equal piston values for known languages", () => {
    LANGS.forEach((l) => expect(PISTON_LANGUAGE_MAP[l]).toBe(l));
  });

  it("language colors are hex strings", () => {
    LANGS.forEach((l) => expect(LANGUAGE_COLORS[l]).toMatch(/^#[0-9A-F]{6}$/i));
  });
});
