export const css = `
:root {
  color-scheme: light dark;
  --bg1: #FBF4EE;
  --bg2: #F6ECE4;
  --card: #FFFFFF;
  --sheet: #FFFDFB;
  --soft: #FBF5F1;
  --soft2: #F7EDE7;
  --tint: #FBE0D4;
  --invite-bg: #FFF6E9;
  --invite-bg2: #F1D9B5;
  --danger-bg: #FDECEA;
  --border: #F0E4DB;
  --text-strong: #3A2F2A;
  --text-h1: #5A2A3A;
  --text-h2: #4A3A34;
  --text-body: #5A4A42;
  --text-muted: #A8968D;
  --text-muted2: #B4A69D;
  --text-accent: #B06A50;
  --text-chip: #8A756C;
  --tabbar-bg: rgba(255,255,255,0.92);
  --tabon-bg: linear-gradient(135deg,#FBE0D4,#F7D0BF);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg1: #1E1712;
    --bg2: #221A15;
    --card: #2A2019;
    --sheet: #241C17;
    --soft: #382B21;
    --soft2: #33271D;
    --tint: #4A3524;
    --invite-bg: #362A1A;
    --invite-bg2: #4A3A22;
    --danger-bg: #3A2420;
    --border: #493A2C;
    --text-strong: #F2E7DD;
    --text-h1: #F6DCC9;
    --text-h2: #E9D9CD;
    --text-body: #D6C3B6;
    --text-muted: #A6907E;
    --text-muted2: #8C7A6C;
    --text-accent: #E8A17C;
    --text-chip: #C2A996;
    --tabbar-bg: rgba(30,23,18,0.85);
    --tabon-bg: linear-gradient(135deg,#4A3524,#3D2C1C);
  }
}
:root[data-theme="dark"] {
  --bg1: #1E1712;
  --bg2: #221A15;
  --card: #2A2019;
  --sheet: #241C17;
  --soft: #382B21;
  --soft2: #33271D;
  --tint: #4A3524;
  --invite-bg: #362A1A;
  --invite-bg2: #4A3A22;
  --danger-bg: #3A2420;
  --border: #493A2C;
  --text-strong: #F2E7DD;
  --text-h1: #F6DCC9;
  --text-h2: #E9D9CD;
  --text-body: #D6C3B6;
  --text-muted: #A6907E;
  --text-muted2: #8C7A6C;
  --text-accent: #E8A17C;
  --text-chip: #C2A996;
  --tabbar-bg: rgba(30,23,18,0.85);
  --tabon-bg: linear-gradient(135deg,#4A3524,#3D2C1C);
}
@keyframes sheetUp { from { transform: translateY(24px); opacity:0 } to { transform: translateY(0); opacity:1 } }
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes tabFade { from { opacity:0; transform: translateY(4px) } to { opacity:1; transform: translateY(0) } }
@keyframes slideUpFade { from { opacity:0; transform: translateY(16px) } to { opacity:1; transform: translateY(0) } }
@keyframes toastIn { from { opacity:0; transform: translate(-50%, -14px) } to { opacity:1; transform: translate(-50%, 0) } }
@keyframes listPop { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform: none } }
* { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
html, body { margin:0; padding:0; background: var(--bg1); }
input, textarea, button { font-family: inherit; }
button { transition: transform .12s cubic-bezier(.2,.8,.2,1), opacity .12s ease, background .15s ease, box-shadow .15s ease, border-color .15s ease; }
button:active { transform: scale(0.95); opacity: 0.85; }
button:disabled { transform: none; }
.no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
.no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
`;

export const S = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, var(--bg1) 0%, var(--bg2) 100%)",
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif",
    color: "var(--text-strong)", maxWidth: 460, margin: "0 auto", padding: "0 14px 90px",
    position: "relative",
  },

  header: { padding: "18px 3px 10px" },
  brandRow: { display: "flex", alignItems: "center", gap: 10 },
  brandMark: { fontSize: 22, color: "#D98763", lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(217,135,99,0.35))" },
  brandName: { fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-h1)" },
  brandSub: { fontSize: 11.5, color: "var(--text-muted)", marginTop: 1 },
  userChip: { display: "flex", alignItems: "center", gap: 5, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: "4px 9px 4px 4px", boxShadow: "0 2px 6px rgba(122,74,60,0.06)" },
  userDot: { width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 },
  userName: { fontSize: 12, fontWeight: 700, color: "var(--text-body)" },
  signOut: { border: "none", background: "none", color: "var(--text-muted2)", fontSize: 11, cursor: "pointer", padding: "4px 2px" },

  inviteBanner: { background: "var(--invite-bg)", border: "1px solid var(--invite-bg2)", borderRadius: 12, padding: "10px 12px", marginBottom: 11, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  inviteText: { fontSize: 12, color: "var(--text-accent)", lineHeight: 1.5 },
  inviteCode: { fontSize: 16, fontWeight: 800, letterSpacing: "0.15em", color: "var(--text-accent)" },
  copyBtn: { border: "none", background: "var(--invite-bg2)", color: "var(--text-accent)", fontSize: 11.5, fontWeight: 700, borderRadius: 8, padding: "7px 11px", cursor: "pointer", whiteSpace: "nowrap" },

  anniStrip: { background: "linear-gradient(135deg, var(--tint) 0%, var(--invite-bg2) 100%)", borderRadius: 15, padding: "11px 13px", marginBottom: 11, boxShadow: "inset 0 0 0 1px rgba(217,135,99,0.14)", cursor: "pointer" },
  anniMain: { display: "flex", alignItems: "center", gap: 7 },
  anniHeart: { color: "#D9679A", fontSize: 15 },
  anniBig: { fontSize: 13.5, color: "var(--text-body)" },
  anniCoupleNames: { fontSize: 13.5, fontWeight: 800, color: "var(--text-h1)" },
  anniChips: { display: "flex", gap: 6, marginTop: 8 },
  chip: { fontSize: 11, background: "var(--card)", color: "var(--text-chip)", padding: "4px 9px", borderRadius: 9, boxShadow: "0 1px 3px rgba(122,74,60,0.06)" },
  chipD: { color: "#C96F5B" },
  anniEmpty: { fontSize: 12.5, color: "var(--text-muted)" },

  body: { animation: "tabFade .18s ease" },
  diarySlide: { animation: "slideUpFade .22s cubic-bezier(.2,.8,.2,1)" },
  listPop: { animation: "listPop .32s cubic-bezier(.2,.8,.2,1) both" },
  toast: { position: "fixed", top: 16, left: "50%", background: "#3A2F2A", color: "#fff", fontSize: 12.5, fontWeight: 700, padding: "10px 18px", borderRadius: 30, boxShadow: "0 8px 22px rgba(0,0,0,0.22)", zIndex: 100, animation: "toastIn .25s cubic-bezier(.2,.8,.2,1) forwards", maxWidth: "88%", textAlign: "center" },

  card: { background: "var(--card)", borderRadius: 20, padding: "16px 14px 18px", boxShadow: "0 10px 28px rgba(122,74,60,0.09), 0 2px 5px rgba(122,74,60,0.04)" },
  monthNav: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 },
  navBtn: { width: 34, height: 34, borderRadius: 11, border: "none", background: "var(--soft2)", color: "var(--text-accent)", fontSize: 19, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 },
  monthTitleWrap: { textAlign: "center" },
  monthTitle: { fontSize: 17.5, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-h2)" },
  monthAccent: { color: "#D98763" },
  monthMeta: { fontSize: 11, color: "var(--text-muted2)", marginTop: 2 },
  dowRow: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 5 },
  dowCell: { textAlign: "center", fontSize: 11, fontWeight: 700, padding: "3px 0" },
  gridWrap: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 },
  emptyCell: { aspectRatio: "1 / 1.12" },
  dayCell: { aspectRatio: "1 / 1.12", border: "none", background: "var(--soft)", borderRadius: 10, cursor: "pointer", padding: 0, overflow: "hidden", position: "relative" },
  dayFilled: { background: "var(--tint)", boxShadow: "inset 0 0 0 1px rgba(217,135,99,0.18)" },
  dayToday: { boxShadow: "inset 0 0 0 2px #D98763" },
  dayInner: { width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: "2px" },
  dayNum: { fontSize: 13, fontWeight: 600 },
  dot: { width: 5, height: 5, borderRadius: "50%", background: "#D98763" },
  moodQuiet: { fontSize: 11, lineHeight: 1 },
  holMini: { fontSize: 8, color: "#d1584a", fontWeight: 600, lineHeight: 1, textAlign: "center", padding: "0 1px" },
  thumbWrap: { position: "relative", width: "100%", height: "100%" },
  thumb: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  thumbShade: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.42) 100%)" },
  dayNumOnPhoto: { position: "absolute", left: 5, bottom: 4, fontSize: 12, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" },
  moodBadge: { position: "absolute", right: 4, top: 4, fontSize: 11, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" },
  bothDot: { position: "absolute", left: 5, top: 4, fontSize: 9, color: "#ff8fb0", textShadow: "0 1px 2px rgba(0,0,0,0.5)" },
  hint: { textAlign: "center", fontSize: 12, color: "var(--text-muted2)", marginTop: 15 },

  todayCard: { background: "var(--card)", borderRadius: 20, padding: "16px 15px", boxShadow: "0 10px 28px rgba(122,74,60,0.09)" },
  todayTop: { marginBottom: 11 },
  todayLabel: { fontSize: 11, fontWeight: 800, color: "#D98763", letterSpacing: "0.08em" },
  todayDate: { fontSize: 15.5, fontWeight: 800, color: "var(--text-h2)", marginTop: 2 },
  todayMetaRow: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 },
  metaPill: { fontSize: 11, background: "var(--soft)", color: "var(--text-chip)", padding: "4px 9px", borderRadius: 8 },
  todayNote: { fontSize: 13.5, color: "var(--text-body)", lineHeight: 1.65, margin: "0 0 12px", whiteSpace: "pre-wrap" },
  editBtn: { width: "100%", padding: "10px", border: "1px solid var(--border)", borderRadius: 11, background: "var(--card)", color: "var(--text-accent)", fontSize: 13.5, fontWeight: 700, cursor: "pointer" },
  emptyToday: { textAlign: "center", padding: "12px 0 3px" },
  emptyIll: { fontSize: 30, color: "var(--text-muted2)", marginBottom: 6 },
  emptyTxt: { fontSize: 13.5, color: "var(--text-muted)", marginBottom: 13 },

  recentWrap: { marginTop: 17 },
  recentHead: { fontSize: 12.5, fontWeight: 800, color: "var(--text-chip)", margin: "0 4px 8px" },
  recentStrip: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 },
  recentItem: { border: "none", background: "none", padding: 0, cursor: "pointer", flexShrink: 0, width: 70 },
  recentImg: { width: 70, height: 70, objectFit: "cover", borderRadius: 12, display: "block" },
  recentDate: { fontSize: 10.5, color: "var(--text-muted)", marginTop: 4, display: "block", textAlign: "center" },

  feedWrap: { marginTop: 20 },
  feedHead: { fontSize: 12.5, fontWeight: 800, color: "var(--text-chip)", margin: "0 4px 10px" },
  feedCard: { background: "var(--card)", borderRadius: 20, padding: "14px 15px", marginBottom: 12, boxShadow: "0 8px 22px rgba(122,74,60,0.08)" },
  feedTopRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, width: "100%", border: "none", background: "none", padding: 0, marginBottom: 10, cursor: "pointer", textAlign: "left" },
  feedMood: { fontSize: 16, flexShrink: 0 },
  feedFootBtn: { display: "block", width: "100%", textAlign: "left", border: "none", background: "none", padding: 0, cursor: "pointer" },
  feedSentinel: { height: 1 },
  feedEnd: { textAlign: "center", padding: "16px 0 6px", fontSize: 11.5, color: "var(--text-muted2)" },

  tabbar: { position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 14, width: "min(94%,400px)", background: "var(--tabbar-bg)", backdropFilter: "blur(10px)", borderRadius: 18, display: "flex", padding: 5, boxShadow: "0 8px 24px rgba(122,74,60,0.16)", zIndex: 40 },
  tabBtn: { flex: 1, border: "none", background: "none", padding: "7px 2px", borderRadius: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 9.5, fontWeight: 700, color: "var(--text-muted2)", cursor: "pointer" },
  tabOn: { background: "var(--tabon-bg)", color: "var(--text-accent)" },
  tabIcon: { fontSize: 14, lineHeight: 1 },

  overlay: { position: "fixed", inset: 0, background: "rgba(58,34,28,0.42)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 60, animation: "fadeIn .16s ease", backdropFilter: "blur(2px)" },
  sheet: { width: "100%", maxWidth: 460, background: "var(--sheet)", borderRadius: "22px 22px 0 0", padding: "8px 17px 22px", minHeight: "90vh", maxHeight: "90vh", overflowY: "auto", animation: "sheetUp .22s cubic-bezier(.2,.8,.2,1)" },
  sheetHandleZone: { display: "flex", justifyContent: "center", padding: "12px 0 10px", marginTop: -8 },
  sheetHandle: { width: 36, height: 4, borderRadius: 4, background: "var(--border)" },
  sheetHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 },
  sheetDate: { fontSize: 16.5, fontWeight: 800, color: "var(--text-h1)", letterSpacing: "-0.02em", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7 },
  holidayTag: { fontSize: 10.5, fontWeight: 700, color: "#fff", background: "#E08A7A", padding: "2px 7px", borderRadius: 7 },
  sheetSub: { fontSize: 12, color: "var(--text-muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 5 },
  byDot: { width: 17, height: 17, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9.5 },
  closeBtn: { border: "none", background: "var(--soft2)", width: 30, height: 30, borderRadius: 9, color: "var(--text-muted2)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },

  moreMenuWrap: { position: "relative" },
  moreMenuBtn: { border: "none", background: "var(--soft2)", width: 30, height: 30, borderRadius: 9, color: "var(--text-muted2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  moreMenuDropdown: { position: "absolute", top: "calc(100% + 6px)", right: 0, background: "var(--card)", borderRadius: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.18)", overflow: "hidden", zIndex: 70, minWidth: 168, animation: "slideUpFade .16s cubic-bezier(.2,.8,.2,1)" },
  moreMenuItem: { display: "block", width: "100%", textAlign: "left", padding: "12px 16px", border: "none", borderBottom: "1px solid var(--border)", background: "none", color: "var(--text-strong)", fontSize: 13.5, fontWeight: 600, cursor: "pointer" },
  moreMenuItemDanger: { color: "#C0392B" },
  savingTag: { fontSize: 10.5, color: "var(--text-muted2)" },

  fieldLabel: { fontSize: 12, fontWeight: 700, color: "var(--text-accent)", margin: "13px 2px 7px" },
  moodRow: { display: "flex", gap: 6 },
  moodPick: { flex: 1, aspectRatio: "1", border: "1px solid var(--border)", background: "var(--soft)", borderRadius: 11, fontSize: 17.5, cursor: "pointer", padding: 0 },
  moodPickOn: { background: "var(--tint)", border: "1px solid #D98763" },

  stampWrap: { display: "flex", flexWrap: "wrap", gap: 6 },
  stamp: { display: "flex", alignItems: "center", gap: 4, border: "1px solid var(--border)", background: "var(--soft)", borderRadius: 18, padding: "6px 11px", fontSize: 12, fontWeight: 600, color: "var(--text-chip)", cursor: "pointer" },
  stampOn: { background: "var(--tint)", border: "1px solid #D98763", color: "var(--text-accent)" },

  photoStrip: { display: "flex", gap: 7, flexWrap: "wrap" },
  photoItem: { position: "relative", width: 68, height: 68, borderRadius: 11, overflow: "hidden" },
  photoImg: { width: "100%", height: "100%", objectFit: "cover" },
  photoBy: { position: "absolute", left: 4, bottom: 4, width: 17, height: 17, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, border: "1.5px solid #fff" },
  photoDel: { position: "absolute", top: 3, right: 3, width: 19, height: 19, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 10.5, cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" },
  addPhoto: { width: 68, height: 68, borderRadius: 11, border: "1.5px dashed var(--border)", background: "var(--soft)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: "#C79A83" },
  addPhotoPlus: { fontSize: 18, lineHeight: 1 },
  addPhotoTxt: { fontSize: 10, fontWeight: 600 },
  photoLoading: { width: 68, height: 68, borderRadius: 11, background: "var(--soft2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--text-muted2)" },

  twoCol: { display: "flex", gap: 8 },
  input: { width: "100%", border: "1px solid var(--border)", background: "var(--soft)", borderRadius: 11, padding: "10px 12px", fontSize: 13.5, color: "var(--text-strong)", outline: "none", transition: "border-color .15s, background .15s" },
  textarea: { width: "100%", border: "1px solid var(--border)", background: "var(--soft)", borderRadius: 11, padding: "10px 12px", fontSize: 13.5, color: "var(--text-strong)", outline: "none", resize: "vertical", lineHeight: 1.6, transition: "border-color .15s, background .15s" },
  noteBy: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-muted)", marginTop: 6 },

  saveBtn: { width: "100%", marginTop: 15, padding: "11px", border: "none", borderRadius: 12, background: "linear-gradient(135deg,#E0906C 0%, #C96F5B 100%)", color: "#fff", fontSize: 13.5, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 14px rgba(201,111,91,0.28)" },
  smallActionBtn: { border: "1.5px solid #D98763", background: "var(--card)", color: "var(--text-accent)", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "6px 12px", borderRadius: 9, whiteSpace: "nowrap" },

  // 인증/게이트 화면
  authWrap: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 380, margin: "0 auto", padding: "0 22px" },
  authBrand: { textAlign: "center", marginBottom: 24 },
  authMark: { fontSize: 34, color: "#D98763" },
  authTitle: { fontSize: 21, fontWeight: 800, color: "var(--text-h1)", marginTop: 6 },
  authSub: { fontSize: 12.5, color: "var(--text-muted)", marginTop: 5 },
  authField: { marginBottom: 10 },
  authLabel: { fontSize: 12, fontWeight: 700, color: "var(--text-accent)", marginBottom: 5, display: "block" },
  chooserRow: { display: "flex", gap: 7, flexWrap: "wrap" },
  chooser: { width: 38, height: 38, borderRadius: 11, border: "1px solid var(--border)", background: "var(--soft)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  chooserOn: { border: "2px solid #D98763", background: "var(--tint)" },
  colorDot: { width: 30, height: 30, borderRadius: "50%", cursor: "pointer", border: "2px solid transparent", transition: "transform .12s ease, border-color .12s ease" },
  colorDotOn: { border: "2px solid var(--text-strong)", transform: "scale(1.08)" },
  authSwap: { textAlign: "center", marginTop: 13, fontSize: 12.5, color: "var(--text-muted)" },
  authSwapLink: { color: "#C96F5B", fontWeight: 700, cursor: "pointer", background: "none", border: "none" },
  authError: { background: "var(--danger-bg)", color: "#C0392B", fontSize: 12, padding: "9px 11px", borderRadius: 9, marginBottom: 10, lineHeight: 1.5 },
  authNote: { fontSize: 11, color: "var(--text-muted2)", textAlign: "center", marginTop: 12, lineHeight: 1.6 },

  gateOption: { background: "var(--card)", borderRadius: 16, padding: "17px 15px", marginBottom: 11, boxShadow: "0 8px 20px rgba(122,74,60,0.08)" },
  gateTitle: { fontSize: 14.5, fontWeight: 800, color: "var(--text-h1)", marginBottom: 5 },
  gateDesc: { fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 11 },
  codeBig: { fontSize: 26, fontWeight: 800, letterSpacing: "0.2em", color: "var(--text-accent)", textAlign: "center", padding: "13px 0", background: "var(--invite-bg)", borderRadius: 12, margin: "5px 0 3px" },

  center: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted2)", fontSize: 13.5 },

  // 타임라인
  segRow: { display: "flex", background: "var(--soft2)", borderRadius: 12, padding: 4, marginBottom: 13 },
  segBtn: { flex: 1, border: "none", background: "none", padding: "8px 0", borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: "var(--text-muted2)", cursor: "pointer" },
  segBtnOn: { background: "var(--card)", color: "var(--text-accent)", boxShadow: "0 2px 7px rgba(122,74,60,0.12)" },

  tlEmpty: { textAlign: "center", padding: "34px 0", color: "var(--text-muted2)", fontSize: 13 },

  tlCard: { display: "flex", gap: 10, background: "var(--card)", borderRadius: 15, padding: 12, marginBottom: 8, boxShadow: "0 6px 16px rgba(122,74,60,0.08)", border: "none", width: "100%", textAlign: "left", cursor: "pointer" },
  tlThumb: { width: 54, height: 54, borderRadius: 11, objectFit: "cover", flexShrink: 0 },
  tlNoThumb: { width: 54, height: 54, borderRadius: 11, background: "var(--soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  tlBody: { flex: 1, minWidth: 0 },
  tlTopRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 3 },
  tlDate: { fontSize: 12.5, fontWeight: 800, color: "var(--text-h2)" },
  tlMood: { fontSize: 13 },
  tlByRow: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", marginBottom: 3 },
  tlByTime: { color: "var(--text-muted2)" },
  tlNote: { fontSize: 12.5, color: "var(--text-body)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  tlChips: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 },
  tlChip: { fontSize: 10, background: "var(--soft)", color: "var(--text-chip)", padding: "3px 7px", borderRadius: 7 },

  memGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5 },
  memCell: { border: "none", background: "none", padding: 0, cursor: "pointer", borderRadius: 10, overflow: "hidden", position: "relative", aspectRatio: "1" },
  memImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  memDateTag: { position: "absolute", left: 5, bottom: 5, fontSize: 9, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" },

  // 프로필 수정
  profileHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 },

  // EntrySheet 보기 모드
  viewMetaRow: { display: "flex", flexWrap: "wrap", gap: 5, margin: "3px 0 10px" },
  viewNote: { fontSize: 13.5, color: "var(--text-h2)", lineHeight: 1.65, whiteSpace: "pre-wrap", margin: "0 0 12px" },
  viewEmpty: { fontSize: 12.5, color: "var(--text-muted2)", padding: "7px 2px 3px" },
  carouselWrap: { position: "relative", marginBottom: 8, borderRadius: 15, overflow: "hidden", transition: "aspect-ratio .2s ease" },
  carouselScroll: { display: "flex", height: "100%", overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" },
  carouselSlide: { flex: "0 0 100%", scrollSnapAlign: "start", position: "relative", height: "100%", background: "var(--soft2)" },
  carouselImg: { width: "100%", height: "100%", objectFit: "contain", display: "block", cursor: "zoom-in" },
  carouselCount: { position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20 },
  carouselDots: { display: "flex", justifyContent: "center", gap: 5, marginTop: 7 },
  carouselDot: { width: 5, height: 5, borderRadius: 3, background: "var(--border)", transition: "width .15s, background .15s" },
  carouselDotOn: { width: 14, background: "#D98763" },

  lightboxOverlay: { position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column" },
  lightboxTopBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 14px 0", flexShrink: 0 },
  lightboxCounter: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600 },
  lightboxClose: { width: 34, height: 34, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  lightboxStage: { flex: 1, position: "relative", overflow: "hidden", touchAction: "none" },
  lightboxImg: { position: "absolute", top: "50%", left: "50%", maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", objectFit: "contain", userSelect: "none", WebkitUserSelect: "none" },
  viewActionsRow: { display: "flex", justifyContent: "flex-end", marginTop: 13 },

  // 달력 - 주간 일정 막대 스트립 (day cell 그리드 바로 아래)
  weekBarsWrap: { position: "relative", marginBottom: 5 },
  weekBar: { position: "absolute", height: 16, borderRadius: 5, fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", paddingLeft: 5, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", cursor: "pointer" },

  // 장소 지도
  placePickToggle: { width: "100%", border: "1px solid var(--border)", background: "var(--soft)", color: "var(--text-accent)", fontSize: 12, fontWeight: 700, padding: "9px 11px", borderRadius: 9, cursor: "pointer", marginTop: 7 },
  placePickBox: { marginTop: 7, borderRadius: 11, overflow: "hidden", border: "1px solid var(--border)" },
  placePickMap: { width: "100%", height: 170 },
  placePickHint: { fontSize: 11, color: "var(--text-muted)", padding: "7px 9px", background: "var(--soft)" },
  placePickConfirmRow: { display: "flex", gap: 5, padding: "7px 9px", background: "var(--soft)" },
  mapBox: { borderRadius: 15, overflow: "hidden", border: "1px solid var(--border)" },
  mapCanvas: { width: "100%", height: 400 },
  mapErrorBox: { textAlign: "center", padding: "34px 15px", color: "var(--text-muted2)", fontSize: 12.5, lineHeight: 1.6 },
  mapToggleBtn: { width: "100%", padding: "11px", border: "1px solid var(--border)", borderRadius: 11, background: "var(--card)", color: "var(--text-accent)", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 8 },
  placeListWrap: { display: "flex", flexDirection: "column", gap: 5 },
  placeListItem: { display: "flex", alignItems: "center", gap: 9, background: "var(--card)", borderRadius: 12, padding: "10px 12px", border: "none", width: "100%", textAlign: "left", cursor: "pointer", boxShadow: "0 4px 10px rgba(122,74,60,0.06)" },
  placeListDate: { fontSize: 11, fontWeight: 700, color: "var(--text-muted2)", minWidth: 42 },
  placeListName: { fontSize: 13, color: "var(--text-h2)" },

  // day-tap 팝업 - 일정보기 탭 / 폼
  schedByRow: { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)", margin: "3px 0 2px" },
  schedAddFab: { border: "none", background: "#D98763", color: "#fff", width: 32, height: 32, borderRadius: 11, fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 11px rgba(217,135,99,0.35)" },
  schedList: { display: "flex", flexDirection: "column", gap: 7, marginTop: 12 },
  schedItem: { display: "flex", alignItems: "center", gap: 9, background: "var(--soft)", borderRadius: 12, padding: "10px 11px", border: "none", width: "100%", textAlign: "left", cursor: "pointer" },
  schedItemBar: { width: 4, alignSelf: "stretch", borderRadius: 3 },
  schedItemTime: { fontSize: 11, fontWeight: 700, color: "var(--text-accent)", minWidth: 62 },
  schedItemTitle: { flex: 1, fontSize: 13, color: "var(--text-h2)" },

  prefList: { marginTop: 4, paddingTop: 4, borderTop: "1px solid var(--border)" },
  toggleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 2px" },
  toggleLabel: { fontSize: 13.5, fontWeight: 700, color: "var(--text-body)" },
  toggleSwitch: { width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative", transition: "background .15s" },
  toggleKnob: { position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .15s cubic-bezier(.2,.8,.2,1)", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" },
  dateRangeRow: { display: "flex", alignItems: "center", gap: 7 },
  dateRangeSep: { color: "var(--text-muted2)", fontSize: 12.5 },
  deleteBtn: { width: "100%", marginTop: 7, padding: "9px", border: "none", borderRadius: 10, background: "var(--danger-bg)", color: "#C0392B", fontSize: 12.5, fontWeight: 700, cursor: "pointer" },

  // day-tap 팝업 (일정보기/오늘의 우리 2탭)
  daySheetSubTabs: { marginBottom: 5 },

  // 통계
  stBigRow: { display: "flex", gap: 8, marginBottom: 16 },
  stBig: { flex: 1, background: "var(--card)", borderRadius: 15, padding: "14px 8px", textAlign: "center", boxShadow: "0 6px 16px rgba(122,74,60,0.07)" },
  stBigNum: { fontSize: 20, fontWeight: 800, color: "var(--text-accent)" },
  stBigUnit: { fontSize: 12, fontWeight: 700, color: "#C79A83" },
  stBigLabel: { fontSize: 10.5, color: "var(--text-muted)", marginTop: 3 },
  stSection: { background: "var(--card)", borderRadius: 15, padding: "13px 14px", marginBottom: 10, boxShadow: "0 6px 16px rgba(122,74,60,0.07)" },
  stSectionTitle: { fontSize: 12.5, fontWeight: 800, color: "var(--text-chip)", marginBottom: 9 },
  stBarRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 7 },
  stMoodEmoji: { fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 },
  stBarTrack: { flex: 1, height: 8, background: "var(--soft2)", borderRadius: 4, overflow: "hidden" },
  stBarFill: { height: "100%", background: "linear-gradient(90deg,#E0906C,#C96F5B)", borderRadius: 4, transition: "width .3s ease" },
  stBarCount: { fontSize: 11.5, fontWeight: 700, color: "var(--text-accent)", width: 20, textAlign: "right", flexShrink: 0 },
  stCompareRow: { display: "flex", justifyContent: "space-around", marginBottom: 9 },
  stCompareSide: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  stCompareNum: { fontSize: 15, fontWeight: 800, color: "var(--text-h2)" },
  stCompareName: { fontSize: 11, color: "var(--text-muted)" },

  // 연말 리캡
  recapSheet: { width: "100%", maxWidth: 460, background: "var(--sheet)", borderRadius: "22px 22px 0 0", padding: "8px 0 18px", minHeight: "88vh", maxHeight: "88vh", display: "flex", flexDirection: "column", animation: "sheetUp .22s cubic-bezier(.2,.8,.2,1)" },
  recapHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 17px 10px" },
  recapYearNav: { display: "flex", alignItems: "center", gap: 10 },
  recapYearBtn: { border: "none", background: "var(--soft2)", width: 26, height: 26, borderRadius: 8, color: "var(--text-accent)", fontSize: 15, cursor: "pointer" },
  recapYearLabel: { fontSize: 14.5, fontWeight: 800, color: "var(--text-h1)" },
  recapScroll: { flex: 1, display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", padding: "0 17px", gap: 12 },
  recapSlide: { flex: "0 0 calc(100% - 34px)", scrollSnapAlign: "center", borderRadius: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, color: "#fff", textAlign: "center", gap: 4 },
  recapEmoji: { fontSize: 40, marginBottom: 6, opacity: 0.9 },
  recapEmojiBig: { fontSize: 56, marginBottom: 6 },
  recapTitle: { fontSize: 16, fontWeight: 800, marginBottom: 2 },
  recapBig: { fontSize: 44, fontWeight: 800, lineHeight: 1 },
  recapUnit: { fontSize: 18, fontWeight: 700, marginLeft: 3, opacity: 0.85 },
  recapSub: { fontSize: 13, opacity: 0.9, marginTop: 4 },
  recapPhoto: { width: "100%", maxWidth: 220, aspectRatio: "1", objectFit: "cover", borderRadius: 16, marginBottom: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" },
  recapHint: { textAlign: "center", fontSize: 11.5, color: "var(--text-muted2)", marginTop: 10 },

  // 위시리스트
  wlAddBtn: { border: "none", borderRadius: 11, background: "linear-gradient(135deg,#E0906C 0%, #C96F5B 100%)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", padding: "0 16px", whiteSpace: "nowrap" },
  wlList: { display: "flex", flexDirection: "column", gap: 6, marginTop: 14 },
  wlItem: { display: "flex", alignItems: "center", gap: 9, background: "var(--soft)", borderRadius: 12, padding: "9px 10px" },
  wlCheck: { width: 22, height: 22, borderRadius: "50%", border: "1.5px solid var(--border)", background: "var(--card)", cursor: "pointer", padding: 0, flexShrink: 0, color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" },
  wlCheckOn: { background: "#D98763", border: "1.5px solid #D98763" },
  wlTitle: { flex: 1, fontSize: 13.5, color: "var(--text-h2)", minWidth: 0, overflowWrap: "break-word" },
  wlTitleDone: { color: "var(--text-muted2)", textDecoration: "line-through" },
  wlDel: { border: "none", background: "none", color: "var(--text-muted2)", fontSize: 12, cursor: "pointer", padding: "2px 4px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" },

  // 설정 탭
  profileDetailCard: { position: "relative", background: "var(--card)", borderRadius: 20, padding: "26px 16px 20px", marginBottom: 11, boxShadow: "0 10px 28px rgba(122,74,60,0.09)", display: "flex", flexDirection: "column", alignItems: "center" },
  profileTopMenu: { position: "absolute", top: 14, right: 14 },
  profileAvatarWrap: { position: "relative" },
  profileEditFab: { position: "absolute", right: 4, bottom: 4, width: 32, height: 32, borderRadius: "50%", background: "#D98763", color: "#fff", border: "3px solid #fff", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 9px rgba(217,135,99,0.4)" },
  profileDetailName: { fontSize: 17, fontWeight: 800, color: "var(--text-h1)", marginTop: 13 },
  profileDetailMeta: { display: "flex", alignItems: "center", gap: 7, marginTop: 6 },
  profileEmojiTag: { fontSize: 15 },
  profileColorTag: { width: 13, height: 13, borderRadius: "50%" },
  settingsCard: { background: "var(--card)", borderRadius: 20, padding: "18px 16px", boxShadow: "0 10px 28px rgba(122,74,60,0.09)" },
  avatarPickWrap: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 },
  avatarPickBtn: { position: "relative", cursor: "pointer", border: "none", background: "none", padding: 0 },
  avatarEditBadge: { position: "absolute", right: -2, bottom: -2, width: 24, height: 24, borderRadius: "50%", background: "#D98763", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: "2px solid #fff" },
  settingsMoreBtn: { background: "var(--card)", boxShadow: "0 6px 16px rgba(122,74,60,0.1)" },
  versionFooter: { textAlign: "center", fontSize: 10.5, color: "var(--text-muted2)", padding: "18px 0 6px" },
  versionUpdateLink: { border: "none", background: "none", padding: 0, color: "#D98763", fontWeight: 700, fontSize: 10.5, cursor: "pointer", textDecoration: "underline" },
};
