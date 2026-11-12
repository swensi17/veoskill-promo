// Wraps every Russian string literal / JSX text in tr(...) so the Uzbek cut can swap it (src/i18n.ts).
// Skips imports, type literals, template strings with ${} and the multi-language data tables.
const ts = require("typescript"), fs = require("fs");
const CY = /[А-Яа-яЁё]/;
const SKIP_DECL = new Set(["ART", "LD", "MORE_L", "LANGS", "CRUMB", "META"]);
for (const file of process.argv.slice(2)) {
  let src = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const inSkip = (n) => { for (let p = n.parent; p; p = p.parent) { if (ts.isVariableDeclaration(p) && SKIP_DECL.has(p.name.getText())) return true; if (ts.isImportDeclaration(p) || ts.isLiteralTypeNode(p) || ts.isTypeNode(p)) return true; if (ts.isCallExpression(p) && p.expression.getText() === "tr") return true; } return false; };
  const visit = (n) => {
    if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && CY.test(n.text) && !inSkip(n)) {
      const t = n.getText(), p = n.parent;
      if (ts.isPropertyAssignment(p) && p.name === n) edits.push([n.getStart(), n.getEnd(), `[tr(${t})]`]);
      else if (ts.isJsxAttribute(p)) edits.push([n.getStart(), n.getEnd(), `{tr(${t})}`]);
      else edits.push([n.getStart(), n.getEnd(), `tr(${t})`]);
    } else if (ts.isJsxText(n) && CY.test(n.text) && !inSkip(n)) {
      const raw = n.text, a = raw.search(/\S/), b = raw.length - raw.split("").reverse().join("").search(/\S/);
      const core = raw.slice(a, b).replace(/\s+/g, " ");
      const start = n.pos + a, end = n.pos + b;
      edits.push([start, end, `{tr(${JSON.stringify(core)})}`]);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  edits.sort((x, y) => y[0] - x[0]);
  for (const [s, e, r] of edits) src = src.slice(0, s) + r + src.slice(e);
  if (edits.length && !/from "\.\/i18n"/.test(src)) src = src.replace(/^(import React[^\n]*\n)/, `$1import { tr } from "./i18n";\n`);
  fs.writeFileSync(file, src);
  console.log(file, edits.length);
}
