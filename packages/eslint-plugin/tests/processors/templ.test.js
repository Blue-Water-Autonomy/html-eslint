const plugin = require("../../lib");

describe("templ processor", () => {
  const processor = plugin.processors.templ;

  it("extracts templ bodies as separate blocks", () => {
    const source = `
package demo

templ hello(message string) {
  <div>{ message }</div>
}
`;

    const blocks = processor.preprocess(source, "hello.templ");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].trim()).toBe("<div>{ message }</div>");

    // Clean up metadata cache
    processor.postprocess([[]], "hello.templ");
  });

  it("maps messages back to original location", () => {
    const source = `
package demo

templ hello(message string) {
  <div>
    { message }
  </div>
}
`;

    processor.preprocess(source, "hello.templ");
    const messages = processor.postprocess(
      [
        [
          {
            ruleId: "demo",
            message: "test",
            line: 3,
            column: 5,
          },
        ],
      ],
      "hello.templ"
    );
    expect(messages).toHaveLength(1);
    expect(messages[0].line).toBe(6);
  });
});
