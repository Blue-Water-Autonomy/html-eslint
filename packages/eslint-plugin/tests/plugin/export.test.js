const plugin = require("../../lib");
describe("@blue-water-autonomy/html-eslint-plugin", () => {
  it("should have meta", () => {
    expect(plugin.meta.name).toBe("@blue-water-autonomy/html-eslint-plugin");
    expect(typeof plugin.meta.version).toBe("string");
  });
});
