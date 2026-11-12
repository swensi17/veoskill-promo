// Marks which top-level declarations are reachable from the V11 composition.
const ts = require("typescript"), fs = require("fs");
const files = process.argv.slice(2);
const decls = {}; // key file:name -> {file,name,start,end,refs:Set}
const byName = Object.create(null);
for (const file of files) {
  const sf = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const st of sf.statements) {
    let names = [];
    if (ts.isVariableStatement(st)) names = st.declarationList.declarations.map((d) => d.name.getText());
    else if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st) || ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st)) && st.name) names = [st.name.text];
    else continue;
    const refs = new Set();
    const v = (n) => { if (ts.isIdentifier(n)) refs.add(n.text); ts.forEachChild(n, v); };
    v(st);
    for (const name of names) {
      const k = file + ":" + name;
      decls[k] = { file, name, start: sf.getLineAndCharacterOfPosition(st.getStart()).line + 1, end: sf.getLineAndCharacterOfPosition(st.getEnd()).line + 1, refs };
      (byName[name] ||= []).push(k);
    }
  }
}
const seen = new Set(), q = ["src/V11.tsx:V11"];
while (q.length) { const k = q.pop(); if (seen.has(k)) continue; seen.add(k); for (const r of decls[k].refs) for (const k2 of byName[r] || []) if (!seen.has(k2)) q.push(k2); }
const live = Object.values(decls).filter((d) => seen.has(d.file + ":" + d.name)).map((d) => [d.file, d.start, d.end, d.name]);
fs.writeFileSync(process.env.OUT, JSON.stringify(live));
console.log(live.length, "of", Object.keys(decls).length);
