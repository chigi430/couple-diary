export const css = `
@keyframes sheetUp { from { transform: translateY(24px); opacity:0 } to { transform: translateY(0); opacity:1 } }
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
* { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
html, body { margin:0; padding:0; }
input, textarea, button { font-family: inherit; }
.no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
.no-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
`;

export const S = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #FBF4EE 0%, #F6ECE4 100%)",
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif",
    color: "#3A2F2A", maxWidth: 460, margin: "0 auto", padding: "0 16px 96px",
    position: "relative",
  },

  header: { padding: "26px 4px 12px" },
  brandRow: { display: "flex", alignItems: "center", gap: 12 },
  brandMark: { fontSize: 26, color: "#D98763", lineHeight: 1, filter: "drop-shadow(0 2px 4px rgba(217,135,99,0.35))" },
  brandName: { fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em", color: "#5A2A3A" },
  brandSub: { fontSize: 12.5, color: "#A8968D", marginTop: 2 },
  userChip: { display: "flex", alignItems: "center", gap: 6, background: "#FFF", border: "1px solid #F0E4DB", borderRadius: 20, padding: "5px 10px 5px 5px", boxShadow: "0 2px 6px rgba(122,74,60,0.06)" },
  userDot: { width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 },
  userName: { fontSize: 12.5, fontWeight: 700, color: "#5A4A42" },
  signOut: { border: "none", background: "none", color: "#C0AEA3", fontSize: 11.5, cursor: "pointer", padding: "4px 2px" },

  inviteBanner: { background: "#FFF6E9", border: "1px solid #F1D9B5", borderRadius: 14, padding: "12px 14px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  inviteText: { fontSize: 12.5, color: "#9A7A4C", lineHeight: 1.5 },
  inviteCode: { fontSize: 17, fontWeight: 800, letterSpacing: "0.15em", color: "#B0553B" },
  copyBtn: { border: "none", background: "#F1D9B5", color: "#8A5A2C", fontSize: 12, fontWeight: 700, borderRadius: 9, padding: "8px 12px", cursor: "pointer", whiteSpace: "nowrap" },

  anniStrip: { background: "linear-gradient(135deg,#FFF3EC 0%, #FCE7DC 100%)", borderRadius: 18, padding: "14px 16px", marginBottom: 14, boxShadow: "inset 0 0 0 1px rgba(217,135,99,0.14)", cursor: "pointer" },
  anniMain: { display: "flex", alignItems: "center", gap: 8 },
  anniHeart: { color: "#D9679A", fontSize: 16 },
  anniBig: { fontSize: 15, color: "#6B4A44" },
  anniChips: { display: "flex", gap: 8, marginTop: 10 },
  chip: { fontSize: 11.5, background: "#fff", color: "#8A756C", padding: "5px 10px", borderRadius: 10, boxShadow: "0 1px 3px rgba(122,74,60,0.06)" },
  chipD: { color: "#C96F5B" },
  anniEmpty: { fontSize: 13.5, color: "#B08A7C" },

  body: { animation: "fadeIn .2s ease" },

  card: { background: "#FFFFFF", borderRadius: 24, padding: "20px 16px 22px", boxShadow: "0 12px 34px rgba(122,74,60,0.10), 0 2px 6px rgba(122,74,60,0.04)" },
  monthNav: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  navBtn: { width: 38, height: 38, borderRadius: 12, border: "none", background: "#F7EDE7", color: "#B06A50", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 },
  monthTitleWrap: { textAlign: "center" },
  monthTitle: { fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#4A3A34" },
  monthAccent: { color: "#D98763" },
  monthMeta: { fontSize: 11.5, color: "#B4A69D", marginTop: 3 },
  dowRow: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 },
  dowCell: { textAlign: "center", fontSize: 12, fontWeight: 700, padding: "4px 0" },
  gridWrap: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 },
  emptyCell: { aspectRatio: "1 / 1.12" },
  dayCell: { aspectRatio: "1 / 1.12", border: "none", background: "#FAF5F1", borderRadius: 12, cursor: "pointer", padding: 0, overflow: "hidden", position: "relative" },
  dayFilled: { background: "#FCEFE8", boxShadow: "inset 0 0 0 1px rgba(217,135,99,0.18)" },
  dayToday: { boxShadow: "inset 0 0 0 2px #D98763" },
  dayInner: { width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: "2px" },
  dayNum: { fontSize: 14, fontWeight: 600 },
  dot: { width: 5, height: 5, borderRadius: "50%", background: "#D98763" },
  moodQuiet: { fontSize: 12, lineHeight: 1 },
  holMini: { fontSize: 8.5, color: "#d1584a", fontWeight: 600, lineHeight: 1, textAlign: "center", padding: "0 1px" },
  thumbWrap: { position: "relative", width: "100%", height: "100%" },
  thumb: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  thumbShade: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.42) 100%)" },
  dayNumOnPhoto: { position: "absolute", left: 6, bottom: 5, fontSize: 13, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" },
  moodBadge: { position: "absolute", right: 4, top: 4, fontSize: 12, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" },
  bothDot: { position: "absolute", left: 5, top: 4, fontSize: 10, color: "#ff8fb0", textShadow: "0 1px 2px rgba(0,0,0,0.5)" },
  hint: { textAlign: "center", fontSize: 12.5, color: "#B4A69D", marginTop: 18 },

  todayCard: { background: "#fff", borderRadius: 24, padding: "20px 18px", boxShadow: "0 12px 34px rgba(122,74,60,0.10)" },
  todayTop: { marginBottom: 14 },
  todayLabel: { fontSize: 12, fontWeight: 800, color: "#D98763", letterSpacing: "0.08em" },
  todayDate: { fontSize: 17, fontWeight: 800, color: "#4A3A34", marginTop: 3 },
  todayPhotos: { display: "flex", gap: 6, marginBottom: 12 },
  todayPhoto: { flex: 1, aspectRatio: "1", objectFit: "cover", borderRadius: 12, minWidth: 0 },
  todayMetaRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  metaPill: { fontSize: 12, background: "#FBF0EA", color: "#8A6A5C", padding: "5px 10px", borderRadius: 9 },
  todayNote: { fontSize: 14, color: "#5A4A42", lineHeight: 1.7, margin: "0 0 14px", whiteSpace: "pre-wrap" },
  editBtn: { width: "100%", padding: "12px", border: "1px solid #EAD9CE", borderRadius: 12, background: "#fff", color: "#B06A50", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  emptyToday: { textAlign: "center", padding: "14px 0 4px" },
  emptyIll: { fontSize: 34, color: "#E8CDBE", marginBottom: 8 },
  emptyTxt: { fontSize: 14, color: "#A8968D", marginBottom: 16 },

  recentWrap: { marginTop: 20 },
  recentHead: { fontSize: 13, fontWeight: 800, color: "#8A756C", margin: "0 4px 10px" },
  recentStrip: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 },
  recentItem: { border: "none", background: "none", padding: 0, cursor: "pointer", flexShrink: 0, width: 76 },
  recentImg: { width: 76, height: 76, objectFit: "cover", borderRadius: 14, display: "block" },
  recentDate: { fontSize: 11, color: "#A8968D", marginTop: 5, display: "block", textAlign: "center" },

  tabbar: { position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 16, width: "min(94%,400px)", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)", borderRadius: 20, display: "flex", padding: 6, boxShadow: "0 8px 26px rgba(122,74,60,0.16)", zIndex: 40 },
  tabBtn: { flex: 1, border: "none", background: "none", padding: "8px 2px", borderRadius: 15, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 10, fontWeight: 700, color: "#B4A69D", cursor: "pointer" },
  tabOn: { background: "linear-gradient(135deg,#FBE0D4,#F7D0BF)", color: "#B0553B" },
  tabIcon: { fontSize: 15, lineHeight: 1 },

  overlay: { position: "fixed", inset: 0, background: "rgba(58,34,28,0.42)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 60, animation: "fadeIn .18s ease", backdropFilter: "blur(2px)" },
  sheet: { width: "100%", maxWidth: 460, background: "#FFFDFB", borderRadius: "26px 26px 0 0", padding: "10px 20px 26px", minHeight: "90vh", maxHeight: "90vh", overflowY: "auto", animation: "sheetUp .26s cubic-bezier(.2,.8,.2,1)" },
  sheetHandle: { width: 40, height: 4, borderRadius: 4, background: "#E7D9CF", margin: "6px auto 14px" },
  sheetHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  sheetDate: { fontSize: 18, fontWeight: 800, color: "#5A2A3A", letterSpacing: "-0.02em", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 },
  holidayTag: { fontSize: 11, fontWeight: 700, color: "#fff", background: "#E08A7A", padding: "2px 8px", borderRadius: 8 },
  sheetSub: { fontSize: 12.5, color: "#A8968D", marginTop: 5, display: "flex", alignItems: "center", gap: 6 },
  byDot: { width: 18, height: 18, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 },
  closeBtn: { border: "none", background: "#F4EAE3", width: 32, height: 32, borderRadius: 10, color: "#9a8a80", fontSize: 14, cursor: "pointer" },
  savingTag: { fontSize: 11, color: "#C0AEA3" },

  fieldLabel: { fontSize: 12.5, fontWeight: 700, color: "#B06A50", margin: "16px 2px 8px" },
  moodRow: { display: "flex", gap: 7 },
  moodPick: { flex: 1, aspectRatio: "1", border: "1px solid #F0E4DB", background: "#FBF5F1", borderRadius: 12, fontSize: 19, cursor: "pointer", padding: 0 },
  moodPickOn: { background: "#FBE0D4", border: "1px solid #D98763" },

  stampWrap: { display: "flex", flexWrap: "wrap", gap: 7 },
  stamp: { display: "flex", alignItems: "center", gap: 5, border: "1px solid #F0E4DB", background: "#FBF5F1", borderRadius: 20, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, color: "#8A756C", cursor: "pointer" },
  stampOn: { background: "#FBE0D4", border: "1px solid #D98763", color: "#B0553B" },

  photoStrip: { display: "flex", gap: 8, flexWrap: "wrap" },
  photoItem: { position: "relative", width: 74, height: 74, borderRadius: 12, overflow: "hidden" },
  photoImg: { width: "100%", height: "100%", objectFit: "cover" },
  photoBy: { position: "absolute", left: 4, bottom: 4, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "1.5px solid #fff" },
  photoDel: { position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 11, cursor: "pointer", lineHeight: 1 },
  addPhoto: { width: 74, height: 74, borderRadius: 12, border: "1.5px dashed #E0CDBF", background: "#FBF5F1", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: "#C79A83" },
  addPhotoPlus: { fontSize: 20, lineHeight: 1 },
  addPhotoTxt: { fontSize: 11, fontWeight: 600 },
  photoLoading: { width: 74, height: 74, borderRadius: 12, background: "#F4EAE3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#C0AEA3" },

  twoCol: { display: "flex", gap: 10 },
  input: { width: "100%", border: "1px solid #F0E4DB", background: "#FBF5F1", borderRadius: 12, padding: "12px 14px", fontSize: 14.5, color: "#3A2F2A", outline: "none" },
  textarea: { width: "100%", border: "1px solid #F0E4DB", background: "#FBF5F1", borderRadius: 12, padding: "12px 14px", fontSize: 14.5, color: "#3A2F2A", outline: "none", resize: "vertical", lineHeight: 1.6 },
  noteBy: { display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#A8968D", marginTop: 7 },

  saveBtn: { width: "100%", marginTop: 18, padding: "13px", border: "none", borderRadius: 13, background: "linear-gradient(135deg,#E0906C 0%, #C96F5B 100%)", color: "#fff", fontSize: 14.5, fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 16px rgba(201,111,91,0.28)" },
  smallActionBtn: { border: "1.5px solid #D98763", background: "#fff", color: "#B0553B", fontSize: 12.5, fontWeight: 700, cursor: "pointer", padding: "7px 14px", borderRadius: 10, whiteSpace: "nowrap" },

  // 인증/게이트 화면
  authWrap: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 380, margin: "0 auto", padding: "0 24px" },
  authBrand: { textAlign: "center", marginBottom: 30 },
  authMark: { fontSize: 40, color: "#D98763" },
  authTitle: { fontSize: 24, fontWeight: 800, color: "#5A2A3A", marginTop: 8 },
  authSub: { fontSize: 13.5, color: "#A8968D", marginTop: 6 },
  authField: { marginBottom: 12 },
  authLabel: { fontSize: 12.5, fontWeight: 700, color: "#B06A50", marginBottom: 6, display: "block" },
  chooserRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  chooser: { width: 42, height: 42, borderRadius: 12, border: "1px solid #F0E4DB", background: "#FBF5F1", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  chooserOn: { border: "2px solid #D98763", background: "#FBE0D4" },
  colorDot: { width: 34, height: 34, borderRadius: "50%", cursor: "pointer", border: "2px solid transparent" },
  colorDotOn: { border: "2px solid #3A2F2A" },
  authSwap: { textAlign: "center", marginTop: 16, fontSize: 13, color: "#A8968D" },
  authSwapLink: { color: "#C96F5B", fontWeight: 700, cursor: "pointer", background: "none", border: "none" },
  authError: { background: "#FDECEA", color: "#C0392B", fontSize: 12.5, padding: "10px 12px", borderRadius: 10, marginBottom: 12, lineHeight: 1.5 },
  authNote: { fontSize: 11.5, color: "#C0B2A8", textAlign: "center", marginTop: 14, lineHeight: 1.6 },

  gateOption: { background: "#fff", borderRadius: 18, padding: "20px 18px", marginBottom: 14, boxShadow: "0 8px 22px rgba(122,74,60,0.08)" },
  gateTitle: { fontSize: 16, fontWeight: 800, color: "#5A2A3A", marginBottom: 6 },
  gateDesc: { fontSize: 13, color: "#A8968D", lineHeight: 1.6, marginBottom: 14 },
  codeBig: { fontSize: 30, fontWeight: 800, letterSpacing: "0.2em", color: "#B0553B", textAlign: "center", padding: "16px 0", background: "#FFF6E9", borderRadius: 14, margin: "6px 0 4px" },

  center: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#B4A69D", fontSize: 14 },

  // 타임라인
  segRow: { display: "flex", background: "#F7EDE7", borderRadius: 14, padding: 4, marginBottom: 16 },
  segBtn: { flex: 1, border: "none", background: "none", padding: "9px 0", borderRadius: 11, fontSize: 13, fontWeight: 700, color: "#B4A69D", cursor: "pointer" },
  segBtnOn: { background: "#fff", color: "#B0553B", boxShadow: "0 2px 8px rgba(122,74,60,0.12)" },

  tlEmpty: { textAlign: "center", padding: "40px 0", color: "#B4A69D", fontSize: 13.5 },

  tlCard: { display: "flex", gap: 12, background: "#fff", borderRadius: 18, padding: 14, marginBottom: 10, boxShadow: "0 6px 18px rgba(122,74,60,0.08)", border: "none", width: "100%", textAlign: "left", cursor: "pointer" },
  tlThumb: { width: 60, height: 60, borderRadius: 12, objectFit: "cover", flexShrink: 0 },
  tlNoThumb: { width: 60, height: 60, borderRadius: 12, background: "#FBF5F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 },
  tlBody: { flex: 1, minWidth: 0 },
  tlTopRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 4 },
  tlDate: { fontSize: 13, fontWeight: 800, color: "#4A3A34" },
  tlMood: { fontSize: 14 },
  tlByRow: { display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "#A8968D", marginBottom: 4 },
  tlByTime: { color: "#C0B2A8" },
  tlNote: { fontSize: 13, color: "#7A6A62", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  tlChips: { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 },
  tlChip: { fontSize: 10.5, background: "#FBF0EA", color: "#8A6A5C", padding: "3px 8px", borderRadius: 8 },

  memGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 },
  memCell: { border: "none", background: "none", padding: 0, cursor: "pointer", borderRadius: 12, overflow: "hidden", position: "relative", aspectRatio: "1" },
  memImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  memDateTag: { position: "absolute", left: 5, bottom: 5, fontSize: 9.5, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" },

  // 프로필 수정
  profileHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },

  // EntrySheet 보기 모드
  viewMetaRow: { display: "flex", flexWrap: "wrap", gap: 6, margin: "4px 0 12px" },
  viewNote: { fontSize: 14.5, color: "#4A3A34", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: "0 0 14px" },
  viewEmpty: { fontSize: 13, color: "#B4A69D", padding: "8px 2px 4px" },
  viewPhotoGrid: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 },
  carouselWrap: { marginBottom: 10 },
  carouselScroll: { display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", borderRadius: 18, WebkitOverflowScrolling: "touch" },
  carouselSlide: { flex: "0 0 100%", scrollSnapAlign: "start", position: "relative", aspectRatio: "1", background: "#F4EAE3" },
  carouselImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  carouselDots: { display: "flex", justifyContent: "center", gap: 6, marginTop: 8 },
  carouselDot: { width: 6, height: 6, borderRadius: 3, background: "#E7D9CF", transition: "width .15s, background .15s" },
  carouselDotOn: { width: 16, background: "#D98763" },
  viewActionsRow: { display: "flex", justifyContent: "flex-end", marginTop: 16 },

  // 달력 - 주간 일정 막대 스트립 (day cell 그리드 바로 아래)
  weekBarsWrap: { position: "relative", marginBottom: 6 },
  weekBar: { position: "absolute", height: 17, borderRadius: 6, fontSize: 9.5, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", paddingLeft: 5, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", cursor: "pointer" },

  // 장소 지도
  placePickToggle: { width: "100%", border: "1px solid #F0E4DB", background: "#FBF5F1", color: "#B0553B", fontSize: 12.5, fontWeight: 700, padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginTop: 8 },
  placePickBox: { marginTop: 8, borderRadius: 12, overflow: "hidden", border: "1px solid #F0E4DB" },
  placePickMap: { width: "100%", height: 180 },
  placePickHint: { fontSize: 11.5, color: "#A8968D", padding: "8px 10px", background: "#FBF5F1" },
  placePickConfirmRow: { display: "flex", gap: 6, padding: "8px 10px", background: "#FBF5F1" },
  mapBox: { borderRadius: 18, overflow: "hidden", border: "1px solid #F0E4DB" },
  mapCanvas: { width: "100%", height: 420 },
  mapErrorBox: { textAlign: "center", padding: "40px 16px", color: "#B4A69D", fontSize: 13, lineHeight: 1.6 },
  mapToggleBtn: { width: "100%", padding: "12px", border: "1px solid #EAD9CE", borderRadius: 12, background: "#fff", color: "#B06A50", fontSize: 13.5, fontWeight: 700, cursor: "pointer", marginBottom: 10 },
  placeListWrap: { display: "flex", flexDirection: "column", gap: 6 },
  placeListItem: { display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 14, padding: "12px 14px", border: "none", width: "100%", textAlign: "left", cursor: "pointer", boxShadow: "0 4px 12px rgba(122,74,60,0.06)" },
  placeListDate: { fontSize: 11.5, fontWeight: 700, color: "#B4A69D", minWidth: 44 },
  placeListName: { fontSize: 13.5, color: "#4A3A34" },

  // day-tap 팝업 - 일정보기 탭 / 폼
  schedByRow: { display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#A8968D", margin: "4px 0 2px" },
  schedAddFab: { border: "none", background: "#D98763", color: "#fff", width: 34, height: 34, borderRadius: 12, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(217,135,99,0.35)" },
  schedList: { display: "flex", flexDirection: "column", gap: 8, marginTop: 14 },
  schedItem: { display: "flex", alignItems: "center", gap: 10, background: "#FBF5F1", borderRadius: 14, padding: "11px 12px", border: "none", width: "100%", textAlign: "left", cursor: "pointer" },
  schedItemBar: { width: 4, alignSelf: "stretch", borderRadius: 3 },
  schedItemTime: { fontSize: 11.5, fontWeight: 700, color: "#B0553B", minWidth: 66 },
  schedItemTitle: { flex: 1, fontSize: 13.5, color: "#4A3A34" },

  toggleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 2px" },
  toggleLabel: { fontSize: 14, fontWeight: 700, color: "#5A4A42" },
  toggleSwitch: { width: 44, height: 26, borderRadius: 13, border: "none", cursor: "pointer", position: "relative", transition: "background .15s" },
  toggleKnob: { position: "absolute", top: 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" },
  dateRangeRow: { display: "flex", alignItems: "center", gap: 8 },
  dateRangeSep: { color: "#B4A69D", fontSize: 13 },
  deleteBtn: { width: "100%", marginTop: 8, padding: "10px", border: "none", borderRadius: 11, background: "#FDECEA", color: "#C0392B", fontSize: 13, fontWeight: 700, cursor: "pointer" },

  // day-tap 팝업 (일정보기/오늘의 우리 2탭)
  daySheetSubTabs: { marginBottom: 6 },

  // 설정 탭
  settingsCard: { background: "#fff", borderRadius: 24, padding: "22px 18px", boxShadow: "0 12px 34px rgba(122,74,60,0.10)" },
  avatarPickWrap: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 },
  avatarPickBtn: { position: "relative", cursor: "pointer", border: "none", background: "none", padding: 0 },
  avatarEditBadge: { position: "absolute", right: -2, bottom: -2, width: 26, height: 26, borderRadius: "50%", background: "#D98763", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, border: "2px solid #fff" },
  settingsSignOut: { width: "100%", marginTop: 18, padding: "13px", border: "1px solid #F0E4DB", borderRadius: 12, background: "#fff", color: "#B4A69D", fontSize: 13.5, fontWeight: 700, cursor: "pointer" },
  settingsDanger: { width: "100%", marginTop: 10, padding: "13px", border: "1px solid #F5D6D2", borderRadius: 12, background: "#fff", color: "#C0392B", fontSize: 13.5, fontWeight: 700, cursor: "pointer" },
};
