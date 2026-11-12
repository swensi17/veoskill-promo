// Lists every Cyrillic string literal / JSX text / template in the given files.
const ts = require("typescript"), fs = require("fs");
const CY = /[А-Яа-яЁё]/;
const out = [];
for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (n) => {
    let text = null, kind = null;
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) { text = n.text; kind = "s"; }
    else if (ts.isJsxText(n)) { text = n.text.replace(/\s+/g, " ").trim(); kind = "j"; }
    else if (ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) { text = n.text; kind = "t"; }
    if (text && CY.test(text)) {
      if (ts.isStringLiteral(n) && n.parent && ts.isImportDeclaration(n.parent)) {} else
      out.push({ file, line: sf.getLineAndCharacterOfPosition(n.getStart()).line + 1, kind, text });
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}
fs.writeFileSync(process.env.OUT || "/dev/stdout", JSON.stringify(out, null, 1));
