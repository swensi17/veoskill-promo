"""tools/i18n/uz.tsv (Uzbek in the classic Latin alphabet) -> src/i18n/uz.json in the new 2026 alphabet (Ö Ğ Ş Ç)."""
import json, re, pathlib
def nu(s):
    s = re.sub(r"([OoGg])[ʻ‘'’`]", lambda m: {"O": "Ö", "o": "ö", "G": "Ğ", "g": "ğ"}[m.group(1)], s)
    s = re.sub(r"S[Hh]", "Ş", s).replace("sh", "ş")
    s = re.sub(r"C[Hh]", "Ç", s).replace("ch", "ç")
    return re.sub(r"(?<=[^\W\d_])['’‘ʻ](?=[^\W\d_])", "ʼ", s)
d = {}
for ln in pathlib.Path("tools/i18n/uz.tsv").read_text().split("\n"):
    if not ln: continue
    ru, uz = ln.split("\t")
    d[ru] = nu(uz)
out = pathlib.Path("src/i18n/uz.json"); out.parent.mkdir(exist_ok=True)
out.write_text(json.dumps(d, ensure_ascii=False, indent=0))
print(len(d), "strings")
