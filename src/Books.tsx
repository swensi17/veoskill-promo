import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { NAVY, BLUE, UI, HEAD, OUTE, IOE, lin, press, useSp, useFrame, Cap, Pointer, TopLine } from "./Scenes9";

// The book library (veoskill.uz/hub/materials): shelf page, open a book, the two-page reader,
// select a fragment -> colour + share link, page turn, reader settings (theme, mode, size), and the phone reader.
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SERIF = "'Times New Roman', Georgia, serif";
const ORANGE = "#c8711f";
const T = { OPEN: 196, PROD: 206, CART: 268, RDB: 318, LOAD: 330, READ: 386, SEL0: 496, SEL1: 536, POP: 542, GREEN: 600, SHARE: 642, NEXT: 744, GEAR: 800, SEPIA: 860, PLUS: 908, CLOSE: 956, PHONE: 986, END: 1204 };

type Cover = [string, string, string];
const SHELF: [string, string, Cover[]][] = [
  ["Новинки", "91 материал", [["#2b3a55", "#f1e3b5", "Ta'lim, sog'liq, tabiat"], ["#f4f1ea", "#1a237e", "Huquqbuzarlik"], ["#3d2f4f", "#f1e3b5", "Авторское право"]]],
  ["Популярное", "91 материал", [["#4a2d3a", "#f1e3b5", "Авторское право, товарные знаки"], ["#1f3a4f", "#f1e3b5", "The Hague Conventions"], ["#f4f1ea", "#1a237e", "Сборник законов"]]],
  ["По подписке", "51 материал", [["#1f4a3a", "#f1e3b5", "Ta'lim, sog'liq"], ["#1f3a4f", "#f1e3b5", "The Hague Conventions"], ["#2d2f5f", "#f1e3b5", "Saylov, fuqarolik"]]],
  ["Платные", "37 материалов", [["#f4f1ea", "#1a237e", "Сборник форм"], ["#22344f", "#f1e3b5", "International Law"], ["#3d2f4f", "#f1e3b5", "On Liberty"]]],
  ["Конституционное", "10 материалов", [["#25365a", "#f1e3b5", "Конституционное государство"], ["#2d2f5f", "#f1e3b5", "Saylov, mahalliy hokimiyat"], ["#5a2430", "#f1e3b5", "Commentaries on the Laws"]]],
];
const Book: React.FC<{ c: Cover; w: number; rot?: number; price?: string }> = ({ c: [bg, fg, t], w, rot = 0, price }) => (
  <div style={{ position: "relative", width: w, height: w * 1.38, borderRadius: 6, background: bg, boxShadow: "0 10px 24px rgba(0,0,0,0.35)", transform: `rotate(${rot}deg)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 10, boxSizing: "border-box", border: `2px solid ${bg === "#f4f1ea" ? "#ddd6c6" : "rgba(241,227,181,0.35)"}` }}>
    <div style={{ position: "absolute", left: 6, right: 6, top: 6, bottom: 6, border: `1px solid ${fg}`, opacity: 0.35, borderRadius: 3 }} />
    <div style={{ fontFamily: SERIF, fontSize: w * 0.11, lineHeight: 1.15, color: fg, textAlign: "center" }}>{t}</div>
    <svg style={{ marginTop: w * 0.1, opacity: 0.6 }} width={w * 0.16} height={w * 0.16} viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.6"><path d="M4 20h16M6 20V9M10 20V9M14 20V9M18 20V9M3 9l9-5 9 5z" /></svg>
    {price ? <div style={{ position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)", padding: "4px 12px", borderRadius: 10, background: "#fff", color: NAVY, fontFamily: UI, fontWeight: 900, fontSize: 15, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>{price}</div> : null}
  </div>
);

// reader text (Law on copyright, definitions)
const LEFT: [string, string][] = [
  ["", "аналогичных средств;"],
  ["произведение декоративно-прикладного искусства", " — двухмерное или трехмерное произведение искусства, оригиналы или экземпляры которого используются в качестве предметов практического пользования или переносятся на такие предметы;"],
  ["база данных", " — совокупность данных (статей, расчетов и т. д.), выраженных в объективной форме и систематизированных таким образом, чтобы эти данные могли быть найдены и обработаны с помощью ЭВМ;"],
  ["автор", " — физическое лицо, творческим трудом которого создано произведение;"],
  ["публичное исполнение", " — доведение произведений или объектов смежных прав до слухового и (или) зрительного восприятия в месте, открытом для публики;"],
  ["сдача в прокат", " — предоставление в целях извлечения дохода оригинала или экземпляров произведений во временное пользование;"],
  ["репрографическое воспроизведение", " — факсимильное воспроизведение в любом размере и в любой форме одного или более экземпляров оригиналов письменных и других произведений путем фотокопирования;"],
];
const RIGHT: [string, string][] = [
  ["", "или более экземпляров трехмерного произведения, запись в память ЭВМ и других электронных устройств;"],
  ["фонограмма", " — любая исключительно звуковая запись какого-либо исполнения, иных звуков, за исключением звуковой записи, включенной в аудиовизуальное произведение;"],
];
const SEL_PRE = "экземпляр фонограммы";
const SEL_A = " — ", SEL = "копия фонограммы на любом материальном носителе, изготовленная непосредственно или косвенно с фонограммы", SEL_B = " и включающая все звуки или часть звуков, зафиксированных в этой фонограмме;";
const RIGHT2: [string, string][] = [
  ["изготовитель фонограммы", " — юридическое или физическое лицо, взявшее на себя инициативу и ответственность за первую звуковую запись исполнения;"],
  ["произведения народного творчества", " — сказки, песни, танцы, произведения декоративно-прикладного искусства и другие результаты художественного и самодеятельного народного творчества;"],
  ["опубликование", " — выпуск в обращение экземпляров произведения с согласия автора в количестве, достаточном для удовлетворения разумных потребностей публики;"],
];
const Par: React.FC<{ b: string; t: string; fs: number }> = ({ b, t, fs }) => (
  <div style={{ marginTop: fs * 0.35, fontFamily: SERIF, fontSize: fs, lineHeight: 1.36, color: "#222", textAlign: "justify", textIndent: b ? fs * 1.2 : 0, hyphens: "auto" }} lang="ru"><b>{b}</b>{t}</div>
);
const PALETTE = ["#cfd3d8", "#e2b8f2", "#b9b8f4", "#f6cf9b", "#a8e6f4", "#f6aa8e", "#9da3aa", "#a6dfa8"];

export const Books: React.FC = () => {
  const f = useFrame();
  const sp = useSp();
  const lib = 1 - lin(f, T.OPEN + 4, T.PROD + 10);
  const prod = lin(f, T.PROD - 2, T.PROD + 14) * (1 - lin(f, T.LOAD, T.LOAD + 10));
  const inCart = f >= T.CART + 2;
  const load = lin(f, T.LOAD, T.LOAD + 8) * (1 - lin(f, T.READ - 6, T.READ + 4));
  const pct = Math.round(lin(f, T.LOAD + 4, T.READ - 8, 0, 100, Easing.out(Easing.quad)));
  const read = lin(f, T.READ - 6, T.READ + 8) * (1 - lin(f, T.PHONE - 20, T.PHONE));
  const sepia = lin(f, T.SEPIA + 2, T.SEPIA + 16);
  const paper = `rgb(${255 - 4 * sepia},${255 - 15 * sepia},${255 - 35 * sepia})`;
  const desk = `rgb(${242 - 2 * sepia},${243 - 8 * sepia},${245 - 22 * sepia})`;
  const fs = 15.5 * (1 + 0.1 * lin(f, T.PLUS + 2, T.PLUS + 14));
  const nSel = Math.round(lin(f, T.SEL0, T.SEL1, 0, SEL.length, Easing.linear));
  const selColor = f >= T.GREEN + 2 ? "rgba(120,210,124,0.55)" : "rgba(90,150,240,0.35)";
  const pop = lin(f, T.POP, T.POP + 10, 0, 1, OUTE) * (1 - lin(f, T.SHARE + 2, T.SHARE + 12));
  const flip = lin(f, T.NEXT + 2, T.NEXT + 26, 0, 1, Easing.bezier(0.5, 0, 0.3, 1));
  const page2 = f >= T.NEXT + 14;
  const settings = lin(f, T.GEAR + 4, T.GEAR + 18, 0, 1, OUTE) * (1 - lin(f, T.CLOSE, T.CLOSE + 12));
  const toast = lin(f, T.SHARE + 4, T.SHARE + 14) * (1 - lin(f, T.SHARE + 80, T.SHARE + 92));
  // reader camera (world = 1920x1080 reader page)
  const ck = [T.READ, T.READ + 34, T.SEL0 - 44, T.SEL0 - 14, T.SEL0, T.SHARE + 30, T.NEXT - 10, T.NEXT + 30, T.GEAR, T.GEAR + 30, T.CLOSE, T.PHONE];
  const cam = (v: number[]) => interpolate(f, ck, v, { ...cl, easing: IOE });
  const cx = cam([960, 700, 700, 1250, 1250, 1250, 960, 960, 960, 1540, 1540, 960]);
  const cy = cam([560, 420, 700, 470, 470, 520, 560, 560, 560, 520, 520, 560]);
  const cs = cam([1, 1.6, 1.6, 1.55, 1.55, 1.45, 1, 1, 1, 1.4, 1.4, 1]);
  // cursor (world coords inside the reader; library and phone use their own)
  const clicks: [number, number, number][] = [[T.SEL0, 1250, 412], [T.GREEN, 1412, 503], [T.SHARE, 1150, 760], [T.NEXT, 1842, 660], [T.GEAR, 1714, 158], [T.SEPIA, 1580, 268], [T.PLUS, 1837, 565], [T.CLOSE, 1714, 158]];
  const pk = [T.READ + 6, ...clicks.flatMap(([t], i) => (i === 0 ? [t - 10, T.SEL1 + 6] : [t - 12, t + 8])), T.PHONE - 20];
  const pxs = [1500, ...clicks.flatMap(([, x], i) => (i === 0 ? [x - 4, 1424] : [x - 4, x - 4])), 1600];
  const pys = [800, ...clicks.flatMap(([, , y], i) => (i === 0 ? [y - 4, 442] : [y - 4, y - 4])), 800];
  const px = interpolate(f, pk, pxs, { ...cl, easing: IOE }), py = interpolate(f, pk, pys, { ...cl, easing: IOE });
  const down = f >= T.SEL0 && f < T.SEL1 + 4 ? 0.6 : Math.max(...clicks.slice(1).map(([t]) => press(f, t)));
  // library camera + cursor
  const lcam = lin(f, 20, 170, 0, 1, IOE);
  const lpx = interpolate(f, [16, T.OPEN - 12, T.OPEN + 8], [1500, 950, 950], { ...cl, easing: IOE });
  const lpy = interpolate(f, [16, T.OPEN - 12, T.OPEN + 8], [900, 380, 380], { ...cl, easing: IOE });
  const caps: [number, string, string][] = [[0, "Библиотека:", "книги и курсы."], [T.PROD, "Купи книгу", "или добавь в корзину."], [T.READ, "Удобная", "читалка."], [T.POP, "Выделяй и делись", "ссылкой на фрагмент."], [T.GEAR, "Настрой", "под себя."], [T.PHONE, "Читай", "и на телефоне."]];
  let ci = 0; caps.forEach(([t], i) => { if (f >= t) ci = i; });
  const phone = sp(T.PHONE + 4, 16, 120);
  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden", fontFamily: UI }}>
      {/* ===== library page */}
      {lib > 0.001 ? (
        <AbsoluteFill style={{ opacity: lib, transform: `scale(${1 + 0.05 * (1 - lib)})` }}>
          <AbsoluteFill style={{ transformOrigin: "50% 0", transform: `translateY(${-120 * lcam}px) scale(${1.04 + 0.06 * lcam})` }}>
            <div style={{ position: "absolute", left: 24, right: 24, top: 150, height: 70, display: "flex", alignItems: "center", gap: 18 }}>
              <Img src={staticFile("brand/veoskill.webp")} style={{ height: 50 }} />
              <div style={{ height: 50, padding: "0 22px", borderRadius: 10, background: BLUE, color: "#fff", display: "flex", alignItems: "center", fontWeight: 800, fontSize: 20 }}>Каталог</div>
              <div style={{ flex: 1, height: 50, borderRadius: 10, border: `2px solid ${BLUE}`, display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 18, color: "#9aa1ab", fontWeight: 600, fontSize: 19, overflow: "hidden" }}>Искать материалы<div style={{ height: "100%", padding: "0 26px", background: BLUE, color: "#fff", display: "flex", alignItems: "center", fontWeight: 800 }}>Найти</div></div>
              {["Кабинет", "Мои книги", "Корзина", "Продавать"].map((t) => <div key={t} style={{ width: 92, textAlign: "center", fontWeight: 700, fontSize: 15, color: t === "Продавать" ? BLUE : "#3c3c3c" }}><div style={{ fontSize: 26 }}>{t === "Корзина" ? "🛍" : t === "Продавать" ? "🏪" : t === "Мои книги" ? "📖" : "🏠"}</div>{t}</div>)}
            </div>
            <div style={{ position: "absolute", left: 36, top: 240, display: "flex", gap: 30, fontWeight: 700, fontSize: 18, whiteSpace: "nowrap" }}>
              {["Новинки", "Популярное", "По подписке", "Все", "Конституционное", "Гражданское", "Уголовное", "Трудовое", "Семейное", "Административное", "Налоговое", "Международное"].map((t, i) => <span key={t} style={{ color: i < 3 ? "#e8572e" : i === 3 ? BLUE : "#2b2b2b" }}>{t}</span>)}
            </div>
            <div style={{ position: "absolute", left: 36, top: 300, fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 30, color: "#3c3c3c" }}>Хиты и новинки</div>
            {SHELF.map(([title, cnt, covers], i) => { const e = sp(6 + i * 5, 14, 170); return (
              <div key={title} style={{ position: "absolute", left: 24 + i * 378, top: 352, width: 360, height: 270, borderRadius: 16, overflow: "hidden", background: "linear-gradient(180deg, #4a5468 0%, #2b3242 100%)", opacity: Math.min(1, e * 1.4), transform: `translateY(${(1 - e) * 30}px)` }}>
                <div style={{ position: "absolute", left: 20, top: 26, display: "flex" }}>
                  {covers.map((c, k) => <div key={k} style={{ marginLeft: k ? -24 : 0, zIndex: k === 1 ? 2 : 1, transform: `translateY(${k === 1 ? -8 : 4}px)` }}><Book c={c} w={118} rot={(k - 1) * 6} price={i === 3 && k === 1 ? "45 000 сум" : undefined} /></div>)}
                </div>
                <div style={{ position: "absolute", left: 20, bottom: 18, color: "#fff" }}><div style={{ fontWeight: 900, fontSize: 21 }}>{title}</div><div style={{ fontWeight: 600, fontSize: 15, opacity: 0.8 }}>{cnt}</div></div>
              </div>); })}
            <div style={{ position: "absolute", left: 36, top: 668, fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 30, color: "#3c3c3c" }}>Популярные авторы</div>
            {["p0", "p1", "p2", "p3", "p4", "p5", "me1"].map((a, i) => { const e = sp(30 + i * 4, 14, 170); return (
              <div key={a} style={{ position: "absolute", left: 24 + i * 270, top: 720, width: 250, height: 200, borderRadius: 16, background: ["#7f6f8f", "#8f5f60", "#5f8f80", "#7f8060", "#8f6f6f", "#6f7f8f", "#7f7060"][i], display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, opacity: Math.min(1, e * 1.4) }}>
                <Img src={staticFile(`av/${a}.svg`)} style={{ width: 96, height: 96, borderRadius: 48, background: "#fff", border: "3px solid #fff" }} />
                <div style={{ fontWeight: 900, fontSize: 19, color: "#fff" }}>{["VEOSKILL", "Asad", "SWENSI", "Maftuna", "Tuta Jain", "Сардор", "Милана"][i]}</div>
              </div>); })}
            <div style={{ position: "absolute", left: 36, top: 968, fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 30, color: "#3c3c3c" }}>Конституционное</div>
          </AbsoluteFill>
          <div style={{ position: "absolute", inset: 0, zIndex: 50 }}><Pointer x={lpx} y={lpy} down={press(f, T.OPEN)} op={lin(f, 16, 26)} /></div>
        </AbsoluteFill>
      ) : null}

      {/* ===== book page: price, add to cart, read a fragment */}
      {prod > 0.001 ? (
        <AbsoluteFill style={{ background: "#fff", opacity: prod, fontFamily: UI }}>
          <AbsoluteFill style={{ transformOrigin: "1500px 700px", transform: `scale(${1 + 0.18 * lin(f, T.PROD + 10, T.CART - 14) * (1 - lin(f, T.CART + 20, T.RDB - 14))})` }}>
            <div style={{ position: "absolute", left: 24, right: 24, top: 130, height: 70, display: "flex", alignItems: "center", gap: 18 }}>
              <Img src={staticFile("brand/veoskill.webp")} style={{ height: 50 }} />
              <div style={{ height: 50, padding: "0 22px", borderRadius: 10, background: BLUE, color: "#fff", display: "flex", alignItems: "center", fontWeight: 800, fontSize: 20 }}>Каталог</div>
              <div style={{ flex: 1, height: 50, borderRadius: 10, border: `2px solid ${BLUE}`, display: "flex", alignItems: "center", paddingLeft: 18, color: "#9aa1ab", fontWeight: 600, fontSize: 19 }}>Искать материалы</div>
              <div style={{ position: "relative", width: 92, textAlign: "center", fontWeight: 700, fontSize: 15, color: "#3c3c3c" }}><div style={{ fontSize: 26 }}>🛍</div>Корзина
                {inCart ? <div style={{ position: "absolute", right: 14, top: -6, width: 26, height: 26, borderRadius: 13, background: "#ff6a1a", color: "#fff", fontWeight: 900, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(T.CART + 2, 9, 260)})` }}>1</div> : null}
              </div>
            </div>
            <div style={{ position: "absolute", left: 36, top: 220, fontWeight: 600, fontSize: 18, color: "#6f7682" }}>Материалы / Конституционное / <span style={{ color: "#2b2b2b" }}>Second Treatise of Government</span></div>
            <div style={{ position: "absolute", left: 36, top: 268 }}><Book c={["#2a2f33", "#e6d6a0", "Second Treatise of Government"]} w={300} /></div>
            <div style={{ position: "absolute", left: 36, top: 700, width: 300, height: 60, borderRadius: 12, background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, transform: `translateY(${press(f, T.RDB) * 4}px)` }}>Читать фрагмент</div>
            <div style={{ position: "absolute", left: 386, top: 268, width: 1000 }}>
              <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 48, color: "#2b2b2b" }}>Second Treatise of Government</div>
              <div style={{ marginTop: 10, fontWeight: 600, fontSize: 24, color: "#6f7682" }}>Автор <span style={{ color: BLUE }}>VEOSKILL</span></div>
              <div style={{ marginTop: 28, display: "flex", gap: 56 }}>{[["★ 5,0", "1 оценка"], ["132", "страницы"], ["PDF", "1,4 МБ"], ["4 стр.", "фрагмент"]].map(([a, b]) => <div key={b} style={{ textAlign: "center" }}><div style={{ fontWeight: 900, fontSize: 30, color: a.startsWith("★") ? "#2e9d3a" : "#2b2b2b" }}>{a}</div><div style={{ fontWeight: 600, fontSize: 17, color: "#6f7682" }}>{b}</div></div>)}</div>
              <div style={{ marginTop: 34, fontWeight: 900, fontSize: 30, color: "#2b2b2b" }}>О материале</div>
              <div style={{ marginTop: 10, fontWeight: 500, fontSize: 23, lineHeight: 1.55, color: "#3c3c3c" }}>«Второй трактат о правлении» Джона Локка (1690): естественное состояние, собственность, общественный договор, разделение властей. Основа конституционализма и теории прав человека.</div>
            </div>
            <div style={{ position: "absolute", left: 1500, top: 268, width: 384 }}>
              <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 46, color: "#2b2b2b" }}>24 999 сум</div>
              <div style={{ marginTop: 18, height: 68, borderRadius: 14, background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24 }}>Купить</div>
              <div style={{ marginTop: 14, height: 68, borderRadius: 14, background: "#58cc02", boxShadow: inCart ? "0 0 0 4px #b8f08a" : undefined, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24, transform: `translateY(${press(f, T.CART) * 4}px)` }}>
                {inCart ? <><div>В корзине</div><div style={{ fontSize: 15, fontWeight: 600, opacity: 0.9 }}>Перейти</div></> : "🛍 Добавить в корзину"}
              </div>
              <div style={{ marginTop: 22, borderRadius: 16, background: "#f4f7fb", padding: "18px 22px" }}>
                <div style={{ fontWeight: 900, fontSize: 22, color: "#2b2b2b" }}>Что вы получите</div>
                {["Доступ сразу после оплаты", "Чтение на сайте и в приложении", "Книга остаётся в вашей библиотеке"].map((t) => <div key={t} style={{ marginTop: 12, fontWeight: 600, fontSize: 18, color: "#3c3c3c" }}><span style={{ color: BLUE, marginRight: 10 }}>✓</span>{t}</div>)}
              </div>
            </div>
          </AbsoluteFill>
          <div style={{ position: "absolute", inset: 0, zIndex: 50 }}><Pointer x={interpolate(f, [T.PROD, T.CART - 12, T.CART + 8, T.RDB - 12, T.RDB + 8], [960, 1692, 1692, 186, 186], { ...cl, easing: IOE })} y={interpolate(f, [T.PROD, T.CART - 12, T.CART + 8, T.RDB - 12, T.RDB + 8], [600, 488, 488, 730, 730], { ...cl, easing: IOE })} down={Math.max(press(f, T.CART), press(f, T.RDB))} op={lin(f, T.PROD, T.PROD + 10)} /></div>
        </AbsoluteFill>
      ) : null}

      {/* ===== loader */}
      {load > 0.001 ? (
        <AbsoluteFill style={{ background: "#fdf3e1", opacity: load, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18 }}>
          <svg width="150" height="150" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="#f0dcc0" strokeWidth="6" /><circle cx="50" cy="50" r="44" fill="none" stroke={ORANGE} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 276} 276`} transform="rotate(-90 50 50)" /><text x="50" y="58" textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="22" fill="#3c3c3c">{pct}%</text></svg>
          <div style={{ fontWeight: 700, fontSize: 28, color: "#6f6352" }}>Открываем книгу</div>
        </AbsoluteFill>
      ) : null}

      {/* ===== reader */}
      {read > 0.001 ? (
        <AbsoluteFill style={{ opacity: read, background: desk }}>
          <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${960 - cs * cx}px, ${560 - cs * cy}px) scale(${cs})` }}>
            <div style={{ position: "absolute", left: 0, top: 120, width: 1920, height: 76, background: "#fff", borderBottom: "1px solid #e6e9ee", display: "flex", alignItems: "center", gap: 30, padding: "0 46px", boxSizing: "border-box" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
              <div style={{ flex: 1, fontWeight: 900, fontSize: 24, color: "#2b2b2b" }}>Сборник законов: об авторском праве, товарных знаках и защите прав потребителей</div>
              {["?", "≡", "▤", "⚙", "🔖", "⛶"].map((k, i) => <div key={k} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#2b2b2b", borderRadius: 10, background: i === 3 && settings > 0.5 ? "#f6e3cc" : undefined, transform: i === 3 ? `scale(${1 - press(f, T.GEAR) * 0.15})` : undefined }}>{k}</div>)}
            </div>
            {/* pages, slide on page turn */}
            {[0, 1].map((pg) => { const show = pg === 0 ? 1 - flip : flip; const dx = pg === 0 ? -flip * 300 : (1 - flip) * 300; if (show < 0.01) return null; return (
              <div key={pg} style={{ position: "absolute", left: 398 + dx, top: 236, width: 1124, height: 800, display: "flex", opacity: show, boxShadow: "0 10px 40px rgba(13,22,48,0.12)" }}>
                {[0, 1].map((side) => (
                  <div key={side} style={{ position: "relative", width: 562, height: 800, background: paper, padding: "28px 56px 0", boxSizing: "border-box", borderRight: side === 0 ? "1px solid #e8e2d6" : undefined, overflow: "hidden" }}>
                    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: "#777", textAlign: "center" }}>Законы об авторском праве, товарных знаках и защите прав потребителей</div>
                    <div style={{ marginTop: 18 }}>
                      {pg === 1 ? (side === 0 ? <>
                        <div style={{ marginTop: 6, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: fs, color: "#1a237e" }}>Глава 2. Авторское право</div>
                        <Par b="" t="Статья 4. Сфера действия авторского права" fs={fs} />
                        <Par b="" t="В соответствии с настоящим Законом авторское право распространяется на произведения авторов или иных первоначальных обладателей авторского права, являющихся гражданами Республики Узбекистан или имеющих постоянное место пребывания на территории Республики Узбекистан;" fs={fs} />
                        <Par b="" t="на произведения, впервые опубликованные в Республике Узбекистан, независимо от гражданства и постоянного места пребывания их авторов;" fs={fs} />
                        <Par b="" t="Статья 5. Объект авторского права" fs={fs} />
                        <Par b="" t="Авторское право распространяется на произведения науки, литературы и искусства, являющиеся результатом творческой деятельности, независимо от назначения и достоинства произведения, а также от способа его выражения." fs={fs} />
                      </> : <>
                        <Par b="" t="изображения (рисунок, эскиз, картина, план, чертеж, кино-, теле-, видео- или фотокадр и т. д.);" fs={fs} />
                        <Par b="" t="объемно-пространственной (скульптура, модель, макет, сооружение и т. д.);" fs={fs} />
                        <Par b="" t="Статья 6. Произведения, являющиеся объектами авторского права" fs={fs} />
                        <Par b="" t="Объектами авторского права являются: литературные произведения; драматические и сценарные произведения; музыкальные произведения с текстом или без текста; хореографические произведения и пантомимы; аудиовизуальные произведения; произведения живописи, скульптуры, графики; произведения архитектуры; программы для ЭВМ всех видов." fs={fs} />
                      </>) : side === 0 ? LEFT.map(([b, t], i) => <Par key={i} b={b} t={t} fs={fs} />) : <>
                        {RIGHT.map(([b, t], i) => <Par key={i} b={b} t={t} fs={fs} />)}
                        <div style={{ marginTop: fs * 0.35, fontFamily: SERIF, fontSize: fs, lineHeight: 1.36, color: "#222", textAlign: "justify", textIndent: fs * 1.2 }} lang="ru">
                          <b>{SEL_PRE}</b>{SEL_A}<span style={{ background: selColor }}>{SEL.slice(0, nSel)}</span>{SEL.slice(nSel)}{SEL_B}
                        </div>
                        {RIGHT2.map(([b, t], i) => <Par key={i} b={b} t={t} fs={fs} />)}
                      </>}
                    </div>
                    <div style={{ position: "absolute", bottom: 26, width: "100%", left: 0, textAlign: "center", fontFamily: SERIF, fontSize: 13, color: "#777" }}>{(pg ? 9 : 7) + side}</div>
                  </div>
                ))}
              </div>); })}
            {/* side arrows */}
            {[60, 1842].map((x, i) => <div key={x} style={{ position: "absolute", left: x - 34, top: 626, width: 68, height: 68, borderRadius: 34, background: "#fff", boxShadow: "0 6px 18px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", transform: i ? `scale(${1 - press(f, T.NEXT) * 0.12})` : undefined }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d={i ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"} /></svg></div>)}
            {/* selection popup */}
            {pop > 0.001 ? (
              <div style={{ position: "absolute", left: 1060, top: 470, width: 470, background: "#fff", borderRadius: 14, boxShadow: "0 18px 50px rgba(13,22,48,0.22)", overflow: "hidden", opacity: pop, transform: `translateY(${(1 - pop) * 10}px)` }}>
                <div style={{ height: 66, display: "flex", alignItems: "center", gap: 7, paddingLeft: 12, borderBottom: "1px solid #eef0f3" }}>
                  {PALETTE.map((c, i) => <div key={c} style={{ width: 38, height: 38, borderRadius: 19, background: c, boxShadow: i === 7 && f >= T.GREEN ? "0 0 0 3px #fff, 0 0 0 5px #58a85b" : undefined, transform: i === 7 ? `scale(${1 - press(f, T.GREEN) * 0.15})` : undefined }} />)}
                  <div style={{ marginLeft: "auto", width: 66, height: 66, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
                </div>
                {[["✎", "Добавить заметку"], ["🔖", "Поставить закладку"], ["⧉", "Скопировать"], ["⇪", "Поделиться"]].map(([ic, t], i) => (
                  <div key={t} style={{ height: 64, display: "flex", alignItems: "center", gap: 18, padding: "0 22px", fontWeight: 600, fontSize: 24, color: "#2b2b2b", background: i === 3 && f >= T.SHARE - 14 ? "#eef8ff" : undefined }}><span style={{ width: 28, color: BLUE, fontSize: 24 }}>{ic}</span>{t}</div>
                ))}
              </div>
            ) : null}
            {/* settings panel */}
            {settings > 0.001 ? (
              <div style={{ position: "absolute", left: 1270, top: 214, width: 620, borderRadius: 18, background: sepia > 0.5 ? "#fbf1df" : "#fff", boxShadow: "0 24px 70px rgba(13,22,48,0.22)", padding: "18px 22px 10px", boxSizing: "border-box", opacity: settings, transform: `translateY(${(1 - settings) * -16}px)`, fontFamily: UI }}>
                <div style={{ display: "flex", gap: 12 }}>
                  {[["#fff", "#2b2b2b"], ["#fbf1df", "#2b2b2b"], ["#1f2330", "#fff"]].map(([bg, c], i) => <div key={i} style={{ flex: 1, height: 72, borderRadius: 14, background: bg, border: `3px solid ${(i === 1 && sepia > 0.5) || (i === 0 && sepia <= 0.5) ? ORANGE : "#e6e1d6"}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 30, color: c, boxSizing: "border-box", transform: i === 1 ? `scale(${1 - press(f, T.SEPIA) * 0.06})` : undefined }}>A</div>)}
                </div>
                {[["Режим", ["Страницы", "Текст", "Лента"]], ["Листание", ["Лист", "Сдвиг", "Сразу"]]].map(([l, opts]) => (
                  <div key={l as string} style={{ height: 96, display: "flex", alignItems: "center", borderTop: "1px solid #ece6da", marginTop: 12 }}>
                    <div style={{ flex: 1, fontWeight: 600, fontSize: 26, color: "#2b2b2b" }}>{l as string}</div>
                    {(opts as string[]).map((o, k) => <div key={o} style={{ width: 118, height: 54, marginLeft: 8, borderRadius: 12, background: k === 0 ? ORANGE : "#f2e6d2", color: k === 0 ? "#fff" : "#4a3f30", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 22 }}>{o}</div>)}
                  </div>
                ))}
                <div style={{ height: 90, display: "flex", alignItems: "center", borderTop: "1px solid #ece6da" }}>
                  <div style={{ flex: 1, fontWeight: 600, fontSize: 26, color: "#2b2b2b" }}>Размер</div>
                  <div style={{ width: 62, height: 54, borderRadius: 12, background: "#f2e6d2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#4a3f30" }}>−</div>
                  <div style={{ width: 110, textAlign: "center", fontWeight: 700, fontSize: 24, color: "#2b2b2b" }}>{f >= T.PLUS + 2 ? 110 : 100}%</div>
                  <div style={{ width: 62, height: 54, borderRadius: 12, background: "#f2e6d2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#4a3f30", transform: `scale(${1 - press(f, T.PLUS) * 0.12})` }}>+</div>
                </div>
                {[["Показывать 2 страницы", true], ["Листать по клику", false]].map(([l, on]) => (
                  <div key={l as string} style={{ height: 80, display: "flex", alignItems: "center", borderTop: "1px solid #ece6da" }}>
                    <div style={{ flex: 1, fontWeight: 600, fontSize: 26, color: "#2b2b2b" }}>{l as string}</div>
                    <div style={{ width: 66, height: 38, borderRadius: 19, background: on ? ORANGE : "#efe7da", position: "relative" }}><div style={{ position: "absolute", top: 4, left: on ? 32 : 4, width: 30, height: 30, borderRadius: 15, background: "#fff" }} /></div>
                  </div>
                ))}
              </div>
            ) : null}
            {f >= T.READ + 6 && f < T.PHONE - 20 ? <Pointer x={px} y={py} down={down} op={lin(f, T.READ + 6, T.READ + 16)} /> : null}
          </AbsoluteFill>
          {/* bottom bar (screen space) */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 90, background: "#fff", borderTop: "1px solid #e6e9ee" }}>
            <div style={{ position: "absolute", left: 32, right: 32, top: 10, height: 4, borderRadius: 2, background: "#eceef2" }}><div style={{ width: `${page2 ? 10 : 8}%`, height: "100%", borderRadius: 2, background: "#f27a3c" }} /><div style={{ position: "absolute", left: `${page2 ? 10 : 8}%`, top: -8, width: 20, height: 20, marginLeft: -10, borderRadius: 10, background: "#f27a3c" }} /></div>
            <div style={{ position: "absolute", left: 32, top: 34, display: "flex", alignItems: "center", gap: 14 }}><Img src={staticFile("brand/veoskill.webp")} style={{ height: 36 }} /><div style={{ padding: "3px 14px", borderRadius: 14, border: `2px solid ${BLUE}`, fontWeight: 800, fontSize: 18, color: "#2b2b2b" }}>Читалка</div></div>
            <div style={{ position: "absolute", right: 32, top: 38, fontWeight: 800, fontSize: 24, color: "#2b2b2b" }}>Страница {page2 ? 9 : 7} из 89</div>
          </div>
          {/* toast */}
          {toast > 0.001 ? <div style={{ position: "absolute", left: "50%", top: 930, transform: `translate(-50%, ${(1 - toast) * 20}px)`, opacity: toast, padding: "16px 28px", borderRadius: 16, background: "#1f2330", color: "#fff", fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", gap: 14, zIndex: 60 }}><span style={{ color: "#7fe08a" }}>✓</span>Ссылка на фрагмент скопирована</div> : null}
        </AbsoluteFill>
      ) : null}

      {/* ===== phone */}
      {f >= T.PHONE - 20 ? (
        <AbsoluteFill style={{ background: "#fff", opacity: lin(f, T.PHONE - 20, T.PHONE) }}>
          <div style={{ position: "absolute", left: 960 - 240, top: 136, width: 480, height: 1000, borderRadius: 66, background: "#0d1630", padding: 14, boxSizing: "border-box", boxShadow: "0 50px 120px rgba(13,22,48,0.3)", transformOrigin: "50% 0", transform: `translateY(${(1 - phone) * 320}px) rotate(${(1 - phone) * 5}deg) scale(0.9)`, opacity: Math.min(1, phone * 1.5) }}>
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 54, background: "#fdf3e1", overflow: "hidden" }}>
              <div style={{ height: 44, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 34px", fontWeight: 800, fontSize: 16, color: NAVY }}><span>9:41</span><span style={{ width: 110, height: 28, borderRadius: 14, background: "#0d1630" }} /><span>5G</span></div>
              <div style={{ height: 50, display: "flex", alignItems: "center", gap: 22, padding: "0 22px", borderBottom: "1px solid #eadfca", fontSize: 22, color: "#2b2b2b" }}><span style={{ flex: 1 }}>‹</span><span>≡</span><span>▤</span><span>⚙</span><span>🔖</span></div>
              <div style={{ margin: "24px 14px 0", height: 700, background: "#fffaf0", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", padding: "20px 22px", boxSizing: "border-box", overflow: "hidden" }}>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: "#777", textAlign: "center" }}>Законы об авторском праве, товарных знаках и защите прав потребителей</div>
                <div style={{ marginTop: 10, textAlign: "center", fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: "#1a237e" }}>Глава 2. Авторское право</div>
                {["Статья 4. Сфера действия авторского права", "В соответствии с настоящим Законом авторское право распространяется на произведения авторов или иных первоначальных обладателей авторского права, являющихся гражданами Республики Узбекистан;", "на произведения, впервые опубликованные в Республике Узбекистан, независимо от гражданства их авторов;", "Статья 5. Объект авторского права", "Авторское право распространяется на произведения науки, литературы и искусства, являющиеся результатом творческой деятельности, независимо от назначения и достоинства произведения, а также от способа его выражения.", "Авторское право распространяется как на обнародованные, так и на необнародованные произведения, находящиеся в какой-либо объективной форме."].map((t, i) => (
                  <div key={i} style={{ marginTop: 6, fontFamily: SERIF, fontWeight: t.startsWith("Статья") ? 700 : 400, fontSize: 15.5, lineHeight: 1.42, color: "#222", textAlign: "justify", textIndent: t.startsWith("Статья") ? 0 : 16 }}>{t}</div>
                ))}
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, background: "#fdf3e1", borderTop: "1px solid #eadfca", padding: "14px 22px", boxSizing: "border-box" }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#2b2b2b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Сборник законов: об авторском праве, товарных знака…</div>
                <div style={{ marginTop: 14, height: 4, borderRadius: 2, background: "#eadfca", position: "relative" }}><div style={{ width: "10%", height: "100%", background: "#f27a3c", borderRadius: 2 }} /><div style={{ position: "absolute", left: "10%", top: -7, width: 18, height: 18, marginLeft: -9, borderRadius: 9, background: "#f27a3c" }} /></div>
                <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 8 }}><Img src={staticFile("brand/veoskill.webp")} style={{ height: 26 }} /><div style={{ padding: "1px 10px", borderRadius: 12, border: `2px solid ${ORANGE}`, fontWeight: 800, fontSize: 13 }}>Читалка</div><div style={{ marginLeft: "auto", fontWeight: 800, fontSize: 15 }}>Страница 9 из 89</div></div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* captions, left (white band in the library and reader so they read over the page) */}
      <TopLine key={ci} a={caps[ci][1]} b={caps[ci][2]} at={caps[ci][0] + 2} size={64} />
      {void HEAD}
    </AbsoluteFill>
  );
};
