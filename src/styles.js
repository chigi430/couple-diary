export const css = `
@keyframes sheetUp { from { transform: translateY(24px); opacity:0 } to { transform: translateY(0); opacity:1 } }
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes tabFade { from { opacity:0; transform: translateY(4px) } to { opacity:1; transform: translateY(0) } }
@keyframes slideUpFade { from { opacity:0; transform: translateY(16px) } to { opacity:1; transform: translateY(0) } }
* { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
html, body { margin:0; padding:0; }
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
    background: "linear-gradient(180deg, #FBF4EE 0%, #F6ECE4 100%)",
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif",
    color: "#3A2F2A", maxWidth: 460, margin: "0 auto", padding: "0 14px 90px",
    position: "relative",
  },

  header: { padding: "18px 3px 10px" },
  brandRow: { display: "flex", alignItems: "center", gap: 10 },
  brandMark: { fontSize: 22, color: "#D98763", lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(217,135,99,0.35))" },
  brandName: { fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: "#5A2A3A" },
  brandSub: { fontSize: 11.5, color: "#A8968D", marginTop: 1 },
  userChip: { display: "flex", alignItems: "center", gap: 5, background: "#FFF", border: "1px solid #F0E4DB", borderRadius: 18, padding: "4px 9px 4px 4px", boxShadow: "0 2px 6px rgba(122,74,60,0.06)" },
  userDot: { width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 },
  userName: { fontSize: 12, fontWeight: 700, color: "#5A4A42" },
  signOut: { border: "none", background: "none", color: "#C0AEA3", fontSize: 11, cursor: "pointer", padding: "4px 2px" },

  inviteBanner: { background: "#FFF6E9", border: "1px solid #F1D9B5", borderRadius: 12, padding: "10px 12px", marginBottom: 11, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  inviteText: { fontSize: 12, color: "#9A7A4C", lineHeight: 1.5 },
  inviteCode: { fontSize: 16, fontWeight: 800, letterSpacing: "0.15em", color: "#B0553B" },
  copyBtn: { border: "none", background: "#F1D9B5", color: "#8A5A2C", fontSize: 11.5, fontWeight: 700, borderRadius: 8, padding: "7px 11px", cursor: "pointer", whiteSpace: "nowrap" },

  anniStrip: { background: "linear-gradient(135deg,#FFF3EC 0%, #FCE7DC 100%)", borderRadius: 15, padding: "11px 13px", marginBottom: 11, boxShadow: "inset 0 0 0 1px rgba(217,135,99,0.14)", cursor: "pointer" },
  anniMain: { display: "flex", alignItems: "center", gap: 7 },
  anniHeart: { color: "#D9679A", fontSize: 15 },
  anniBig: { fontSize: 13.5, color: "#6B4A44" },
  anniCoupleNames: { fontSize: 13.5, fontWeight: 800, color: "#5A2A3A" },
  anniChips: { display: "flex", gap: 6, marginTop: 8 },
  chip: { fontSize: 11, background: "#fff", color: "#8A756C", padding: "4px 9px", borderRadius: 9, boxShadow: "0 1px 3px rgba(122,74,60,0.06)" },
  chipD: { color: "#C96F5B" },
  anniEmpty: { fontSize: 12.5, color: "#B08A7C" },

  body: { animation: "tabFade .18s ease" },
  diarySlide: { animation: "slideUpFade .22s cubic-bezier(.2,.8,.2,1)" },

  card: { background: "#FFFFFF", borderRadius: 20, padding: "16px 14px 18px", boxShadow: "0 10px 28px rgba(122,74,60,0.09), 0 2px 5px rgba(122,74,60,0.04)" },
  monthNav: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 },
  navBtn: { width: 34, height: 34, borderRadius: 11, border: "none", background: "#F7EDE7", color: "#B06A50", fontSize: 19, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 },
  monthTitleWrap: { textAlign: "center" },
  monthTitle: { fontSize: 17.5, fontWeight: 800, letterSpacing: "-0.02em", color: "#4A3A34" },
  monthAccent: { color: "#D98763" },
  monthMeta: { fontSize: 11, color: "#B4A69D", marginTop: 2 },
  dowRow: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 5 },
  dowCell: { textAlign: "center", fontSize: 11, fontWeight: 700, padding: "3px 0" },
  gridWrap: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 },
  emptyCell: { aspectRatio: "1 / 1.12" },
  dayCell: { aspectRatio: "1 / 1.12", border: "none", background: "#FAF5F1", borderRadius: 10, cursor: "pointer", padding: 0, overflow: "hidden", position: "relative" },
  dayFilled: { background: "#FCEFE8", boxShadow: "inset 0 0 0 1px rgba(217,135,99,0.18)" },
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
  hint: { textAlign: "center", fontSize: 12, color: "#B4A69D", marginTop: 15 },

  todayCard: { background: "#fff", borderRadius: 20, padding: "16px 15px", boxShadow: "0 10px 28px rgba(122,74,60,0.09)" },
  todayTop: { marginBottom: 11 },
  todayLabel: { fontSize: 11, fontWeight: 800, color: "#D98763", letterSpacing: "0.08em" },
  todayDate: { fontSize: 15.5, fontWeight: 800, color: "#4A3A34", marginTop: 2 },
  todayPhotos: { display: "flex", gap: 5, marginBottom: 10 },
  todayPhoto: { flex: 1, aspectRatio: "1", objectFit: "cover", borderRadius: 10, minWidth: 0 },
  todayMetaRow: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 },
  metaPill: { fontSize: 11, background: "#FBF0EA", color: "#8A6A5C", padding: "4px 9px", borderRadius: 8 },
  todayNote: { fontSize: 13.5, color: "#5A4A42", lineHeight: 1.65, margin: "0 0 12px", whiteSpace: "pre-wrap" },
  editBtn: { width: "100%", padding: "10px", border: "1px solid #EAD9CE", borderRadius: 11, background: "#fff", color: "#B06A50", fontSize: 13.5, fontWeight: 700, cursor: "pointer" },
  emptyToday: { textAlign: "center", padding: "12px 0 3px" },
  emptyIll: { fontSize: 30, color: "#E8CDBE", marginBottom: 6 },
  emptyTxt: { fontSize: 13.5, color: "#A8968D", marginBottom: 13 },

  recentWrap: { marginTop: 17 },
  recentHead: { fontSize: 12.5, fontWeight: 800, color: "#8A756C", margin: "0 4px 8px" },
  recentStrip: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 },
  recentItem: { border: "none", background: "none", padding: 0, cursor: "pointer", flexShrink: 0, width: 70 },
  recentImg: { width: 70, height: 70, objectFit: "cover", borderRadius: 12, display: "block" },
  recentDate: { fontSize: 10.5, color: "#A8968D", marginTop: 4, display: "block", textAlign: "center" },

  tabbar: { position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 14, width: "min(94%,400px)", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)", borderRadius: 18, display: "flex", padding: 5, boxShadow: "0 8px 24px rgba(122,74,60,0.16)", zIndex: 40 },
  tabBtn: { flex: 1, border: "none", background: "none", padding: "7px 2px", borderRadius: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 9.5, fontWeight: 700, color: "#B4A69D", cursor: "pointer" },
  tabOn: { background: "linear-gradient(135deg,#FBE0D4,#F7D0BF)", color: "#B0553B" },
  tabIcon: { fontSize: 14, lineHeight: 1 },

  overlay: { position: "fixed", inset: 0, background: "rgba(58,34,28,0.42)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 60, animation: "fadeIn .16s ease", backdropFilter: "blur(2px)" },
  sheet: { width: "100%", maxWidth: 460, background: "#FFFDFB", borderRadius: "22px 22px 0 0", padding: "8px 17px 22px", minHeight: "90vh", maxHeight: "90vh", overflowY: "auto", animation: "sheetUp .22s cubic-bezier(.2,.8,.2,1)" },
  sheetHandle: { width: 36, height: 4, borderRadius: 4, background: "#E7D9CF", margin: "5px auto 12px" },
  sheetHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 },
  sheetDate: { fontSize: 16.5, fontWeight: 800, color: "#5A2A3A", letterSpacing: "-0.02em", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7 },
  holidayTag: { fontSize: 10.5, fontWeight: 700, color: "#fff", background: "#E08A7A", padding: "2px 7px", borderRadius: 7 },
  sheetSub: { fontSize: 12, color: "#A8968D", marginTop: 4, display: "flex", alignItems: "center", gap: 5 },
  byDot: { width: 17, height: 17, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9.5 },
  closeBtn: { border: "none", background: "#F4EAE3", width: 30, height: 30, borderRadius: 9, color: "#9a8a80", fontSize: 13, cursor: "pointer" },
  savingTag: { fontSize: 10.5, color: "#C0AEA3" },

  fieldLabel: { fontSize: 12, fontWeight: 700, color: "#B06A50", margin: "13px 2px 7px" },
  moodRow: { display: "flex", gap: 6 },
  moodPick: { flex: 1, aspectRatio: "1", border: "1px solid #F0E4DB", background: "#FBF5F1", borderRadius: 11, fontSize: 17.5, cursor: "pointer", padding: 0 },
  moodPickOn: { background: "#FBE0D4", border: "1px solid #D98763" },

  stampWrap: { display: "flex", flexWrap: "wrap", gap: 6 },
  stamp: { display: "flex", alignItems: "center", gap: 4, border: "1px solid #F0E4DB", background: "#FBF5F1", borderRadius: 18, padding: "6px 11px", fontSize: 12, fontWeight: 600, color: "#8A756C", cursor: "pointer" },
  stampOn: { background: "#FBE0D4", border: "1px solid #D98763", color: "#B0553B" },

  photoStrip: { display: "flex", gap: 7, flexWrap: "wrap" },
  photoItem: { position: "relative", width: 68, height: 68, borderRadius: 11, overflow: "hidden" },
  photoImg: { width: "100%", height: "100%", objectFit: "cover" },
  photoBy: { position: "absolute", left: 4, bottom: 4, width: 17, height: 17, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, border: "1.5px solid #fff" },
  photoDel: { position: "absolute", top: 3, right: 3, width: 19, height: 19, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 10.5, cursor: "pointer", lineHeight: 1 },
  addPhoto: { width: 68, height: 68, borderRadius: 11, border: "1.5px dashed #E0CDBF", background: "#FBF5F1", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: "#C79A83" },
  addPhotoPlus: { fontSize: 18, lineHeight: 1 },
  addPhotoTxt: { fontSize: 10, fontWeight: 600 },
  photoLoading: { width: 68, height: 68, borderRadius: 11, background: "#F4EAE3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#C0AEA3" },

  twoCol: { display: "flex", gap: 8 },
  input: { width: "100%", border: "1px solid #F0E4DB", background: "#FBF5F1", borderRadius: 11, padding: "10px 12px", fontSize: 13.5, color: "#3A2F2A", outline: "none", transition: "border-color .15s, background .15s" },
  textarea: { width: "100%", border: "1px solid #F0E4DB", background: "#FBF5F1", borderRadius: 11, padding: "10px 12px", fontSize: 13.5, color: "#3A2F2A", outline: "none", resize: "vertical", lineHeight: 1.6, transition: "border-color .15s, background .15s" },
  noteBy: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#A8968D", marginTop: 6 },

  saveBtn: { width: "100%", marginTop: 15, padding: "11px", border: "none", borderRadius: 12, background: "linear-gradient(135deg,#E0906C 0%, #C96F5B 100%)", color: "#fff", fontSize: 13.5, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 14px rgba(201,111,91,0.28)" },
  smallActionBtn: { border: "1.5px solid #D98763", background: "#fff", color: "#B0553B", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "6px 12px", borderRadius: 9, whiteSpace: "nowrap" },

  // 인증/게이트 화면
  authWrap: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 380, margin: "0 auto", padding: "0 22px" },
  authBrand: { textAlign: "center", marginBottom: 24 },
  authMark: { fontSize: 34, color: "#D98763" },
  authTitle: { fontSize: 21, fontWeight: 800, color: "#5A2A3A", marginTop: 6 },
  authSub: { fontSize: 12.5, color: "#A8968D", marginTop: 5 },
  authField: { marginBottom: 10 },
  authLabel: { fontSize: 12, fontWeight: 700, color: "#B06A50", marginBottom: 5, display: "block" },
  chooserRow: { display: "flex", gap: 7, flexWrap: "wrap" },
  chooser: { width: 38, height: 38, borderRadius: 11, border: "1px solid #F0E4DB", background: "#FBF5F1", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  chooserOn: { border: "2px solid #D98763", background: "#FBE0D4" },
  colorDot: { width: 30, height: 30, borderRadius: "50%", cursor: "pointer", border: "2px solid transparent", transition: "transform .12s ease, border-color .12s ease" },
  colorDotOn: { border: "2px solid #3A2F2A", transform: "scale(1.08)" },
  authSwap: { textAlign: "center", marginTop: 13, fontSize: 12.5, color: "#A8968D" },
  authSwapLink: { color: "#C96F5B", fontWeight: 700, cursor: "pointer", background: "none", border: "none" },
  authError: { background: "#FDECEA", color: "#C0392B", fontSize: 12, padding: "9px 11px", borderRadius: 9, marginBottom: 10, lineHeight: 1.5 },
  authNote: { fontSize: 11, color: "#C0B2A8", textAlign: "center", marginTop: 12, lineHeight: 1.6 },

  gateOption: { background: "#fff", borderRadius: 16, padding: "17px 15px", marginBottom: 11, boxShadow: "0 8px 20px rgba(122,74,60,0.08)" },
  gateTitle: { fontSize: 14.5, fontWeight: 800, color: "#5A2A3A", marginBottom: 5 },
  gateDesc: { fontSize: 12, color: "#A8968D", lineHeight: 1.6, marginBottom: 11 },
  codeBig: { fontSize: 26, fontWeight: 800, letterSpacing: "0.2em", color: "#B0553B", textAlign: "center", padding: "13px 0", background: "#FFF6E9", borderRadius: 12, margin: "5px 0 3px" },

  center: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#B4A69D", fontSize: 13.5 },

  // 타임라인
  segRow: { display: "flex", background: "#F7EDE7", borderRadius: 12, padding: 4, marginBottom: 13 },
  segBtn: { flex: 1, border: "none", background: "none", padding: "8px 0", borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: "#B4A69D", cursor: "pointer" },
  segBtnOn: { background: "#fff", color: "#B0553B", boxShadow: "0 2px 7px rgba(122,74,60,0.12)" },

  tlEmpty: { textAlign: "center", padding: "34px 0", color: "#B4A69D", fontSize: 13 },

  tlCard: { display: "flex", gap: 10, background: "#fff", borderRadius: 15, padding: 12, marginBottom: 8, boxShadow: "0 6px 16px rgba(122,74,60,0.08)", border: "none", width: "100%", textAlign: "left", cursor: "pointer" },
  tlThumb: { width: 54, height: 54, borderRadius: 11, objectFit: "cover", flexShrink: 0 },
  tlNoThumb: { width: 54, height: 54, borderRadius: 11, background: "#FBF5F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  tlBody: { flex: 1, minWidth: 0 },
  tlTopRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 3 },
  tlDate: { fontSize: 12.5, fontWeight: 800, color: "#4A3A34" },
  tlMood: { fontSize: 13 },
  tlByRow: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#A8968D", marginBottom: 3 },
  tlByTime: { color: "#C0B2A8" },
  tlNote: { fontSize: 12.5, color: "#7A6A62", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  tlChips: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 },
  tlChip: { fontSize: 10, background: "#FBF0EA", color: "#8A6A5C", padding: "3px 7px", borderRadius: 7 },

  memGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5 },
  memCell: { border: "none", background: "none", padding: 0, cursor: "pointer", borderRadius: 10, overflow: "hidden", position: "relative", aspectRatio: "1" },
  memImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  memDateTag: { position: "absolute", left: 5, bottom: 5, fontSize: 9, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" },

  // 프로필 수정
  profileHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 },

  // EntrySheet 보기 모드
  viewMetaRow: { display: "flex", flexWrap: "wrap", gap: 5, margin: "3px 0 10px" },
  viewNote: { fontSize: 13.5, color: "#4A3A34", lineHeight: 1.65, whiteSpace: "pre-wrap", margin: "0 0 12px" },
  viewEmpty: { fontSize: 12.5, color: "#B4A69D", padding: "7px 2px 3px" },
  viewPhotoGrid: { display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 3 },
  carouselWrap: { marginBottom: 8 },
  carouselScroll: { display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", borderRadius: 15, WebkitOverflowScrolling: "touch" },
  carouselSlide: { flex: "0 0 100%", scrollSnapAlign: "start", position: "relative", aspectRatio: "1", background: "#F4EAE3" },
  carouselImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  carouselDots: { display: "flex", justifyContent: "center", gap: 5, marginTop: 7 },
  carouselDot: { width: 5, height: 5, borderRadius: 3, background: "#E7D9CF", transition: "width .15s, background .15s" },
  carouselDotOn: { width: 14, background: "#D98763" },
  viewActionsRow: { display: "flex", justifyContent: "flex-end", marginTop: 13 },

  // 달력 - 주간 일정 막대 스트립 (day cell 그리드 바로 아래)
  weekBarsWrap: { position: "relative", marginBottom: 5 },
  weekBar: { position: "absolute", height: 16, borderRadius: 5, fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", paddingLeft: 5, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", cursor: "pointer" },

  // 장소 지도
  placePickToggle: { width: "100%", border: "1px solid #F0E4DB", background: "#FBF5F1", color: "#B0553B", fontSize: 12, fontWeight: 700, padding: "9px 11px", borderRadius: 9, cursor: "pointer", marginTop: 7 },
  placePickBox: { marginTop: 7, borderRadius: 11, overflow: "hidden", border: "1px solid #F0E4DB" },
  placePickMap: { width: "100%", height: 170 },
  placePickHint: { fontSize: 11, color: "#A8968D", padding: "7px 9px", background: "#FBF5F1" },
  placePickConfirmRow: { display: "flex", gap: 5, padding: "7px 9px", background: "#FBF5F1" },
  mapBox: { borderRadius: 15, overflow: "hidden", border: "1px solid #F0E4DB" },
  mapCanvas: { width: "100%", height: 400 },
  mapErrorBox: { textAlign: "center", padding: "34px 15px", color: "#B4A69D", fontSize: 12.5, lineHeight: 1.6 },
  mapToggleBtn: { width: "100%", padding: "11px", border: "1px solid #EAD9CE", borderRadius: 11, background: "#fff", color: "#B06A50", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 8 },
  placeListWrap: { display: "flex", flexDirection: "column", gap: 5 },
  placeListItem: { display: "flex", alignItems: "center", gap: 9, background: "#fff", borderRadius: 12, padding: "10px 12px", border: "none", width: "100%", textAlign: "left", cursor: "pointer", boxShadow: "0 4px 10px rgba(122,74,60,0.06)" },
  placeListDate: { fontSize: 11, fontWeight: 700, color: "#B4A69D", minWidth: 42 },
  placeListName: { fontSize: 13, color: "#4A3A34" },

  // day-tap 팝업 - 일정보기 탭 / 폼
  schedByRow: { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#A8968D", margin: "3px 0 2px" },
  schedAddFab: { border: "none", background: "#D98763", color: "#fff", width: 32, height: 32, borderRadius: 11, fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 11px rgba(217,135,99,0.35)" },
  schedList: { display: "flex", flexDirection: "column", gap: 7, marginTop: 12 },
  schedItem: { display: "flex", alignItems: "center", gap: 9, background: "#FBF5F1", borderRadius: 12, padding: "10px 11px", border: "none", width: "100%", textAlign: "left", cursor: "pointer" },
  schedItemBar: { width: 4, alignSelf: "stretch", borderRadius: 3 },
  schedItemTime: { fontSize: 11, fontWeight: 700, color: "#B0553B", minWidth: 62 },
  schedItemTitle: { flex: 1, fontSize: 13, color: "#4A3A34" },

  prefList: { marginTop: 4, paddingTop: 4, borderTop: "1px solid #F0E4DB" },
  toggleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 2px" },
  toggleLabel: { fontSize: 13.5, fontWeight: 700, color: "#5A4A42" },
  toggleSwitch: { width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative", transition: "background .15s" },
  toggleKnob: { position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .15s cubic-bezier(.2,.8,.2,1)", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" },
  dateRangeRow: { display: "flex", alignItems: "center", gap: 7 },
  dateRangeSep: { color: "#B4A69D", fontSize: 12.5 },
  deleteBtn: { width: "100%", marginTop: 7, padding: "9px", border: "none", borderRadius: 10, background: "#FDECEA", color: "#C0392B", fontSize: 12.5, fontWeight: 700, cursor: "pointer" },

  // day-tap 팝업 (일정보기/오늘의 우리 2탭)
  daySheetSubTabs: { marginBottom: 5 },

  // 통계
  stBigRow: { display: "flex", gap: 8, marginBottom: 16 },
  stBig: { flex: 1, background: "#fff", borderRadius: 15, padding: "14px 8px", textAlign: "center", boxShadow: "0 6px 16px rgba(122,74,60,0.07)" },
  stBigNum: { fontSize: 20, fontWeight: 800, color: "#B0553B" },
  stBigUnit: { fontSize: 12, fontWeight: 700, color: "#C79A83" },
  stBigLabel: { fontSize: 10.5, color: "#A8968D", marginTop: 3 },
  stSection: { background: "#fff", borderRadius: 15, padding: "13px 14px", marginBottom: 10, boxShadow: "0 6px 16px rgba(122,74,60,0.07)" },
  stSectionTitle: { fontSize: 12.5, fontWeight: 800, color: "#8A756C", marginBottom: 9 },
  stBarRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 7 },
  stMoodEmoji: { fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 },
  stBarTrack: { flex: 1, height: 8, background: "#F4EAE3", borderRadius: 4, overflow: "hidden" },
  stBarFill: { height: "100%", background: "linear-gradient(90deg,#E0906C,#C96F5B)", borderRadius: 4, transition: "width .3s ease" },
  stBarCount: { fontSize: 11.5, fontWeight: 700, color: "#B0553B", width: 20, textAlign: "right", flexShrink: 0 },
  stCompareRow: { display: "flex", justifyContent: "space-around", marginBottom: 9 },
  stCompareSide: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  stCompareNum: { fontSize: 15, fontWeight: 800, color: "#4A3A34" },
  stCompareName: { fontSize: 11, color: "#A8968D" },

  // 연말 리캡
  recapSheet: { width: "100%", maxWidth: 460, background: "#FFFDFB", borderRadius: "22px 22px 0 0", padding: "8px 0 18px", minHeight: "88vh", maxHeight: "88vh", display: "flex", flexDirection: "column", animation: "sheetUp .22s cubic-bezier(.2,.8,.2,1)" },
  recapHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 17px 10px" },
  recapYearNav: { display: "flex", alignItems: "center", gap: 10 },
  recapYearBtn: { border: "none", background: "#F4EAE3", width: 26, height: 26, borderRadius: 8, color: "#B06A50", fontSize: 15, cursor: "pointer" },
  recapYearLabel: { fontSize: 14.5, fontWeight: 800, color: "#5A2A3A" },
  recapScroll: { flex: 1, display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", padding: "0 17px", gap: 12 },
  recapSlide: { flex: "0 0 calc(100% - 34px)", scrollSnapAlign: "center", borderRadius: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, color: "#fff", textAlign: "center", gap: 4 },
  recapEmoji: { fontSize: 40, marginBottom: 6, opacity: 0.9 },
  recapEmojiBig: { fontSize: 56, marginBottom: 6 },
  recapTitle: { fontSize: 16, fontWeight: 800, marginBottom: 2 },
  recapBig: { fontSize: 44, fontWeight: 800, lineHeight: 1 },
  recapUnit: { fontSize: 18, fontWeight: 700, marginLeft: 3, opacity: 0.85 },
  recapSub: { fontSize: 13, opacity: 0.9, marginTop: 4 },
  recapPhoto: { width: "100%", maxWidth: 220, aspectRatio: "1", objectFit: "cover", borderRadius: 16, marginBottom: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" },
  recapHint: { textAlign: "center", fontSize: 11.5, color: "#C0AEA3", marginTop: 10 },

  // 위시리스트
  wlAddBtn: { border: "none", borderRadius: 11, background: "linear-gradient(135deg,#E0906C 0%, #C96F5B 100%)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", padding: "0 16px", whiteSpace: "nowrap" },
  wlList: { display: "flex", flexDirection: "column", gap: 6, marginTop: 14 },
  wlItem: { display: "flex", alignItems: "center", gap: 9, background: "#FBF5F1", borderRadius: 12, padding: "9px 10px" },
  wlCheck: { width: 22, height: 22, borderRadius: "50%", border: "1.5px solid #D8C4B8", background: "#fff", cursor: "pointer", padding: 0, flexShrink: 0, color: "#fff", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" },
  wlCheckOn: { background: "#D98763", border: "1.5px solid #D98763" },
  wlTitle: { flex: 1, fontSize: 13.5, color: "#4A3A34", minWidth: 0, overflowWrap: "break-word" },
  wlTitleDone: { color: "#B4A69D", textDecoration: "line-through" },
  wlDel: { border: "none", background: "none", color: "#C0AEA3", fontSize: 12, cursor: "pointer", padding: "2px 4px", flexShrink: 0 },

  // 설정 탭
  profileDetailCard: { background: "#fff", borderRadius: 20, padding: "26px 16px 20px", marginBottom: 11, boxShadow: "0 10px 28px rgba(122,74,60,0.09)", display: "flex", flexDirection: "column", alignItems: "center" },
  profileAvatarWrap: { position: "relative" },
  profileEditFab: { position: "absolute", right: -3, bottom: -3, width: 32, height: 32, borderRadius: "50%", background: "#D98763", color: "#fff", border: "3px solid #fff", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 9px rgba(217,135,99,0.4)" },
  profileDetailName: { fontSize: 17, fontWeight: 800, color: "#5A2A3A", marginTop: 13 },
  profileDetailMeta: { display: "flex", alignItems: "center", gap: 7, marginTop: 6 },
  profileEmojiTag: { fontSize: 15 },
  profileColorTag: { width: 13, height: 13, borderRadius: "50%" },
  settingsCard: { background: "#fff", borderRadius: 20, padding: "18px 16px", boxShadow: "0 10px 28px rgba(122,74,60,0.09)" },
  avatarPickWrap: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 },
  avatarPickBtn: { position: "relative", cursor: "pointer", border: "none", background: "none", padding: 0 },
  avatarEditBadge: { position: "absolute", right: -2, bottom: -2, width: 24, height: 24, borderRadius: "50%", background: "#D98763", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: "2px solid #fff" },
  settingsSignOut: { width: "100%", marginTop: 15, padding: "11px", border: "1px solid #F0E4DB", borderRadius: 11, background: "#fff", color: "#B4A69D", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  settingsDanger: { width: "100%", marginTop: 8, padding: "11px", border: "1px solid #F5D6D2", borderRadius: 11, background: "#fff", color: "#C0392B", fontSize: 13, fontWeight: 700, cursor: "pointer" },
};
