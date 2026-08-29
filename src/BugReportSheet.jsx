import React, { useRef, useState } from "react";
import { S } from "./styles";
import { IconX } from "./Icons";
import MoreMenu from "./MoreMenu";
import { useSheetDrag } from "./useSheetDrag";
import { toast } from "./toast";
import SignedImage from "./SignedImage";

const STATUS_LABEL = { open: "점검중", pending_deploy: "배포대기", fixed: "수정완료", wontfix: "보류" };
// 배포 승인 권한이 없는 사람(파트너)에게는 "배포대기/PR 준비됨" 같은 개발 내부 상태를 그대로 보여줄
// 필요가 없어서 뭉뚱그린 라벨을 따로 둔다 — resolution_note/배포 버튼도 이 사람들에겐 아예 안 보여줌.
const STATUS_LABEL_VIEWER = { open: "점검중", pending_deploy: "처리중", fixed: "처리완료", wontfix: "확인완료" };
const STATUS_STYLE = {
  open: S.reportStatusOpen,
  pending_deploy: S.reportStatusPending,
  fixed: S.reportStatusFixed,
  wontfix: S.reportStatusWontfix,
};

// 배포 승인 버튼/처리 상세는 유지보수 담당(창환님) 계정에만 노출 — 민감 정보는 아니라 .env에 그냥 둠.
const MAINTAINER_USER_ID = import.meta.env.VITE_MAINTAINER_USER_ID;

// reports/addReport/deployReport는 Settings.jsx에서 useBugReports()로 한 번만 만들어서 내려받는다 —
// 여기서 또 호출하면 같은 이름의 realtime 채널을 두 번 구독하게 돼서 Supabase가 에러를 던진다
// ("tried to subscribe multiple times"), 그러면 에러 경계가 없어서 화면 전체가 하얗게 죽는다.
export default function BugReportSheet({ userId, reports, addReport, deployReport, onClose }) {
  const isMaintainer = userId === MAINTAINER_USER_ID;
  const { handleProps, handleStyle, sheetStyle, overlayStyle, sheetRef, overlayRef } = useSheetDrag(onClose);
  const fileRef = useRef(null);
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [deployBusyId, setDeployBusyId] = useState(null);

  const onPickPhoto = (ev) => {
    const file = ev.target.files && ev.target.files[0];
    ev.target.value = "";
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!description.trim()) {
      setErr("어떤 문제가 있었는지 적어주세요.");
      return;
    }
    setErr("");
    setBusy(true);
    const { error } = await addReport(description.trim(), photoFile, userId);
    setBusy(false);
    if (error) {
      console.error("오류 제보 실패:", error);
      setErr("제보를 접수하지 못했어요. 잠시 후 다시 시도해주세요.");
      return;
    }
    setDescription("");
    setPhotoFile(null);
    setPhotoPreview("");
    toast("제보가 접수됐어요 ✓");
  };

  const onDeploy = async (id) => {
    setDeployBusyId(id);
    const { error } = await deployReport(id);
    setDeployBusyId(null);
    if (error) {
      console.error("배포 실패:", error);
      toast("배포하지 못했어요. 잠시 후 다시 시도해주세요.");
      return;
    }
    toast("배포됐어요 ✓");
  };

  const onWait = () => {
    toast("나중에 다시 확인해요");
  };

  return (
    <div ref={overlayRef} style={{ ...S.overlay, ...overlayStyle }} onClick={onClose}>
      <div ref={sheetRef} style={{ ...S.sheet, ...sheetStyle }} onClick={(ev) => ev.stopPropagation()}>
        <div style={{ ...S.sheetHandleZone, ...handleStyle }} {...handleProps}>
          <div style={S.sheetHandle} />
        </div>
        <div style={S.sheetHead}>
          <div style={S.sheetDate}>오류 제보</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MoreMenu items={[{ label: "제출", onClick: submit }]} />
            <button style={S.closeBtn} onClick={onClose}><IconX size={14} /></button>
          </div>
        </div>

        {err && <div style={S.authError}>{err}</div>}

        <div style={S.authField}>
          <label style={S.authLabel}>어떤 문제가 있었나요?</label>
          <textarea
            style={{ ...S.textarea, minHeight: 90 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="예: 사진을 올렸는데 캘린더에 안 보여요"
            disabled={busy}
          />
          <button style={S.reportPhotoBtn} onClick={() => fileRef.current && fileRef.current.click()} disabled={busy}>
            📷 사진 첨부(선택)
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} style={{ display: "none" }} />
          {photoPreview && <img src={photoPreview} alt="" style={S.reportPhotoPreview} />}
        </div>

        {reports.length > 0 && (
          <div style={S.reportList}>
            {reports.map((r, i) => (
              <div key={r.id} style={{ ...S.reportItem, ...S.listPop, animationDelay: `${Math.min(i * 30, 300)}ms` }}>
                <div style={S.reportItemHead}>
                  <span style={S.reportDesc}>{r.description}</span>
                  <span style={{ ...S.reportStatus, ...STATUS_STYLE[r.status] }}>
                    {isMaintainer ? STATUS_LABEL[r.status] : STATUS_LABEL_VIEWER[r.status]}
                  </span>
                </div>
                {r.photo_path && <SignedImage path={r.photo_path} style={S.reportPhotoThumb} />}
                {isMaintainer && r.resolution_note && <div style={S.reportNote}>{r.resolution_note}</div>}
                {isMaintainer && r.status === "pending_deploy" && (
                  <div style={S.reportDecideRow}>
                    <button style={S.reportWaitBtn} onClick={onWait} disabled={deployBusyId === r.id}>대기</button>
                    <button style={S.reportDeployBtn} onClick={() => onDeploy(r.id)} disabled={deployBusyId === r.id}>
                      {deployBusyId === r.id ? "배포 중…" : "배포"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
