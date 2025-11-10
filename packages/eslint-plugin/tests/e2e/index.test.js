const eslint = require(`eslint`);
const fs = require(`fs`);
const path = require(`path`);

const plugin = require(`@html-eslint/eslint-plugin`);

const testDirs = fs
  .readdirSync(__dirname, { withFileTypes: true })
  .filter((entry) => entry.isDirectory());

for (const testDir of testDirs) {
  // Skip Templ test for now
  if (testDir.name.includes("templ")) {
    continue;
  }
  const testName = testDir.name;
  const testPath = path.join(__dirname, testName);
  const testConfigPath = path.join(testPath, `test-config.js`);
  const testConfig = require(testConfigPath);

  const {
    fixedFileName,
    sourceFileName,
    languageOptions,
    processor = undefined,
    rules,
  } = testConfig;

  if (!sourceFileName) {
    throw new Error(
      `Missing required "sourceFileName" in ${path.relative(process.cwd(), testConfigPath)}`
    );
  }

  test(`e2e/${testName}`, () => {
    const config = {
      plugins: {
        html: plugin,
      },
      language: "html/html",
      languageOptions: languageOptions || {},
      ...(processor ? { processor: processor } : {}),
      rules,
    };

    const linter = new eslint.Linter();
    const sourcePath = path.join(testPath, sourceFileName);
    const source = fs.readFileSync(sourcePath, { encoding: `utf8` });
    const fixedPath = path.join(testPath, fixedFileName);
    const expected = fs.readFileSync(fixedPath, { encoding: `utf8` });

    const result = linter.verifyAndFix(source, config);
    expect(JSON.stringify(result.messages, null, `\t`)).toEqual(`[]`);
    expect(result.output).toEqual(expected);
    return;
  });
}
