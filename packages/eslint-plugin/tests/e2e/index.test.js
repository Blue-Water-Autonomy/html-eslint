const path = require(`path`);
const eslint = require(`eslint`);
const fs = require(`fs`);

const plugin = require(`@html-eslint/eslint-plugin`);
const parser = require(`@html-eslint/parser`);

const testDirs = fs
  .readdirSync(__dirname, { withFileTypes: true })
  .filter((entry) => entry.isDirectory());

for (const testDir of testDirs) {
  const testName = testDir.name;
  const testPath = path.join(__dirname, testName);
  const testConfigPath = path.join(testPath, `test-config.js`);
  const testConfig = require(testConfigPath);

  const {
    sourceFileName,
    fixedFileName,
    expectNoMessages = true,
    expectOutputToMatchSource = true,
    languageOptions,
    configOverrides,
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
        "@html-eslint": plugin,
      },
      languageOptions: Object.assign(
        {
          parser,
        },
        languageOptions || {}
      ),
      ...(  processor ? { processor: processor } : {} ),
      rules,
    };
    if (configOverrides) {
      Object.assign(config, configOverrides);
    }

    const linter = new eslint.Linter();
    const sourcePath = path.join(testPath, sourceFileName);
    const source = fs.readFileSync(sourcePath, { encoding: `utf8` });

    const fixedPath =
      fixedFileName !== undefined ? path.join(testPath, fixedFileName) : null;
    const hasFixedFile = fixedPath ? fs.existsSync(fixedPath) : false;

    if (hasFixedFile) {
      if (!fixedPath) {
        throw new Error(`Expected fixed file path for ${testName}`);
      }
      const expected = fs.readFileSync(fixedPath, { encoding: `utf8` });
      const result = linter.verifyAndFix(source, config);
      if (expectNoMessages) {
        expect(JSON.stringify(result.messages, null, `\t`)).toEqual(`[]`);
      }
      expect(result.output).toEqual(expected);
      return;
    }

    const messages = linter.verify(source, config);
    if (expectNoMessages) {
      expect(JSON.stringify(messages, null, `\t`)).toEqual(`[]`);
    }

    if (expectOutputToMatchSource) {
      const fixResult = linter.verifyAndFix(source, config);
      expect(fixResult.output).toEqual(source);
    }
  });
}
