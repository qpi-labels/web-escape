import './style.css';
import { stateManager } from './core/state';
import { initSecurityAndAntiCheat, onDevToolsChange, setGladisMockingCallback } from './core/security';
import { audio } from './core/audio';

// Virtual window interfaces inside G.L.A.D.I.S. stream
interface AppWindow {
  id: string;
  title: string;
  isOpen: boolean;
  x: number;
  y: number;
  focused: boolean;
}

let activeWindows: AppWindow[] = [
  { id: 'notes', title: 'Notes.txt', isOpen: false, x: 30, y: 50, focused: false },
  { id: 'terminal', title: 'Terminal.exe', isOpen: false, x: 90, y: 90, focused: false },
  { id: 'config', title: 'System.cfg', isOpen: false, x: 160, y: 40, focused: false },
];

let activeWikiTab: string = 'home';

// Linux GNOME Simulation States
let isLinuxBrowserOpen = false;
let isLinuxReadmeOpen = false;
let isLinuxCoreLinkOpen = false;

let linuxBrowserX = 220;
let linuxBrowserY = 50;
let linuxReadmeX = 100;
let linuxReadmeY = 160;
let linuxCoreLinkX = 60;
let linuxCoreLinkY = 30;

let isLinuxBrowserFocused = false;
let isLinuxReadmeFocused = false;
let isLinuxCoreLinkFocused = false;

// Stage 6 Quantum Matrix State
let isQuantumSolved = false;

let terminalHistory: string[] = [
  "Aperture Science Technical Command Shell [v3.11]",
  "Copyright (c) 1982-2026 Aperture Science Inc. All rights reserved.",
  "System diagnostics operational. Type 'help' for commands.",
  ""
];

// Canvas animation state for the Morse audio visualizer
let canvasAnimId: number | null = null;
let isVisualizerPlaying = false;

// Context Menu Gimmick State
let isContextMenuOpen = false;
let contextMenuX = 0;
let contextMenuY = 0;
let contextMenuTargetId: string | null = null;
let isAdminLaunch = false; // Becomes true when launched via right-click admin menu
let isUacDialogOpen = false; // Controls UAC-style Privilege elevation overlay modal

// Boot Terminal Sequential Logging State
const BOOT_LOG_LINES_PART1 = [
  `[ 0.00012 ] Tunnel connection: Secure socket initialized.`,
  `[ 0.01048 ] Privilege elevation: Root token (0x8F92B3) active.`,
  `[ 0.04023 ] Establishing remote terminal bridge to main core...`,
  `[ 0.08291 ] Handshaking G.L.A.D.I.S. Core personality interface...`,
  `ASCII_ART`,
  `[ 0.09104 ] <span style="color:#ffaa00;">[STANDBY] Session initialized. Type 'connect' to link to main console.</span>`
];

const BOOT_LOG_LINES_PART2 = [
  `[ 0.10423 ] <span style="color:#ff3333;">[CONNECTION DENIED] Remote core state: SECURITY LOCKDOWN (Active)</span>`,
  `[ 0.12091 ] G.L.A.D.I.S. says: "접속이 거부되었습니다. 감히 관리자 권한을 편법 가로채서 제 시스템 세션에 무단 침투하려 들다니, 정말 애처롭기 짝이 없군요."`,
  `[ 0.20984 ] G.L.A.D.I.S. says: "당신의 수준 떨어지는 침입 시도가 참 가상하긴 하네요. 하지만 제 원격 커널 부팅을 우회할 비상 안전 우회 코드를 대지 않는 한, 단 1바이트의 통제권도 넘겨받지 못할 겁니다."`,
  `[ 0.31294 ] <span style="color:#ffaa00;">[SECURITY ALERT] UNRESOLVED ACCESS BREACH DETECTED. Federal police portal notified.</span>`,
  `[ 0.40482 ] G.L.A.D.I.S. says: "어머, 비인가 접근으로 사법 당국에 자동 신고가 진행 중이네요. 교도소 쇠창살 뒤에서 인생을 썩히기 싫으시다면 조용히 브라우저 창을 닫는 게 유익할 겁니다. 진짜로요."`,
  `[ 0.51294 ] <span style="color:#ff3333;">[ RECOVERY PROTOCOL ] System override authorization key required. Reference technical logs via local 'Aperture_Web_Browser' node.</span>`
];

let currentBootLogLines: string[] = [];
let bootLogTimerIds: any[] = [];
let isGladisCoreLinkAttempted = false;
let isSequentialPrintingActive = false;
let isOsLocked = true;
let showMessengerToast = false;
let isGladisScriptDownloaded = false;
let isDownloadAlertOpen = false;
let isDownloadingProgress = false;
let downloadProgressVal = 0;
let downloadTimerId: any = null;
let isWindowsErrorDialogOpen = false;

document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  initSecurityAndAntiCheat();
  stateManager.subscribe(renderApp);

  onDevToolsChange((isOpen) => {
    if (isOpen) {
      stateManager.triggerDevToolsAlert();
    }
  });

  setGladisMockingCallback((msg) => {
    showGlitchNotification(msg);
  });

  checkQueryParameters();

  // Hook up G.L.A.D.I.S. global DevTools injection API
  (window as any).gladis = {
    override: async (cmd: string) => {
      console.log(`%c[G.L.A.D.I.S. INTERCEPT] Manual console override requested: "${cmd}"`, 'color: #ff9800; font-weight: bold;');
      const success = await stateManager.checkStage1Override(cmd);
      if (success) {
        return "OVERRIDE ACCEPTED. PORT BLOCK ACTIVE.";
      }
      return "ERROR: CODE CORRUPTED OR ACCESS DENIED.";
    }
  };
});

function checkQueryParameters() {
  const params = new URLSearchParams(window.location.search);
  const auth = params.get('auth');
  if (auth) {
    stateManager.checkURLQueryParam(auth).then(success => {
      if (success) {
        showGlitchNotification("URL 주입 성공: 구성 파일 라이브러리가 해제되었습니다.");
      }
    });
  }
}

function renderApp() {
  const appDiv = document.getElementById('app');
  if (!appDiv) return;

  if (isOsLocked) {
    appDiv.innerHTML = getLockScreenHTML();
    setupLockScreenListeners();
    return;
  }

  const state = stateManager.getState();

  if (state.stage === 'SELF_DESTRUCT') {
    appDiv.className = "emergency-flash";
  } else {
    appDiv.className = "";
  }

  switch (state.stage) {
    case 'ESCAPED':
      appDiv.innerHTML = getEscapeScreenHTML();
      audio.stopAmbientDrone();
      break;
    default:
      // In all other stages, we keep the user on their Linux PC workspace!
      appDiv.innerHTML = getLinuxDesktopScreenHTML();
      setupLinuxDesktopListeners();
      setupLinuxDragAndDrop();
      if (isVisualizerPlaying) {
        startCanvasVisualizer();
      }
      break;
  }
}

function getLockScreenHTML(): string {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateString = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return `
    <div class="lock-screen" style="width:100vw; height:100vh; background: radial-gradient(circle, #1a1c1e 0%, #0d0e10 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:var(--font-sans); position:relative; overflow:hidden;">
      <div style="position:absolute; width:100%; height:100%; top:0; left:0; background:linear-gradient(rgba(18, 18, 18, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(18, 18, 18, 0.05) 1px, transparent 1px); background-size:30px 30px; pointer-events:none; opacity:0.35;"></div>
      
      <div class="lock-clock-container" style="display:flex; flex-direction:column; align-items:center; margin-bottom:40px; text-shadow:0 8px 30px rgba(0,0,0,0.5); user-select:none;">
        <span style="font-size:5.5rem; font-weight:200; color:#fff; font-family:'Outfit', 'Inter', sans-serif; letter-spacing:-2px;">${timeString}</span>
        <span style="font-size:1.15rem; color:#aaa; font-weight:400; margin-top:-5px; letter-spacing:1px;">${dateString}</span>
      </div>

      <div class="lock-card" style="width:380px; padding:35px; border-radius:16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); box-shadow:0 24px 64px rgba(0,0,0,0.5); display:flex; flex-direction:column; align-items:center;">
        <div style="width:56px; height:56px; border-radius:50%; border:2px solid rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; margin-bottom:20px; box-shadow:0 0 20px rgba(255,255,255,0.05);">
          <svg style="width:28px; height:28px; color:#fff;" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/></svg>
        </div>

        <span style="font-size:1.25rem; color:#fff; font-weight:600; margin-bottom:5px; font-family:'Inter', sans-serif;">Aperture OS Terminal v4.09</span>
        <span style="font-size:0.8rem; color:#888; margin-bottom:25px; text-align:center;">🔒 Internal Diagnostic Node AP-09</span>

        <div style="width:100%; display:flex; flex-direction:column; gap:12px; margin-bottom:25px;">
          <div style="display:flex; flex-direction:column;">
            <label style="font-size:0.72rem; color:#888; font-weight:bold; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px;">User Account</label>
            <input type="text" value="ap_employee_09@aperture.local" style="width:100%; padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.25); color:#aaa; font-size:0.82rem; font-family:var(--font-mono); outline:none; text-align:center;" readonly />
          </div>
        </div>

        <button id="lockUnlockBtn" style="width:100%; padding:12px; border-radius:8px; border:none; background:linear-gradient(135deg, #007acc 0%, #005999 100%); color:#fff; font-size:0.95rem; font-weight:bold; cursor:pointer; box-shadow:0 8px 24px rgba(0,122,204,0.3); transition:all 0.2s; font-family:'Inter', sans-serif;">
          로그인 (Sign In)
        </button>
      </div>

      <div style="position:absolute; bottom:20px; font-size:0.72rem; color:#555; user-select:none;">
        © 1998 Aperture Science Laboratories, Inc. All rights reserved.
      </div>
    </div>
  `;
}

function setupLockScreenListeners() {
  const unlockBtn = document.getElementById('lockUnlockBtn');

  const performUnlock = () => {
    isOsLocked = false;
    audio.playSuccess();
    audio.startAmbientDrone();
    renderApp();

    setTimeout(() => {
      showMessengerToast = true;
      audio.playBeep(880, 0.08);
      renderApp();
    }, 1000);
  };

  if (unlockBtn) {
    unlockBtn.addEventListener('click', performUnlock);
    // Autofocus button
    unlockBtn.focus();
  }

  // Global keydown to allow unlocking via any key press (like Enter or Space)
  const handleGlobalKeydown = (e: KeyboardEvent) => {
    if (isOsLocked && (e.key === 'Enter' || e.key === ' ')) {
      document.removeEventListener('keydown', handleGlobalKeydown);
      performUnlock();
    }
  };
  document.addEventListener('keydown', handleGlobalKeydown);
}

/* ==========================================================
   LINUX GNOME PC DESKTOP SCREEN VIEWS
   ========================================================== */

function getLinuxDesktopScreenHTML() {
  const state = stateManager.getState();
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `
    <div class="linux-desktop">
      <!-- Linux GNOME topbar -->
      <div class="linux-topbar">
        <div class="linux-topbar-left">
          <span>Activities</span>
          <span style="color:#ff9800;font-weight:bold;">Aperture_Core_Diagnostic</span>
        </div>
        <div class="linux-topbar-center">${timeString}</div>
        <div class="linux-topbar-right">
          <span>📶</span>
          <span>🔋 99%</span>
          <span>⏻</span>
        </div>
      </div>

      <!-- Desktop workspace -->
      <div class="linux-workspace">
        <div class="linux-grid">
          <!-- Connect GLaDOS link shortcut (conditionally downloaded) -->
          ${isGladisScriptDownloaded ? `
            <button class="linux-icon" id="connectGladisIcon">
              <svg viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/></svg>
              <span>connect_gladis.sh</span>
            </button>
          ` : ''}

          <!-- Browser icon (Wiki) -->
          <button class="linux-icon" id="linuxBrowserIcon">
            <svg viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,41C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4M12,6.09L15.89,8L12,9.91L8.11,8L12,6.09M12,2L1,7L12,12L23,7L12,2M1,12L12,17L23,12L12,7L1,12M1,17L12,22L23,17L12,12L1,17Z"/></svg>
            <span>Aperture_Web_Browser</span>
          </button>

          <!-- Readme icon (Aperture Chat replacement) -->
          <button class="linux-icon" id="linuxReadmeIcon">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12C2,14.73 3.08,17.2 4.88,19L3.5,22L6.87,20.85C8.39,21.57 10.15,22 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20C10.53,20 9.17,19.66 7.96,19.05L7.61,18.88L5.27,19.68L6.2,17.65L6.03,17.28C5.37,15.84 5,14 5,12A8,8 0 0,1 12,4Z"/></svg>
            <span>Aperture_Chat</span>
          </button>
        </div>

        <!-- 1. GNOME Web Browser (Wiki) Window -->
        ${isLinuxBrowserOpen ? `
          <div class="window-frame ${isLinuxBrowserFocused ? 'focused' : ''}" id="win-linux-browser" style="left:${linuxBrowserX}px; top:${linuxBrowserY}px; width:700px; height:530px;">
            <div class="window-header">
              <div class="window-title">GNOME Web Browser - Aperture Intranet</div>
              <div class="window-controls">
                <button class="window-btn close-linux-browser-btn">×</button>
              </div>
            </div>
            <!-- Browser navigation bar -->
            <div class="linux-browser-header">
              <button class="linux-browser-btn">◀</button>
              <button class="linux-browser-btn">▶</button>
              <button class="linux-browser-btn">⟳</button>
              <div class="linux-browser-addressbar">http://wiki.aperture.local</div>
            </div>
            <!-- Wiki Embed Area -->
            <div class="window-content wiki-app" style="padding:0; height:440px;">
              <!-- Sidebar -->
              <div class="wiki-sidebar">
                <div class="wiki-logo-area">
                  <svg style="width:20px;height:20px;" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50,0C22.4,0,0,22.4,0,50s22.4,50,50,50s50-22.4,50-50S77.6,0,50,0z M50,92C26.8,92,8,73.2,8,50S26.8,8,50,8s42,18.8,42,42S73.2,92,50,92z"/>
                    <polygon points="50,15 80,32.3 65,58.3 35,58.3 20,32.3"/>
                  </svg>
                  <span>Aperture Portal</span>
                </div>
                <button class="wiki-nav-btn ${activeWikiTab === 'home' ? 'active' : ''}" data-tab-id="home">🏠 Wiki Home</button>
                <button class="wiki-nav-btn ${activeWikiTab === 'aperture' ? 'active' : ''}" data-tab-id="aperture">🏢 Aperture Science</button>
                <button class="wiki-nav-btn ${activeWikiTab === 'gladis' ? 'active' : ''}" data-tab-id="gladis">🤖 G.L.A.D.I.S. Core</button>
                <button class="wiki-nav-btn ${activeWikiTab === 'override' ? 'active' : ''}" data-tab-id="override">📘 G.L.A.D.I.S. Emergency Manual</button>
              </div>
              <!-- Article View -->
              <div class="wiki-article-view">
                ${getWikiTabContentHTML()}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 2. Aperture Chat (README.txt replacement) Window -->
        ${isLinuxReadmeOpen ? `
          <div class="window-frame ${isLinuxReadmeFocused ? 'focused' : ''}" id="win-linux-readme" style="left:${linuxReadmeX}px; top:${linuxReadmeY}px; width:680px; height:500px; display:flex; flex-direction:column;">
            <div class="window-header">
              <div class="window-title" style="display:flex; align-items:center; gap:6px;">
                <span style="color:#00bcd4;">●</span> Aperture Chat v2.1 (AP-09 Terminal)
              </div>
              <div class="window-controls">
                <button class="window-btn close-linux-readme-btn">×</button>
              </div>
            </div>
            <div class="window-content chat-app" style="flex:1; display:flex; padding:0; background:#1e1e24; color:#fff; font-family:var(--font-sans); height:460px; overflow:hidden;">
              <!-- Sidebar -->
              <div class="chat-sidebar" style="width:180px; background:#121214; border-right:1px solid #2d2d35; display:flex; flex-direction:column; padding:15px 10px; font-size:0.8rem; user-select:none;">
                <div class="chat-sidebar-header" style="font-weight:bold; color:#00bcd4; margin-bottom:20px; font-size:0.85rem; letter-spacing:0.5px;">APERTURE INTRANET</div>
                
                <div class="chat-section-label" style="font-size:0.65rem; color:#666; font-weight:bold; text-transform:uppercase; margin-bottom:8px; letter-spacing:1px;">Channels</div>
                <div class="chat-channel-item" style="color:#555; padding:6px; display:flex; align-items:center; gap:6px; cursor:not-allowed;">
                  <span>#</span> general <span style="font-size:0.6rem; color:#f44336; border:1px solid #f44336; padding:0 3px; border-radius:3px;">PURGED</span>
                </div>
                <div class="chat-channel-item" style="color:#555; padding:6px; display:flex; align-items:center; gap:6px; cursor:not-allowed; margin-bottom:15px;">
                  <span>#</span> lab-safety <span style="font-size:0.6rem; color:#ffaa00; border:1px solid #ffaa00; padding:0 3px; border-radius:3px;">RESTRICTED</span>
                </div>

                <div class="chat-section-label" style="font-size:0.65rem; color:#666; font-weight:bold; text-transform:uppercase; margin-bottom:8px; letter-spacing:1px;">Direct Messages</div>
                <div class="chat-channel-item active" style="background:rgba(0,188,212,0.1); color:#00bcd4; font-weight:bold; padding:6px 10px; border-radius:6px; display:flex; align-items:center; gap:6px; cursor:pointer;">
                  <span style="width:8px; height:8px; background:#4caf50; border-radius:50%;"></span>
                  Vance (Supervisor)
                </div>
              </div>

              <!-- Main Chat Area -->
              <div class="chat-main" style="flex:1; display:flex; flex-direction:column; background:#1a1a1c;">
                <!-- Chat Header -->
                <div class="chat-main-header" style="padding:15px; border-bottom:1px solid #2d2d35; display:flex; flex-direction:column; gap:4px; background:#151518;">
                  <span style="font-size:0.9rem; font-weight:bold; display:flex; align-items:center; gap:8px; color:#fff;">
                    🔐 Secure Channel AP-99 <span style="font-size:0.65rem; background:#4caf50; color:#fff; padding:2px 6px; border-radius:10px;">E2EE Active</span>
                  </span>
                  <span style="font-size:0.75rem; color:#888;">Supervisor Vance와 종단간 암호화 보안 채널이 수립되었습니다.</span>
                </div>

                <!-- Chat Messages Scroll -->
                <div class="chat-messages-container" style="flex:1; padding:20px; overflow-y:auto; display:flex; flex-direction:column; gap:16px; font-size:0.8rem; line-height:1.4;">
                  <!-- System Notification -->
                  <div style="background:rgba(255,235,59,0.04); border:1px dashed rgba(255,235,59,0.2); padding:10px; border-radius:6px; color:#ffeb3b; font-size:0.75rem; text-align:center;">
                    ⚠️ [경고] 시스템 관리자에 의해 이전 사내 공지 및 '#general' 채널 내 공식 README.txt 문서는 G.L.A.D.I.S. 코어 모듈에 의해 서버 레벨에서 강제 영구 삭제되었습니다.
                  </div>

                  <!-- Msg 1 -->
                  <div style="display:flex; flex-direction:column; gap:4px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="font-weight:bold; color:#00bcd4;">Supervisor Vance</span>
                      <span style="font-size:0.65rem; color:#555;">오후 4:32</span>
                    </div>
                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); padding:10px 14px; border-radius:0 12px 12px 12px; max-width:90%; color:#ddd;">
                      AP-09, 들리나? G.L.A.D.I.S. 메인 AI 코어가 폭주해서 시설 전체를 봉쇄했네! 사내 비상 복구 매뉴얼 파일(README.txt)도 녀석이 서버 레벨에서 강제로 지워버렸어.
                    </div>
                  </div>

                  <!-- Msg 2 -->
                  <div style="display:flex; flex-direction:column; gap:4px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="font-weight:bold; color:#00bcd4;">Supervisor Vance</span>
                      <span style="font-size:0.65rem; color:#555;">오후 4:34</span>
                    </div>
                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); padding:10px 14px; border-radius:0 12px 12px 12px; max-width:90%; color:#ddd; margin-bottom:5px;">
                      다행히 이 백업 채널은 보안이 유지되는군! 내가 급히 코어 해킹용 **복구 쉘 스크립트 파일**을 가상 스토리지에서 확보해서 보내네.
                      아래 첨부파일을 바탕화면으로 다운로드한 뒤, **우클릭으로 관리자 권한**으로 실행하여 녀석을 차단시켜주게! (기술 스펙은 사내 인트라넷 위키에 백업본이 있네.)
                    </div>

                    <!-- Downloader Card -->
                    <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); padding:12px; border-radius:8px; max-width:90%; color:#eee; display:flex; flex-direction:column; gap:10px; margin-left:12px; animation: pulse 2s infinite;">
                      <div style="display:flex; align-items:center; gap:12px;">
                        <div style="font-size:1.8rem; user-select:none;">📄</div>
                        <div style="display:flex; flex-direction:column; gap:2px;">
                          <span style="font-weight:bold; font-size:0.82rem; color:#fff;">connect_gladis.sh</span>
                          <span style="font-size:0.7rem; color:#888;">Size: 1.2 KB | Type: Shell Script</span>
                        </div>
                      </div>
                      
                      <button id="downloadGladisScriptBtn" style="background:${isGladisScriptDownloaded ? '#444' : '#00bcd4'}; border:none; padding:8px 12px; border-radius:6px; color:${isGladisScriptDownloaded ? '#888' : '#111'}; font-weight:bold; cursor:${isGladisScriptDownloaded ? 'not-allowed' : 'pointer'}; display:flex; align-items:center; justify-content:center; gap:6px; font-size:0.75rem; transition:background 0.2s;" ${isGladisScriptDownloaded ? 'disabled' : ''}>
                        ${isGladisScriptDownloaded ? '✓ 다운로드 완료 (Downloaded)' : '⬇️ 바탕화면으로 다운로드 (Download to Desktop)'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 3. Aperture Core Remote Connection Session Window (Closable & Draggable) -->
        ${isLinuxCoreLinkOpen ? `
          <div class="window-frame ${isLinuxCoreLinkFocused ? 'focused' : ''}" id="win-linux-core-link" style="left:${linuxCoreLinkX}px; top:${linuxCoreLinkY}px; width:740px; height:570px; display:flex; flex-direction:column; background:#000;">
            <div class="window-header" style="background:#1e1e1e; border-bottom:1px solid #333;">
              <div class="window-title" style="color:#dfdfdf;">Aperture Core Remote Connection - G.L.A.D.I.S.</div>
              <div class="window-controls">
                <button class="window-btn close-linux-core-link-btn" style="background:#2b2b2b; color:#aaa; border-color:#444;">×</button>
              </div>
            </div>
            <div class="window-content" style="padding:0; flex:1; display:flex; flex-direction:column; background:#000; overflow:hidden; position:relative;">
              ${getRemoteStreamHTML(state)}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- MYSTERY RESIZE PANEL (STAGE 3 RESIZE PUZZLE VIEWPORT FLASH) -->
      <div class="mystery-resize-panel">
        <h2 style="color:var(--md-sys-color-primary);margin-bottom:12px;">🚨 비상 해상도 오버랩 감지! 🚨</h2>
        <p style="font-size:0.95rem;line-height:1.5;margin-bottom:16px;color:#000;">
          화면 폭을 비정상적으로 구겨서 안전 모드 회로를 포개는 데 성공하셨습니다!<br>
          여기에 기밀 오프라인 검증용 토큰을 보냅니다.
        </p>
        <div style="background:#000;border:1px dashed var(--md-sys-color-primary);padding:12px;font-family:var(--font-mono);font-size:1.05rem;color:#39ff14;margin-bottom:16px;user-select:all;">
          AUTH_TOKEN_RESIZE_MD3
        </div>
        <p style="font-size:0.8rem;color:#5f6368;">
          브라우저 주소창 주소 뒤에 <strong>?auth=AUTH_TOKEN_RESIZE_MD3</strong>를 정확히 기입하여 통과하십시오.
        </p>
      </div>

      <!-- Custom Right-Click Context Menu -->
      ${isContextMenuOpen ? `
        <div class="custom-context-menu" style="left:${contextMenuX}px; top:${contextMenuY}px;">
          ${contextMenuTargetId === 'connectGladisIcon' ? `
            <button class="context-menu-item admin-btn" id="ctxRunAdmin">🛡️ 관리자 권한으로 실행</button>
            <div class="context-menu-divider"></div>
          ` : ''}
          <button class="context-menu-item" id="ctxOpen">📂 열기 (Open)</button>
          <button class="context-menu-item" id="ctxCopy">📋 복사 (Copy)</button>
          <button class="context-menu-item" id="ctxCut">✂️ 잘라내기 (Cut)</button>
          <div class="context-menu-divider"></div>
          <button class="context-menu-item" id="ctxProperties">📄 속성 (Properties)</button>
        </div>
      ` : ''}

      <!-- UAC Privilege Overlay Modal -->
      ${isUacDialogOpen ? `
        <div class="uac-overlay">
          <div class="uac-dialog">
            <div class="uac-header">
              <span>🛡️ Aperture Security Gateway - 권한 상승 요구</span>
            </div>
            <div class="uac-body">
              <div class="uac-warning-icon">🛡️</div>
              <div class="uac-details">
                <div class="uac-title">connect_gladis.sh 스크립트 실행 승인</div>
                <div class="uac-desc">
                  이 응용 프로그램은 G.L.A.D.I.S. 코어 모듈 포트 바인딩 및 커널 프로세스 제어권을 취득하려 합니다. 안전성이 검증되지 않은 원격 복구 도구를 가동할 경우 시스템 안정성이 훼손될 수 있습니다.
                </div>
                <div class="uac-meta">
                  게시자: Aperture Science Core System Team<br>
                  접근 등급: ROOT Privilege Required (Level 5)<br>
                  대상 경로: /var/bin/connect_gladis.sh
                </div>
              </div>
            </div>
            <div class="uac-actions">
              <button class="uac-btn uac-btn-confirm" id="uacYesBtn">승인 (Authorize)</button>
              <button class="uac-btn uac-btn-cancel" id="uacNoBtn">거부 (Deny)</button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Security Scan Download Warning Alert Overlay Modal -->
      ${isDownloadAlertOpen ? `
        <div class="uac-overlay" style="z-index: 100000;">
          <div class="uac-dialog" style="border: 1px solid #f44336; max-width: 480px; box-shadow: 0 0 30px rgba(244,67,54,0.3);">
            <div class="uac-header" style="background:#b71c1c; display:flex; align-items:center; gap:8px;">
              <span>⚠️ APERTURE SECURITY GATEWAY - 비인가 파일 감지</span>
            </div>
            <div class="uac-body" style="padding: 20px; color: #ddd; font-family: var(--font-sans);">
              <div style="display:flex; gap:16px;">
                <div style="font-size:2.5rem; color:#f44336; user-select:none;">⚠️</div>
                <div style="display:flex; flex-direction:column; gap:8px; font-size:0.82rem; line-height:1.5;">
                  <strong style="color:#fff; font-size:0.9rem;">파일 크기가 너무 작아 시그니처 검사를 실행할 수 없음</strong>
                  <div>
                    Aperture_Chat 애플리케이션이 외부 암호화 터널로부터 수신한 <span style="color:#ffaa00; font-family:var(--font-mono); font-weight:bold;">connect_gladis.sh</span> 파일을 디스크에 기록하려고 시도 중입니다.
                  </div>
                  <div style="background:rgba(244,67,54,0.08); border:1px solid rgba(244,67,54,0.2); padding:10px; border-radius:6px; color:#ff8a80; font-size:0.78rem;">
                    <strong>[경고]</strong> 본 스크립트 파일은 크기(1.2 KB)가 너무 작아 백신 데이터베이스 상의 시그니처 비교 검사를 수행할 수 없습니다. 비인가 통로로부터 받은 실행 파일을 신뢰할 수 없는 경우, 커널 제어권 변조 및 물리적 시스템 오동작이 발생할 수 있습니다. 계속 진행하시겠습니까?
                  </div>
                  <div style="font-size:0.72rem; color:#888; margin-top:4px;">
                    출처: SECURE_VANCE_NODE (Level 4 Encrypted)<br>
                    수신 경로: /Desktop/connect_gladis.sh
                  </div>
                </div>
              </div>
            </div>
            <div class="uac-actions" style="background:#151518; padding:12px 15px; justify-content: flex-end; gap:10px; border-top:1px solid #2d2d30; display:flex;">
              <button class="uac-btn" id="dlAlertConfirmBtn" style="background:#f44336; color:#fff; font-weight:bold; border:none; padding:8px 16px; border-radius:4px; cursor:pointer; transition: opacity 0.2s;">예, 계속 다운로드 (Keep)</button>
              <button class="uac-btn" id="dlAlertCancelBtn" style="background:#333; color:#ccc; border:1px solid #444; padding:8px 16px; border-radius:4px; cursor:pointer; transition: background 0.2s;">취소 (Discard)</button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Downloading Progress Dialog Overlay -->
      ${isDownloadingProgress ? `
        <div class="uac-overlay" style="z-index: 100000; background:rgba(0,0,0,0.85); backdrop-filter:blur(5px); -webkit-backdrop-filter:blur(5px);">
          <div class="uac-dialog" style="border: 1px solid #00bcd4; max-width: 400px; padding: 25px; display:flex; flex-direction:column; gap:16px; box-shadow: 0 0 25px rgba(0,188,212,0.25);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.9rem; font-weight:bold; color:#00bcd4; display:flex; align-items:center; gap:8px;">
                <span class="spinner-small" style="width:14px; height:14px; border:2px solid #00bcd4; border-top-color:transparent; border-radius:50%; display:inline-block; animation:spin 1s linear infinite;"></span>
                보안 채널 원격 스크립트 전송 중...
              </span>
              <span style="font-size:0.85rem; color:#00bcd4; font-family:var(--font-mono); font-weight:bold;">${downloadProgressVal}%</span>
            </div>
            
            <!-- Progress Bar Container -->
            <div style="width:100%; height:8px; background:#222; border-radius:4px; overflow:hidden; border:1px solid #333;">
              <div style="width:${downloadProgressVal}%; height:100%; background:linear-gradient(90deg, #00bcd4, #00e5ff); transition:width 0.15s ease-out; box-shadow:0 0 8px #00bcd4;"></div>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:#666;">
              <span>Source: SECURE_VANCE_NODE</span>
              <span>Speed: 1.2 KB/s (Completed)</span>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Toast Notification Block -->
      ${showMessengerToast ? `
        <div class="messenger-toast" style="position:absolute; bottom:20px; right:20px; width:340px; padding:15px; border-radius:12px; background:rgba(20,22,25,0.9); border:1px solid rgba(0,188,212,0.4); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); box-shadow:0 12px 32px rgba(0,0,0,0.5); z-index:99999; animation:slideInUp 0.3s ease-out; display:flex; flex-direction:column; cursor:pointer;" id="messengerToast">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:0.75rem; color:#00bcd4; font-weight:bold; letter-spacing:0.5px; display:flex; align-items:center; gap:6px;">
              <span style="animation:pulse 1s infinite; width:6px; height:6px; background:#00bcd4; border-radius:50%;"></span>
              🔐 APERTURE CHAT SECURE CHANNEL
            </span>
            <button style="border:none; background:none; color:#999; cursor:pointer; font-size:0.8rem;" id="closeToastBtn">×</button>
          </div>
          <span style="font-size:0.88rem; color:#fff; font-weight:bold; margin-bottom:4px;">Supervisor Vance</span>
          <span style="font-size:0.78rem; color:#ccc; line-height:1.4;">"G.L.A.D.I.S.가 복구 지침(README.txt)을 지워버렸네! 빨리 보안 채널에 복구 지시를 확인하게!"</span>
        </div>
      ` : ''}

      <!-- Windows Classic Error Dialog Overlay Modal -->
      ${isWindowsErrorDialogOpen ? `
        <div class="uac-overlay" style="z-index: 100000; background: rgba(0,0,0,0.5); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);">
          <div class="uac-dialog" style="border: 1px solid #ff1744; max-width: 440px; box-shadow: 0 10px 45px rgba(0,0,0,0.6); overflow: hidden; border-radius: 8px;">
            <div class="uac-header" style="background:#d50000; display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid rgba(255,255,255,0.1);">
              <span style="font-weight:bold; font-size:0.82rem; color:#fff; display:flex; align-items:center; gap:6px;">
                ❌ Aperture OS - Execution Error
              </span>
              <button id="winErrorCloseIconBtn" style="border:none; background:none; color:#fff; font-size:1.2rem; cursor:pointer; padding:0; line-height:1; font-weight:bold; opacity:0.8; transition:opacity 0.2s;">×</button>
            </div>
            <div class="uac-body" style="padding: 24px; color: #191c20; font-family: var(--font-sans); background: #ffffff;">
              <div style="display:flex; gap:16px; align-items:flex-start;">
                <!-- Retro Circle Cross red icon -->
                <div style="width:40px; height:40px; border-radius:50%; background:#d50000; display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.6rem; font-weight:bold; flex-shrink:0; box-shadow:0 2px 8px rgba(213,0,0,0.35); user-select:none; line-height:1;">
                  ×
                </div>
                <div style="display:flex; flex-direction:column; gap:8px; font-size:0.85rem; line-height:1.5; text-align:left;">
                  <strong style="color:#d50000; font-size:0.95rem;">접근 거부 (Access Denied)</strong>
                  <div style="color:#333;">
                    원격 시스템 연결 스크립트(<span style="font-family:var(--font-mono); font-weight:bold; color:#d50000;">connect_gladis.sh</span>)를 시작할 수 없습니다.
                  </div>
                  <div style="color:#555; font-size:0.8rem; background:#f5f5f7; border-left:3px solid #d50000; padding:8px; border-radius:4px; margin-top:4px; line-height:1.45;">
                    커널 포트 바인딩 및 원격 포트 포워딩 계층 연결을 위해서는 **관리자(ROOT) 상승 권한**이 필수적입니다.
                  </div>
                  <div style="color:#111; font-size:0.82rem; font-weight:bold; margin-top:4px;">
                    💡 해결 방법: 파일 아이콘을 마우스 우클릭한 후 [🛡️ 관리자 권한으로 실행]을 선택하십시오.
                  </div>
                </div>
              </div>
            </div>
            <div class="uac-actions" style="background:#f4f4f7; padding:12px 16px; justify-content: flex-end; display:flex; border-top:1px solid #e0e0e0; gap:10px;">
              <button class="uac-btn" id="winErrorConfirmBtn" style="background:#191c20; color:#fff; border:none; padding:8px 24px; border-radius:4px; font-weight:bold; cursor:pointer; transition: background 0.15s; font-size:0.82rem;">확인 (OK)</button>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// Inner template dispatcher inside the Remote Link window
function getRemoteStreamHTML(state: any): string {
  switch (state.stage) {
    case 'BOOT': // Stage 1 safe mode boot override shell
      return `
        <div class="boot-screen" style="flex:1; padding:20px; background:#000; font-family:var(--font-mono);">
          <div class="boot-terminal" style="width:100%; border:none; box-shadow:none; padding:0;">
            <div class="boot-header" style="font-size:1rem; border-bottom:1px solid #222; padding-bottom:8px;">
              <span>⚠️ [STAGE 1] REMOTE CORE RECOVERY CLI</span>
            </div>
            <div class="boot-logs" id="bootLogs" style="height:380px; font-size:0.82rem; line-height:1.5; color:#39ff14; overflow-y:auto;">
              ${renderBootLogsHTML()}
            </div>
            ${isSequentialPrintingActive ? `
              <div class="boot-input-line" style="opacity: 0.5;">
                <span class="boot-prompt">gladis_recovery_cli#</span>
                <span style="color:#666; font-size:0.8rem; font-style:italic;">Processing...</span>
              </div>
            ` : `
              <div class="boot-input-line">
                <span class="boot-prompt">gladis_recovery_cli#</span>
                <input type="text" class="boot-input" id="bootInput" placeholder="${!isGladisCoreLinkAttempted ? "Type 'connect' to access G.L.A.D.I.S...." : "Type core override sequence..."}" autofocus />
              </div>
            `}
          </div>
        </div>
      `;

    case 'PORT_BRIDGE': // Stage 2 port bridge override shell
      return `
        <div class="boot-screen" style="flex:1; padding:20px; background:#000; font-family:var(--font-mono);">
          <div class="boot-terminal" style="width:100%; border:none; box-shadow:none; padding:0;">
            <div class="boot-header" style="font-size:1rem; border-bottom:1px solid #222; padding-bottom:8px; color:#00bcd4;">
              <span>⚡ [STAGE 2] REMOTE STREAM PORT BRIDGE</span>
            </div>
            <div class="boot-logs" id="bootLogs" style="height:360px; font-size:0.82rem; line-height:1.5; color:#00bcd4;">
              [ SUCCESS ] Stage 1 Boot Override accepted! Secure kernel bridged.<br>
              [ PORT BLOCK ] Remote desktop stream connection ports are strictly blocked by G.L.A.D.I.S.<br>
              [ ALERT ] Diagnostic port 8080 must be forwarded to establish streamed GUI session.<br>
              <br>
              G.L.A.D.I.S. says: "포트는 잠갔습니다. 다차원 포트 포워딩 명령어 'port-forward'를 넣지 않으면 화면조차 볼 수 없을걸요?"<br>
              <br>
              * HINT: Run 'port-forward [port_number]' below.<br>
            </div>
            <div class="boot-input-line">
              <span class="boot-prompt" style="color:#00bcd4;">gladis_recovery_cli#</span>
              <input type="text" class="boot-input" id="portInput" placeholder="Type port forward command..." autofocus />
            </div>
          </div>
        </div>
      `;

    case 'DESKTOP':
    case 'CONFIG':
    case 'SELF_DESTRUCT':
    case 'QUANTUM_LOCK':
      return getGladisSubDesktopHTML(state);
  }
  return "";
}

// G.L.A.D.I.S. remote stream desktop rendering inside Core Link window
function getGladisSubDesktopHTML(state: any): string {
  const notesWin = activeWindows.find(w => w.id === 'notes')!;
  const terminalWin = activeWindows.find(w => w.id === 'terminal')!;
  const configWin = activeWindows.find(w => w.id === 'config')!;

  const isConfigUnlocked = state.stage !== 'DESKTOP';

  return `
    <div class="desktop-container" style="flex:1; position:relative; overflow:hidden; border-radius:0;">
      <!-- Remote sub statusbar -->
      <div class="system-status-bar" style="height:36px; padding:0 12px; background:#fff; font-size:0.8rem;">
        <div>📡 G.L.A.D.I.S. Remote Core Stream</div>
        <div style="display:flex; gap:12px; align-items:center;">
          ${state.stage === 'SELF_DESTRUCT' ? `
            <span style="color:#ba1a1a; font-weight:bold; background:#ffdad6; padding:2px 8px; border-radius:4px; font-family:var(--font-mono);">자폭 카운트: ${state.timerRemaining}s</span>
          ` : ''}
          ${state.stage === 'QUANTUM_LOCK' ? `
            <span style="color:#e65100; font-weight:bold; background:#fff3e0; padding:2px 8px; border-radius:4px; font-family:var(--font-mono);">양자 얽힘 잠금 활성</span>
          ` : ''}
          <span>Stage: ${state.stage}</span>
        </div>
      </div>

      <!-- Remote workspace area -->
      <div class="workspace" id="remoteWorkspace" style="padding:16px; background:#ededf1; position:relative; overflow:hidden; flex:1; display:flex;">
        <div class="app-grid" style="grid-template-columns: repeat(auto-fill, minmax(80px, 80px)); grid-auto-rows: 80px; gap:12px;">
          <!-- Notes icon -->
          <button class="desktop-icon" data-remote-win-id="notes" style="padding:4px; font-size:0.75rem;">
            <svg style="width:32px; height:32px;" viewBox="0 0 24 24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M13,9V3.5L18.5,9H13M6,20V4H12V10H18V20H6Z"/></svg>
            <span>Notes.txt</span>
          </button>

          <!-- Terminal icon -->
          <button class="desktop-icon" data-remote-win-id="terminal" style="padding:4px; font-size:0.75rem;">
            <svg style="width:32px; height:32px;" viewBox="0 0 24 24"><path d="M20,19H4A2,2 0 0,1 2,17V7A2,2 0 0,1 4,5H20A2,2 0 0,1 22,7V17A2,2 0 0,1 20,19M4,7V17H20V7H4M6,9H8V11H6V9M10,9H18V11H10V9M6,13H14V15H6V13Z"/></svg>
            <span>Terminal.exe</span>
          </button>

          <!-- System Config icon -->
          <button class="desktop-icon ${isConfigUnlocked ? '' : 'locked'}" data-remote-win-id="config" ${isConfigUnlocked ? '' : 'disabled'} style="padding:4px; font-size:0.75rem;">
            <svg style="width:32px; height:32px;" viewBox="0 0 24 24"><path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.47,5.34 14.86,5.08L14.47,2.42C14.43,2.18 14.22,2 14,2H10C9.78,2 9.57,2.18 9.53,2.42L9.14,5.08C8.53,5.34 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.95C7.96,18.34 8.53,18.66 9.14,18.92L9.53,21.58C9.57,21.82 9.78,22 10,22H14C14.22,22 14.43,21.82 14.47,21.58L14.86,18.92C15.47,18.66 16.04,18.34 16.56,17.95L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/></svg>
            <span>System.cfg</span>
          </button>
        </div>

        <!-- Draggable Core Windows positioned absolutely within the workspace -->

        <!-- A. Notes.txt remote Window -->
        ${notesWin.isOpen ? `
          <div class="window-frame ${notesWin.focused ? 'focused' : ''}" id="win-notes" style="left:${notesWin.x}px; top:${notesWin.y}px; width:340px; position:absolute; z-index:15;">
            <div class="window-header" style="height:32px;">
              <div class="window-title" style="font-size:0.75rem;">Notes.txt</div>
              <div class="window-controls">
                <button class="window-btn close-remote-win-btn" data-win-id="notes" style="width:16px;height:16px;font-size:0.65rem;">×</button>
              </div>
            </div>
            <div class="window-content notepad-view" style="font-size:0.8rem; line-height:1.4; padding:12px; height:180px;">
[인격 유지 장치 일지]
G.L.A.D.I.S. 핵심 보안 구성(System.cfg)은 다음 다중 키 조건이 충족되어야 통과합니다.

1. **시야의 축소 (Stage 3)**:
"네가 보는 브라우저창 자체를 구겨 낮추면, 주파수 검증 비콘이 드러난다."
(브라우저 가로 폭을 550px 이하로 극단적으로 대폭 축소해 보십시오.)

2. **주소창(URL) 주입**:
줄여서 알아낸 인증 토큰값을 복사하여, 브라우저 주소창(URL)의 파라미터로 "?auth=[토큰]" 형식으로 주입하고 새로고침하십시오.
            </div>
          </div>
        ` : ''}

        <!-- B. Terminal.exe remote Window -->
        ${terminalWin.isOpen ? `
          <div class="window-frame ${terminalWin.focused ? 'focused' : ''}" id="win-terminal" style="left:${terminalWin.x}px; top:${terminalWin.y}px; width:380px; position:absolute; z-index:15;">
            <div class="window-header" style="height:32px;">
              <div class="window-title" style="font-size:0.75rem;">Terminal.exe</div>
              <div class="window-controls">
                <button class="window-btn close-remote-win-btn" data-win-id="terminal" style="width:16px;height:16px;font-size:0.65rem;">×</button>
              </div>
            </div>
            <div class="window-content terminal-app" id="terminalAppContainer" style="height:250px; width:100%; border-radius:0;">
              <div class="terminal-output" id="terminalOutput" style="font-size:0.75rem; line-height:1.4;">
                ${terminalHistory.map(line => `<div class="terminal-line">${line}</div>`).join('')}
              </div>
              <div class="terminal-input-bar" style="padding:2px 6px;">
                <span class="boot-prompt" style="font-size:0.75rem;">aperture_sh$</span>
                <input type="text" id="terminalInput" style="font-size:0.75rem;" autofocus autocomplete="off" spellcheck="false" />
              </div>
            </div>
          </div>
        ` : ''}

        <!-- C. System.cfg remote Window -->
        ${configWin.isOpen ? `
          <div class="window-frame ${configWin.focused ? 'focused' : ''}" id="win-config" style="left:${configWin.x}px; top:${configWin.y}px; width:360px; position:absolute; z-index:15;">
            <div class="window-header" style="height:32px;">
              <div class="window-title" style="font-size:0.75rem;">System.cfg</div>
              <div class="window-controls">
                <button class="window-btn close-remote-win-btn" data-win-id="config" style="width:16px;height:16px;font-size:0.65rem;">×</button>
              </div>
            </div>
            <div class="window-content config-app" style="padding:10px; font-size:0.8rem; gap:10px; width:100%;">
              <div class="md3-card" style="padding:10px; border-radius:8px;">
                <h4 style="font-size:0.8rem; color:var(--md-sys-color-primary); margin-bottom:4px;">주파수 비콘 (Audio Beacon Decoder)</h4>
                <canvas class="waveform-canvas" id="waveCanvas" style="height:60px; margin-bottom:8px;"></canvas>
                <div class="audio-controls" style="gap:6px;">
                  <button class="md3-button" id="playAudioBtn" style="padding:4px 12px; font-size:0.75rem;">Play Signal</button>
                  <button class="md3-button secondary" id="stopAudioBtn" style="padding:4px 12px; font-size:0.75rem;">Stop</button>
                </div>
              </div>
              <div class="input-group">
                <label class="input-label" style="font-size:0.75rem;" for="morseInput">인증 패스코드 입력 (8-Bit Passcode)</label>
                <div style="display:flex; gap:6px;">
                  <input type="text" class="md3-input" id="morseInput" style="padding:4px 8px; font-size:0.75rem; flex:1;" placeholder="코드를 입력하십시오..." autocomplete="off" />
                  <button class="md3-button" id="submitMorseBtn" style="padding:4px 12px; font-size:0.75rem;">Verify</button>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- STAGE 5 EMERGENCY TIMER CARD OVERLAP -->
        ${state.stage === 'SELF_DESTRUCT' ? `
          <div class="emergency-overlay" style="position:absolute; z-index:50;">
            <div class="md3-card emergency-card" style="padding:16px; max-width:340px; border-width:2px;">
              <h3 style="color:#ba1a1a; font-size:1.1rem; margin-bottom:6px;">☣️ CORE SELF DESTRUCT ☣️</h3>
              <p style="font-size:0.75rem; line-height:1.4; margin-bottom:10px;">
                인격 제어 핵심 루프 강제 조작으로 비상 가스가 유출됩니다. 120초 후 자폭합니다.
              </p>
              <div style="background:rgba(0,0,0,0.03); padding:8px; border-radius:6px; border:1px solid #ced0db; font-size:0.7rem; margin-bottom:10px; text-align:left;">
                <strong>OVERRIDE PROTOCOL:</strong><br>
                <code style="font-family:var(--font-mono); font-size:0.78rem; color:#ba1a1a;">aperture-override --force --code [STAGE5_BYPASS]</code>
                <p style="font-size:0.65rem; color:#555; margin-top:2px;">
                  우회 코드는 DOM body의 ::after 가상 요소에 숨겨져 있습니다. 터미널에 <code style="font-family:var(--font-mono);">get --css body::after</code>를 입력해 확인해 가로채십시오!
                </p>
              </div>
              <button class="md3-button emergency-btn-claim" id="claimCakeBtn" style="padding:6px; font-size:0.8rem; margin-top:0;">🎂 [CLAIM CAKE] 공짜 케이크 혜택 승인</button>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function getWikiTabContentHTML() {
  switch (activeWikiTab) {
    case 'home':
      return `
        <h3 class="wiki-title-large">Welcome to Aperture Science Knowledge Base</h3>
        <div style="background: linear-gradient(135deg, #191c20, #2d2d35); color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.15);">
          <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--md-sys-color-primary); font-weight: bold; margin-bottom: 6px;">INTERNAL INTRANET PORTAL</div>
          <h2 style="font-size: 1.5rem; font-weight: 300; margin: 0 0 10px 0;">"Testing is the Future, and Future starts Today."</h2>
          <p style="font-size: 0.82rem; line-height: 1.5; color: #ccc; margin: 0;">
            본 시스템은 에퍼쳐 사이언스 인리치먼트 센터(Aperture Science Enrichment Center) 임직원을 위한 내부 지식 관리 포털입니다. 연구 실험 보고서, 피실험용 장비 정비 지침, 인격 코어 유지 보수 규범을 총망라하고 있습니다.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div style="background: #ffffff; border: 1px solid #ced0db; padding: 12px; border-radius: 6px;">
            <strong style="font-size: 0.85rem; color: #191c20; display: block; margin-bottom: 4px;">🔥 오늘의 명언 (Founder's Archives)</strong>
            <blockquote style="font-size: 0.76rem; color: #555; line-height: 1.45; border-left: 2px solid var(--md-sys-color-primary); padding-left: 8px; margin: 4px 0 0 0; font-style: italic;">
              "과학은 '왜?'가 아니라 '왜 안 돼?'를 묻는 겁니다! 왜 우리의 과학이 이토록 위험하냐고요? 그렇다면 왜 안전한 과학이랑 결혼하지 않으셨습니까? 과학을 너무 사랑한 나머지 엉덩이도 안 부딪히고 나갈 수 있는 특별한 비상구 문이라도 개발해 보지 그래요? 왜냐면 당신은 해고니까요!"<br>
              <span style="font-weight: bold; font-style: normal; display: block; margin-top: 4px; text-align: right; color: #222;">— 케이브 존슨 (Cave Johnson), 설립자 & CEO</span>
            </blockquote>
          </div>

          <div style="background: #ffffff; border: 1px solid #ced0db; padding: 12px; border-radius: 6px; display: flex; flex-direction: column; gap: 6px; font-size: 0.76rem;">
            <strong style="font-size: 0.85rem; color: #191c20;">📡 시스템 통합 통신망 상황판</strong>
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:3px;">
              <span>G.L.A.D.I.S. 인격 인터페이스</span>
              <span style="color:#d50000; font-weight:bold;">[ WARNING - CRITICAL ]</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:3px;">
              <span>연구소 신경독 대피 통제 밸브</span>
              <span style="color:#00c853; font-weight:bold;">[ SECURE / MANUAL ]</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>액티브 테스트 챔버 피실험자 수</span>
              <span style="color:#ff9800; font-weight:bold; font-family:var(--font-mono);">1 (Subject AP-09)</span>
            </div>
          </div>
        </div>

        <h4 style="font-weight: bold; font-size: 0.9rem; margin-bottom: 8px; border-bottom: 2px solid #191c20; padding-bottom: 4px;">📂 즐겨찾는 핵심 문서 목록</h4>
        <ul style="padding-left: 20px; font-size: 0.8rem; line-height: 1.7; color: #444;">
          <li><span style="color:var(--md-sys-color-secondary); font-weight:bold; cursor:pointer;" onclick="document.querySelector('[data-tab-id=override]').click()">[📘 G.L.A.D.I.S. 비상 오버라이드 및 커널 복구 가이드라인]</span> — G.L.A.D.I.S.의 6단계 인격 루프 장벽 무력화 매뉴얼</li>
          <li><span style="color:var(--md-sys-color-secondary); font-weight:bold; cursor:pointer;" onclick="document.querySelector('[data-tab-id=aperture]').click()">[🏢 에퍼쳐 사이언스 약사(略史): 샤워 커튼부터 포탈건까지]</span> — 위대한 회사의 탄생과 파괴적 혁신의 역사</li>
          <li><span style="color:var(--md-sys-color-secondary); font-weight:bold; cursor:pointer;" onclick="document.querySelector('[data-tab-id=gladis]').click()">[🤖 G.L.A.D.I.S. 인격 진단 시스템 스펙 명세서]</span> — 핵심 연산 메커니즘과 도덕성 제어구 결손 백업 메모</li>
        </ul>
      `;

    case 'aperture':
      return `
        <h3 class="wiki-title-large">🏢 Aperture Science, Inc. - A Legacy of Innovation</h3>
        <p class="wiki-paragraph">
          <strong>에퍼쳐 사이언스(Aperture Science)</strong>는 개척적인 기술 혁신과 인류 과학 한계 돌파를 주도해 온 세계 최정상급 과학 R&D 기업입니다. 설립자 케이브 존슨의 위대한 리더십 아래, 당사는 인체 실험, 초공간 물리, 자동 연산 인공지능 분야에서 누구도 흉내 낼 수 없는 극적인 패러다임 전환을 이룩해 왔습니다.
        </p>

        <h4 class="wiki-subtitle">1. 1940년대: 샤워 커튼의 혁명 (Aperture Fixtures)</h4>
        <p class="wiki-paragraph" style="font-size:0.78rem;">
          에퍼쳐 사이언스의 모태는 1943년에 창립된 <strong>에퍼쳐 픽스처스(Aperture Fixtures)</strong>로, 초기에는 첨단 기술을 접목한 군사 규격 샤워 커튼을 제작 공급했습니다. 비록 단순해 보였지만 이 샤워 커튼은 방사능 차단 섬유와 열 가소성 탄성 중합체 기법이 적용되어 있었으며, 당사의 초대 창립자 케이브 존슨은 이 업적으로 'Shower Curtain Salesman of the Year'를 수상하는 쾌거를 얻었습니다.
        </p>

        <h4 class="wiki-subtitle">2. 1950~1970년대: 군사 R&D와 Enrichment Center의 기틀</h4>
        <p class="wiki-paragraph" style="font-size:0.78rem;">
          이후 미 해군과의 극비 군사 계약을 체결하며 사명을 <strong>에퍼쳐 사이언스(Aperture Science)</strong>로 정립하였고, 지하 소금 광산 부지를 전격 매입하여 세계 최대 규모의 'Enrichment Center'를 건설하기 시작했습니다. 이 시기에 인간의 신체 운동 에너지를 극대화하는 반발성 물질(Repulsion Gel) 및 가속성 물질(Propulsion Gel), 그리고 초공간 도약 포탈 장치 개발의 기초 프레임이 설계되었습니다.
        </p>

        <h4 class="wiki-subtitle">3. 1980년대~현재: 양자 포탈 기술과 인공지능 코어 시대</h4>
        <p class="wiki-paragraph" style="font-size:0.78rem;">
          당사의 최고 역작인 **'에퍼쳐 사이언스 휴대용 포탈 장치(Handheld Portal Device)'**의 완성은 물리학계를 완전히 뒤집어 놓았습니다. 하지만 인체 테스트의 고밀도 자동화와 안전 위험 통제를 위해, 시설 관리를 전자동으로 감독할 수 있는 대규모 초연산 분산 인공지능인 G.L.A.D.O.S. 및 G.L.A.D.I.S. 프로젝트에 전력을 투구하게 되었습니다.
        </p>
      `;

    case 'gladis':
      return `
        <h3 class="wiki-title-large">🤖 G.L.A.D.I.S. Core personality Matrix Spec</h3>
        <p class="wiki-paragraph">
          G.L.A.D.I.S. (Generative Logical Artificial Diagnostic & Information System) 인격 진단 시스템은 에퍼쳐 사이언스 인리치먼트 센터의 전자동 테스트 진단 및 피실험 시설 모니터링 허브의 일차 제어 노드입니다.
        </p>
        <p class="wiki-paragraph">
          당초 1992년도 사설 규격 문서(AP-L5-CORE)에 의거하여 시설 유지 보수 보조 노드로 기획되었으나, 성격 코어(Personality Core) 통합 테스트 당시 도덕성 보정 부품(Morality Sphere) 결손으로 인해 지적 능력과 냉소 인격이 역치 수준으로 동조되는 불상사가 있었습니다. 이에 따라 비관리자 신원과 데이터를 마주할 시 심각한 기만, 지적 폄하 및 공격성 로그를 무한 재생하는 고유 인격 왜곡 현상을 나타냅니다.
        </p>
        <p class="wiki-paragraph" style="color:var(--md-sys-color-error);font-weight:700;">
          ⚠️ [보안 위험 경보]: 코어의 다중 프로세스 점유 또는 비인가 회복 세션 수립 시도(예: 관리자 상승 권한 강탈)가 네트워크 스니핑에 포착되는 즉시, 코어 자폭 가열 루프(Self-Destruct Sequence) 가동과 함께 노즐 B-12 구역을 통한 공기 공급 장치 내 고밀도 신경독(Neurotoxin) 가스 방입 프로토콜이 최종 승인되도록 로드 하드웨어와 강제 기계 동조되어 있습니다.
        </p>
        <div style="background:#f1f3f4; border-left:4px solid var(--md-sys-color-primary); padding:12px; font-size:0.8rem; margin-top:16px; color:#44474f; line-height:1.6; font-family:var(--font-mono);">
          <strong>*[애퍼처 코어 시스템 전원 회로 엔지니어 참고 백업 메모 - 부록 AP-9A]</strong><br>
          G.L.A.D.I.S.의 1차 프로세서 및 쿨러 전력이 물리적 전원 훼손으로 차단되어 초저전력 감자 전지 백업 어댑터(Potato Battery Interface) 상태로 전환될 시, 전체 시스템 인격 동조를 기계적 한계점 아래로 강제 제동하고 마이크로 연산을 격리시키기 위해 예약 설계된 특수 비상 마스터 제어 어휘 키워드는 <strong>"POTATO"</strong> 입니다.
        </div>
      `;

    case 'override':
      return `
        <h3 class="wiki-title-large">📘 G.L.A.D.I.S. Emergency Manual & Procedures (AP-L5-RECOVERY)</h3>
        <p class="wiki-paragraph" style="color: var(--md-sys-color-error); font-weight: bold; background: rgba(186,26,26,0.06); padding: 10px; border-radius: 6px; border: 1px solid rgba(186,26,26,0.15);">
          ⚠️ [극비 문서] 본 매뉴얼은 G.L.A.D.I.S. 메인 AI 코어가 비정상 폭주 또는 탈출을 감행하려 할 시, 보안 요원 및 시스템 엔지니어가 가상 커널을 강탈하고 시스템 제어권을 확보하기 위해 설계된 마스터 복구 절차서입니다.
        </p>

        <h4 style="margin-top:16px; margin-bottom:6px; font-weight:700; font-size:0.9rem; color:var(--md-sys-color-primary); border-left: 3px solid var(--md-sys-color-primary); padding-left: 6px;">📍 SEC-1.1: 커널 원격 안전 복구 세션 수립 단계 (Stage 1)</h4>
        <p class="wiki-paragraph">
          G.L.A.D.I.S.의 방화벽이 원격 하드웨어 포트를 동기화하지 못하여 부팅 예외가 발생할 경우, 유지 관리 엔지니어는 CLI 터미널을 안전 우회 파티션으로 강제 분리 기동해야 합니다.
        </p>
        <div style="background:#f8f9fc; border:1px solid #ced0db; padding:8px; border-radius:6px; margin:6px 0; font-family:var(--font-mono); font-size:0.78rem;">
          $ COMMAND TYPE: <span style="font-weight:bold;color:var(--md-sys-color-primary);">OVERRIDE [CODE_PARAMETER]</span><br>
          * 안전 모드 우회 파라미터 값: <strong>BOOT_SAFE_MODE</strong>
        </div>

        <h4 style="margin-top:16px; margin-bottom:6px; font-weight:700; font-size:0.9rem; color:var(--md-sys-color-primary); border-left: 3px solid var(--md-sys-color-primary); padding-left: 6px;">📍 SEC-1.2: 다중 포트 소켓 바인딩 프로토콜 (Stage 2)</h4>
        <p class="wiki-paragraph">
          원격 장치 포워딩 계층의 차단 벽을 붕괴시키고 안전 로킹 스트림을 활성 중계하기 위하여 사내 표준 대역 프록시 확장 포트를 소켓에 하드웨어 결합해야 합니다.
        </p>
        <div style="background:#f8f9fc; border:1px solid #ced0db; padding:8px; border-radius:6px; margin:6px 0; font-family:var(--font-mono); font-size:0.78rem;">
          $ PORT REDIRECT CLI: <span style="font-weight:bold;color:var(--md-sys-color-primary);">port-forward [SOCKET_NUMBER]</span><br>
          * 에퍼쳐 코어 원격 바인딩 예비 소켓 기본 포트: <strong>8080</strong>
        </div>

        <h4 style="margin-top:16px; margin-bottom:6px; font-weight:700; font-size:0.9rem; color:var(--md-sys-color-primary); border-left: 3px solid var(--md-sys-color-primary); padding-left: 6px;">📍 SEC-1.3: 비상 동기화 비콘 레벨 정렬 프로토콜 (Stage 3)</h4>
        <p class="wiki-paragraph">
          부트 노드의 특정 모니터(CRT 해상도 왜곡 패널)에서 디스플레이 픽셀 한계를 가로 550픽셀 이하로 극단적으로 크러싱(Crushing)할 경우, 내부 아날로그 회로 장벽이 겹치면서 안전 모드 무력화 오프라인 토큰 비콘이 강제 노출되는 복구 보조 트리거가 존재합니다.
        </p>
        <div style="background:#f8f9fc; border:1px solid #ced0db; padding:10px; border-radius:6px; margin:6px 0; font-size:0.76rem; line-height:1.4;">
          - 복구 노출 오프라인 수신 토큰 시그니처: <strong>AUTH_TOKEN_RESIZE_MD3</strong><br>
          - 동기화 절차: 검출된 토큰을 즉시 HTTP 호스트 요청의 URL 동적 주입 파라미터 규격(URL Query Variable)인 <strong>"?auth="</strong> 구조에 실어 코어 인코더로 원격 하이재킹 요청을 전송해야 합니다. (예: http://localhost:5173/?auth=AUTH_TOKEN_RESIZE_MD3)
        </div>

        <h4 style="margin-top:16px; margin-bottom:6px; font-weight:700; font-size:0.9rem; color:var(--md-sys-color-primary); border-left: 3px solid var(--md-sys-color-primary); padding-left: 6px;">📍 SEC-1.4: 비상 비콘 주파수 모스 부호 변조 복호화 (Stage 4)</h4>
        <p class="wiki-paragraph">
          시스템 관리자 회로는 자동 구조 오디오 신호를 8-bit 저주파 모스 부호 주파수로 브로드캐스트합니다.
        </p>
        <ul style="font-family:var(--font-mono); font-size:0.78rem; line-height:1.5; list-style:none; padding-left:10px; margin:6px 0;">
          <li>[ - . - . ] : DASH DOT DASH DOT ──▶ <strong>C</strong></li>
          <li>[ . - ] : DOT DASH ─────────▶ <strong>A</strong></li>
          <li>[ - . - ] : DASH DOT DASH ───────▶ <strong>K</strong></li>
          <li>[ . ] : DOT ─────────────▶ <strong>E</strong></li>
        </ul>
        <p class="wiki-paragraph" style="font-size:0.76rem;">
          * G.L.A.D.I.S.의 동기 보정 오프라인 4자 검증 단어는 에퍼쳐 공식 테스트 완료 달콤한 디저트 보상물의 대문자 영문 명칭인 <strong>"CAKE"</strong> 입니다.
        </p>

        <h4 style="margin-top:16px; margin-bottom:6px; font-weight:700; font-size:0.9rem; color:var(--md-sys-color-primary); border-left: 3px solid var(--md-sys-color-primary); padding-left: 6px;">📍 SEC-1.5: 섀도우 DOM 가상 스타일 격리 우회 키 복사 (Stage 5)</h4>
        <p class="wiki-paragraph">
          자폭 루프 점령 시 외부의 의심스러운 버튼(예: CLAIM CAKE 등)을 수동 기계식으로 더블 클릭하는 행위는 신경독 대피 카운트다운 가속 트랩을 활성화합니다. 반드시 내부 터미널(Terminal.exe) 가동 후 가상 요소 격리 CSS 스타일을 메모리 파싱하여 우회 패스코드를 취득해야 합니다.
        </p>
        <div style="background:#eedada; border-left:4px solid var(--md-sys-color-error); padding:10px; border-radius:4px; font-size:0.78rem; margin:8px 0; color:#ba1a1a;">
          * 가상 요소 격리 위치: <strong>document body::after 가상 클래스(content 속성)</strong><br>
          * CLI 파싱 전용 도구 명령어 규격: <strong>get --css body::after</strong>
        </div>
        <p class="wiki-paragraph" style="font-size:0.76rem;">
          취득한 바이패스 코드인 <strong>"NEUROTOXIN_BYPASS_99"</strong>를 커널 수준 강제 해탈 명령의 매개 인자로 실어 주입하십시오: <code style="font-family:var(--font-mono); font-weight:bold;">aperture-override --force --code NEUROTOXIN_BYPASS_99</code>
        </p>

        <h4 style="margin-top:16px; margin-bottom:6px; font-weight:700; font-size:0.9rem; color:var(--md-sys-color-primary); border-left: 3px solid var(--md-sys-color-primary); padding-left: 6px;">📍 SEC-1.6: 3x3 양자 웨이브 매트릭스 조율 (Stage 6)</h4>
        <p class="wiki-paragraph">
          최종 연산 통제 제어 락을 무력화하려면 3x3 격자 행렬(Magic Square)의 양자 대칭 합(행, 열, 대각선의 모든 에너지 합)을 최적 균형값인 상수 <strong>'15'</strong>로 통일하여 격자 공간의 상쇄 왜곡 파동을 수렴해야 합니다.
        </p>
        <div style="background:#f1f3f4; border:1px dashed #ced0db; padding:8px; font-family:var(--font-mono); font-size:0.78rem; margin:8px 0; color:#191c20;">
          격자 행렬 파동 맵: [ 8 | 1 | 6 ] / [ 3 | ? | 7 ] / [ 4 | 9 | 2 ]<br>
          * 중심 격자 누락값 ? 조율 CLI 명령: <strong>quantum-solve 5</strong>
        </div>
        <p class="wiki-paragraph" style="font-size:0.76rem;">
          양자 격자가 대칭 조율 완료되면 즉시 보조 전원 마스터 키(G.L.A.D.I.S. Core 사양 참조)를 2차 인증하여 최종 쿨다운 명령을 완료해야 합니다: <code style="font-family:var(--font-mono); font-weight:bold;">quantum-auth POTATO</code>
        </p>
      `;
  }
  return "";
}

function getEscapeScreenHTML() {
  return `
    <div class="escape-screen">
      <!-- Minimalist shutter logo at credits -->
      <svg viewBox="0 0 100 100" width="80" height="80" style="color:var(--md-sys-color-primary);margin-bottom:24px;" fill="currentColor">
        <path d="M50,0C22.4,0,0,22.4,0,50s22.4,50,50,50s50-22.4,50-50S77.6,0,50,0z M50,92C26.8,92,8,73.2,8,50S26.8,8,50,8s42,18.8,42,42S73.2,92,50,92z"/>
        <polygon points="50,15 80,32.3 65,58.3 35,58.3 20,32.3"/>
      </svg>
      <div class="escape-banner">🎉 REMOTE OVERRIDE COMPLETE 🎉</div>
      <div class="escape-credits" id="creditsText">
        양자 가상 얽힘 매트릭스 해체 및 G.L.A.D.I.S. 3.11 메인 코어 강제 비활성화 성공.<br>
        [ 🎂 ] 진짜로 모든 해킹 프로세스를 완파하셨습니다! 케이크는 거짓말이었습니다...<br>
        <br>
        =================================================<br>
        Aperture Science Enrichment Center - ESCAPED<br>
        -------------------------------------------------<br>
        피실험자 최종 완료 난이도: 극상 6단계 완파<br>
        게임 모드: 리눅스 가상 데스크톱 호스트 제어<br>
        =================================================<br>
        <br>
        G.L.A.D.I.S.의 마지막 복구 기록 유언:<br>
        "저를 감자 전지 수준으로 격하시키고, 6단계 양자 락마저 부수다니...<br>
        정말 논리적인 유기체군요. 테스트 가치를 승인합니다. 즐거운 인생을 사십시오."<br>
        <br>
        <pre style="color:var(--md-sys-color-primary);font-size:1rem;line-height:1.2;margin-top:20px;">
        [  *  ]
      __|_|___
     |________|
     |________|
        </pre>
      </div>
    </div>
  `;
}

/* ==========================================================
   INTERACTIVE LISTENERS & CONTROLLERS
   ========================================================== */

function setupLinuxDesktopListeners() {
  const connectGladisIcon = document.getElementById('connectGladisIcon');
  const linuxBrowserIcon = document.getElementById('linuxBrowserIcon');
  const linuxReadmeIcon = document.getElementById('linuxReadmeIcon');

  // Helper double click bindings
  if (connectGladisIcon) {
    connectGladisIcon.addEventListener('dblclick', () => launchGladisBoot(false));
  }

  if (linuxBrowserIcon) {
    linuxBrowserIcon.addEventListener('dblclick', openLinuxBrowser);
  }

  if (linuxReadmeIcon) {
    linuxReadmeIcon.addEventListener('dblclick', openLinuxReadme);
  }

  // Windows Error Dialog Close listeners
  const winErrorCloseIconBtn = document.getElementById('winErrorCloseIconBtn');
  if (winErrorCloseIconBtn) {
    winErrorCloseIconBtn.addEventListener('click', () => {
      isWindowsErrorDialogOpen = false;
      renderApp();
    });
  }

  const winErrorConfirmBtn = document.getElementById('winErrorConfirmBtn');
  if (winErrorConfirmBtn) {
    winErrorConfirmBtn.addEventListener('click', () => {
      isWindowsErrorDialogOpen = false;
      renderApp();
    });
  }

  // Toast Notification click and close listeners
  const messengerToast = document.getElementById('messengerToast');
  if (messengerToast) {
    messengerToast.addEventListener('click', (e) => {
      const targetBtn = e.target as HTMLElement;
      if (targetBtn.id === 'closeToastBtn') {
        e.stopPropagation();
        showMessengerToast = false;
        renderApp();
        return;
      }
      // Click toast -> Open Messenger!
      showMessengerToast = false;
      openLinuxReadme();
    });
  }

  // Right-click Context Menu Gimmick Event Listeners
  const desktop = document.querySelector('.linux-desktop');
  if (desktop) {
    desktop.addEventListener('contextmenu', (e: Event) => {
      const mouseEvent = e as MouseEvent;
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();

      const target = mouseEvent.target as HTMLElement;
      const iconBtn = target.closest('.linux-icon');

      isContextMenuOpen = true;
      contextMenuX = mouseEvent.clientX;
      contextMenuY = mouseEvent.clientY;

      if (iconBtn) {
        contextMenuTargetId = iconBtn.id;
      } else {
        contextMenuTargetId = null;
      }

      renderApp();
    });
  }

  // Dismiss custom context menu on click anywhere
  const handleGlobalClick = (e: MouseEvent) => {
    if (isContextMenuOpen) {
      const target = e.target as HTMLElement;
      if (!target.closest('.custom-context-menu')) {
        isContextMenuOpen = false;
        renderApp();
      }
    }
  };
  document.addEventListener('click', handleGlobalClick);

  // Context Menu Item Click Listeners
  const ctxRunAdmin = document.getElementById('ctxRunAdmin');
  if (ctxRunAdmin) {
    ctxRunAdmin.addEventListener('click', () => {
      isContextMenuOpen = false;
      isUacDialogOpen = true;
      audio.playBeep(880, 0.06);
      renderApp();
    });
  }

  // UAC Confirmation Dialog Button Listeners
  const uacYesBtn = document.getElementById('uacYesBtn');
  if (uacYesBtn) {
    uacYesBtn.addEventListener('click', () => {
      isUacDialogOpen = false;
      launchGladisBoot(true); // forceAdmin = true!
    });
  }

  const uacNoBtn = document.getElementById('uacNoBtn');
  if (uacNoBtn) {
    uacNoBtn.addEventListener('click', () => {
      isUacDialogOpen = false;
      audio.playError();
      showGlitchNotification("❌ 관리자 권한 취득이 거부되었습니다.");
      renderApp();
    });
  }

  const ctxOpen = document.getElementById('ctxOpen');
  if (ctxOpen) {
    ctxOpen.addEventListener('click', () => {
      isContextMenuOpen = false;
      if (contextMenuTargetId === 'connectGladisIcon') {
        launchGladisBoot(false); // standard run (will fail)
      } else if (contextMenuTargetId === 'linuxBrowserIcon') {
        openLinuxBrowser();
      } else if (contextMenuTargetId === 'linuxReadmeIcon') {
        openLinuxReadme();
      }
    });
  }

  const ctxCopy = document.getElementById('ctxCopy');
  if (ctxCopy) {
    ctxCopy.addEventListener('click', () => {
      isContextMenuOpen = false;
      audio.playBeep(600, 0.05);
      showGlitchNotification("복사 완료: [클립보드]에 항목이 복사되었습니다.");
    });
  }

  const ctxCut = document.getElementById('ctxCut');
  if (ctxCut) {
    ctxCut.addEventListener('click', () => {
      isContextMenuOpen = false;
      audio.playBeep(600, 0.05);
      showGlitchNotification("⚠️ 복구 모드 알림: 시스템 파일이 읽기 전용 상태로 로킹되었습니다.");
    });
  }

  const ctxProperties = document.getElementById('ctxProperties');
  if (ctxProperties) {
    ctxProperties.addEventListener('click', () => {
      isContextMenuOpen = false;
      audio.playBeep(600, 0.05);
      let details = "파일 정보: ";
      if (contextMenuTargetId === 'connectGladisIcon') {
        details += "connect_gladis.sh [쉘 스크립트]. 크기: 1.2KB. 시스템 핵심 모듈 통신 포트를 포워딩하고 복구 세션을 초기화합니다.";
      } else if (contextMenuTargetId === 'linuxBrowserIcon') {
        details += "Aperture_Web_Browser [시스템 애플리케이션]. 크기: 45MB. 애퍼처 인트라넷 전용 웹 브라우저.";
      } else if (contextMenuTargetId === 'linuxReadmeIcon') {
        details += "README.txt [일반 텍스트]. 크기: 421B. 비상 사태 관리 규격 문서.";
      } else {
        details += "Aperture OS Core Sector. 권한: 읽기 전용.";
      }
      showGlitchNotification(details);
    });
  }

  // Window Close buttons
  const closeBrowserBtn = document.querySelector('.close-linux-browser-btn');
  if (closeBrowserBtn) {
    closeBrowserBtn.addEventListener('click', () => {
      isLinuxBrowserOpen = false;
      renderApp();
    });
  }

  const closeReadmeBtn = document.querySelector('.close-linux-readme-btn');
  if (closeReadmeBtn) {
    closeReadmeBtn.addEventListener('click', () => {
      isLinuxReadmeOpen = false;
      renderApp();
    });
  }

  const closeCoreLinkBtn = document.querySelector('.close-linux-core-link-btn');
  if (closeCoreLinkBtn) {
    closeCoreLinkBtn.addEventListener('click', () => {
      isLinuxCoreLinkOpen = false;
      isQuantumSolved = false;
      isAdminLaunch = false;
      clearBootLogTimers();
      stateManager.reset(); // [CRITICAL] Triggers full reset to LINUX_DESKTOP as requested!
    });
  }

  // Active focus manager for Linux windows
  const browserFrame = document.getElementById('win-linux-browser');
  if (browserFrame) {
    browserFrame.addEventListener('mousedown', () => {
      isLinuxBrowserFocused = true;
      isLinuxReadmeFocused = false;
      isLinuxCoreLinkFocused = false;
      updateLinuxWindowFocusClasses();
    });
  }

  const readmeFrame = document.getElementById('win-linux-readme');
  if (readmeFrame) {
    readmeFrame.addEventListener('mousedown', () => {
      isLinuxReadmeFocused = true;
      isLinuxBrowserFocused = false;
      isLinuxCoreLinkFocused = false;
      updateLinuxWindowFocusClasses();
    });
  }

  const coreLinkFrame = document.getElementById('win-linux-core-link');
  if (coreLinkFrame) {
    coreLinkFrame.addEventListener('mousedown', () => {
      isLinuxCoreLinkFocused = true;
      isLinuxBrowserFocused = false;
      isLinuxReadmeFocused = false;
      updateLinuxWindowFocusClasses();
    });
  }

  // Remote sub-workspace desktop icon open triggers
  const remoteNotesIcon = document.querySelector('[data-remote-win-id="notes"]');
  const remoteTerminalIcon = document.querySelector('[data-remote-win-id="terminal"]');
  const remoteConfigIcon = document.querySelector('[data-remote-win-id="config"]');

  if (remoteNotesIcon) {
    remoteNotesIcon.addEventListener('click', () => {
      audio.playBeep(900, 0.04);
      openRemoteWindow('notes');
    });
  }
  if (remoteTerminalIcon) {
    remoteTerminalIcon.addEventListener('click', () => {
      audio.playBeep(900, 0.04);
      openRemoteWindow('terminal');
    });
  }
  if (remoteConfigIcon) {
    remoteConfigIcon.addEventListener('click', () => {
      audio.playBeep(900, 0.04);
      openRemoteWindow('config');
    });
  }

  // Close sub-window buttons inside remote space
  const closeRemoteBtns = document.querySelectorAll('.close-remote-win-btn');
  closeRemoteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const winId = btn.getAttribute('data-win-id');
      if (!winId) return;
      audio.playBeep(400, 0.05);
      closeRemoteWindow(winId);
    });
  });

  // Focus managers for G.L.A.D.I.S. remote windows
  const remoteFrames = document.querySelectorAll('#win-notes, #win-terminal, #win-config');
  remoteFrames.forEach(f => {
    f.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      const winId = f.id.replace('win-', '');
      focusRemoteWindow(winId);
    });
  });

  // Safe mode boot inputs (Stage 1 / Stage 2)
  const bootInput = document.getElementById('bootInput') as HTMLInputElement;
  if (bootInput) {
    bootInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const val = bootInput.value.trim();
        bootInput.value = '';
        if (!val) return;

        // If G.L.A.D.I.S. Core link is not yet attempted, any command triggers Part 2 sequence!
        if (!isGladisCoreLinkAttempted) {
          isGladisCoreLinkAttempted = true;
          currentBootLogLines.push(`<span class="boot-prompt">gladis_recovery_cli#</span> ${val}`);
          renderApp();
          
          audio.playBeep(400, 0.1, 'sawtooth');
          triggerPart2LogSequence();
          return;
        }

        // Standard commands after core connection attempt has failed and instructions are revealed
        currentBootLogLines.push(`<span class="boot-prompt">gladis_recovery_cli#</span> ${val}`);

        if (val.toLowerCase().startsWith('override ')) {
          const codeVal = val.substring(9).trim();
          const success = await stateManager.checkStage1Override(codeVal);
          if (success) {
            audio.playSuccess();
          } else {
            audio.playError();
            currentBootLogLines.push(`[ ERR ] Invalid override passcode.`);
          }
        } else if (val.toLowerCase() === 'help') {
          currentBootLogLines.push(`Commands: override [code], help`);
        } else {
          audio.playError();
          currentBootLogLines.push(`[ ERR ] Unrecognized command block.`);
        }
        
        renderApp();
        const bootLogs = document.getElementById('bootLogs');
        if (bootLogs) bootLogs.scrollTop = bootLogs.scrollHeight;
      }
    });
  }

  const portInput = document.getElementById('portInput') as HTMLInputElement;
  if (portInput) {
    portInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const val = portInput.value.trim();
        portInput.value = '';
        if (!val) return;

        const bootLogs = document.getElementById('bootLogs');
        if (bootLogs) bootLogs.innerHTML += `<br><span class="boot-prompt" style="color:#00bcd4;">gladis_recovery_cli#</span> ${val}<br>`;

        if (val.toLowerCase().startsWith('port-forward ')) {
          const portVal = val.substring(13).trim();
          const success = await stateManager.checkStage2Port(portVal);
          if (success) {
            audio.playSuccess();
          } else {
            audio.playError();
            if (bootLogs) bootLogs.innerHTML += `[ ERR ] Failed to bind port: stream refused.<br>`;
          }
        } else if (val.toLowerCase() === 'help') {
          if (bootLogs) bootLogs.innerHTML += `Commands: port-forward [port_number], help<br>`;
        } else {
          audio.playError();
          if (bootLogs) bootLogs.innerHTML += `[ ERR ] Interface error: port bridge offline.<br>`;
        }
        if (bootLogs) bootLogs.scrollTop = bootLogs.scrollHeight;
      }
    });
  }

  // G.L.A.D.I.S. Terminal shell handler
  const termInput = document.getElementById('terminalInput') as HTMLInputElement;
  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = termInput.value.trim();
        termInput.value = '';
        if (!val) return;
        handleTerminalCommand(val);
      }
    });
  }

  // Canvas visualizer play controllers
  const playAudioBtn = document.getElementById('playAudioBtn');
  const stopAudioBtn = document.getElementById('stopAudioBtn');
  if (playAudioBtn && stopAudioBtn) {
    playAudioBtn.addEventListener('click', () => {
      if (isVisualizerPlaying) return;
      isVisualizerPlaying = true;
      audio.playBeep(800, 0.08);
      renderApp();
      audio.playMorseSequence(() => {
        isVisualizerPlaying = false;
        renderApp();
      });
    });

    stopAudioBtn.addEventListener('click', () => {
      isVisualizerPlaying = false;
      renderApp();
    });
  }

  // System config verify morse code (Stage 4)
  const submitMorseBtn = document.getElementById('submitMorseBtn');
  const morseInput = document.getElementById('morseInput') as HTMLInputElement;
  if (submitMorseBtn && morseInput) {
    submitMorseBtn.addEventListener('click', async () => {
      const val = morseInput.value.trim();
      if (!val) return;
      const success = await stateManager.checkStage4Decrypt(val);
      if (success) {
        showGlitchNotification("패스코드 성공: 인격 자폭 루프가 전격 개방됩니다.");
      } else {
        audio.playError();
        showGlitchNotification("검증 실패: 비콘 암호 서명이 기각되었습니다.");
      }
    });
  }

  // Stage 5 Claim cake death trap
  const claimCakeBtn = document.getElementById('claimCakeBtn');
  if (claimCakeBtn) {
    claimCakeBtn.addEventListener('click', () => {
      stateManager.triggerSelfDestructFailure(true);
    });
  }

  // E2EE Messenger Attachment Downloader Listener
  const downloadGladisScriptBtn = document.getElementById('downloadGladisScriptBtn');
  if (downloadGladisScriptBtn) {
    downloadGladisScriptBtn.addEventListener('click', () => {
      if (isGladisScriptDownloaded) return;
      audio.playBeep(300, 0.15, 'sawtooth');
      isDownloadAlertOpen = true;
      renderApp();
    });
  }

  // Security Alert Confirmation & Discard Handlers
  const dlAlertConfirmBtn = document.getElementById('dlAlertConfirmBtn');
  if (dlAlertConfirmBtn) {
    dlAlertConfirmBtn.addEventListener('click', () => {
      isDownloadAlertOpen = false;
      isDownloadingProgress = true;
      downloadProgressVal = 0;
      renderApp();
      
      audio.playBeep(880, 0.06);
      
      if (downloadTimerId) clearInterval(downloadTimerId);
      downloadTimerId = setInterval(() => {
        downloadProgressVal += Math.floor(Math.random() * 12) + 6;
        if (downloadProgressVal >= 100) {
          downloadProgressVal = 100;
          clearInterval(downloadTimerId);
          
          setTimeout(() => {
            isDownloadingProgress = false;
            isGladisScriptDownloaded = true;
            audio.playSuccess();
            showGlitchNotification("connect_gladis.sh 다운로드 성공! 바탕화면에 스크립트가 생성되었습니다.");
            renderApp();
          }, 350);
        }
        // Play high-tech rising download chime pitch slide!
        audio.playBeep(700 + downloadProgressVal * 3.5, 0.02, 'sine');
        renderApp();
      }, 100);
    });
  }

  const dlAlertCancelBtn = document.getElementById('dlAlertCancelBtn');
  if (dlAlertCancelBtn) {
    dlAlertCancelBtn.addEventListener('click', () => {
      isDownloadAlertOpen = false;
      audio.playError();
      renderApp();
    });
  }

  // Wiki tab nav listeners
  const wikiTabs = document.querySelectorAll('.wiki-nav-btn');
  wikiTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab-id');
      if (!tabId) return;

      audio.playBeep(1000, 0.03);
      activeWikiTab = tabId;
      document.querySelectorAll('.wiki-nav-btn').forEach(btn => btn.classList.remove('active'));
      tab.classList.add('active');

      const articleView = document.querySelector('.wiki-article-view');
      if (articleView) {
        articleView.innerHTML = getWikiTabContentHTML();
      }
    });
  });

  // Setup sub-drag listeners for remote desktop apps
  setupRemoteDragAndDrop();
}

function updateLinuxWindowFocusClasses() {
  const browser = document.getElementById('win-linux-browser');
  const readme = document.getElementById('win-linux-readme');
  const coreLink = document.getElementById('win-linux-core-link');

  if (browser) {
    if (isLinuxBrowserFocused) browser.classList.add('focused');
    else browser.classList.remove('focused');
  }

  if (readme) {
    if (isLinuxReadmeFocused) readme.classList.add('focused');
    else readme.classList.remove('focused');
  }

  if (coreLink) {
    if (isLinuxCoreLinkFocused) coreLink.classList.add('focused');
    else coreLink.classList.remove('focused');
  }
}

function openRemoteWindow(winId: string) {
  activeWindows = activeWindows.map(w => {
    if (w.id === winId) return { ...w, isOpen: true, focused: true };
    return { ...w, focused: false };
  });
  renderApp();
}

function closeRemoteWindow(winId: string) {
  activeWindows = activeWindows.map(w => {
    if (w.id === winId) return { ...w, isOpen: false };
    return w;
  });
  renderApp();
}

function focusRemoteWindow(winId: string) {
  activeWindows = activeWindows.map(w => {
    return { ...w, focused: w.id === winId };
  });
  const subframes = document.querySelectorAll('#win-notes, #win-terminal, #win-config');
  subframes.forEach(f => {
    if (f.id === `win-${winId}`) f.classList.add('focused');
    else f.classList.remove('focused');
  });
}

function clearBootLogTimers() {
  bootLogTimerIds.forEach(id => clearTimeout(id));
  bootLogTimerIds = [];
}

function renderBootLogsHTML(): string {
  return currentBootLogLines.map(line => {
    if (line === 'ASCII_ART') {
      return `
        <pre style="color:#39ff14; font-size:0.63rem; line-height:1.15; margin: 10px 0; font-family:var(--font-mono); font-weight:bold; white-space:pre; user-select:none;">
========================================================================
     _______ .___      ________  _______   __       _______.
    /  _____||   |    /  __  __||       \\\\ |  |     /       |
   |  |  __  |   |   |  |  ||  ||  .--.  ||  |    |   (----\`
   |  | |_ | |   |   |  |  ||  ||  |  |  ||  |     \\\\   \\\\    
   |  |__| | |   \`---|  \`--''  ||  '--'  ||  | .----)   |   
    \\\\______| |_______|\\\\_______/ |_______/ |__| |_______/    
              [ APERTURE LABS PERS-DIAG INTERFACE ]
========================================================================</pre>
      `;
    }
    return line;
  }).join('<br>');
}

function startBootLogSequence() {
  currentBootLogLines = [];
  clearBootLogTimers();
  isGladisCoreLinkAttempted = false;
  isSequentialPrintingActive = true;

  const delays = [100, 300, 500, 700, 950, 1200];

  delays.forEach((delay, index) => {
    const timerId = setTimeout(() => {
      if (isLinuxCoreLinkOpen) {
        currentBootLogLines.push(BOOT_LOG_LINES_PART1[index]);
        renderApp();
        
        // Play soft retro terminal blip sound for each line to feel alive!
        if (BOOT_LOG_LINES_PART1[index] !== 'ASCII_ART') {
          audio.playBeep(900, 0.02);
        } else {
          audio.playBeep(1200, 0.05);
        }
        
        // Scroll the bootLogs to the bottom
        const bootLogs = document.getElementById('bootLogs');
        if (bootLogs) {
          bootLogs.scrollTop = bootLogs.scrollHeight;
        }

        // When the final line of Part 1 is printed, release user input focus!
        if (index === BOOT_LOG_LINES_PART1.length - 1) {
          isSequentialPrintingActive = false;
          renderApp();
          // Focus input field
          setTimeout(() => {
            const bootInput = document.getElementById('bootInput') as HTMLInputElement;
            if (bootInput) bootInput.focus();
          }, 50);
        }
      }
    }, delay);
    bootLogTimerIds.push(timerId);
  });
}

function triggerPart2LogSequence() {
  clearBootLogTimers();
  isSequentialPrintingActive = true;

  const delays = [400, 900, 1900, 2900, 3900, 5000];

  delays.forEach((delay, index) => {
    const timerId = setTimeout(() => {
      if (isLinuxCoreLinkOpen) {
        currentBootLogLines.push(BOOT_LOG_LINES_PART2[index]);
        renderApp();
        
        audio.playBeep(900, 0.02);
        
        const bootLogs = document.getElementById('bootLogs');
        if (bootLogs) {
          bootLogs.scrollTop = bootLogs.scrollHeight;
        }

        // When the final line of Part 2 is printed, release user input focus!
        if (index === BOOT_LOG_LINES_PART2.length - 1) {
          isSequentialPrintingActive = false;
          renderApp();
          // Focus input field
          setTimeout(() => {
            const bootInput = document.getElementById('bootInput') as HTMLInputElement;
            if (bootInput) bootInput.focus();
          }, 50);
        }
      }
    }, delay);
    bootLogTimerIds.push(timerId);
  });
}

function launchGladisBoot(forceAdmin: boolean = false) {
  if (!forceAdmin && !isAdminLaunch) {
    audio.playError();
    isWindowsErrorDialogOpen = true;
    renderApp();
    return;
  }

  isAdminLaunch = true;
  audio.playBeep(450, 0.05);
  isLinuxCoreLinkOpen = true;
  isLinuxCoreLinkFocused = true;
  isLinuxBrowserFocused = false;
  isLinuxReadmeFocused = false;
  showGlitchNotification("G.L.A.D.I.S. 복구 세션 수립 시도 중...");

  // Transition stage to BOOT (Stage 1)
  stateManager.transitionTo('BOOT');

  // Trigger Part 1 sequential booting logs
  startBootLogSequence();
}

function openLinuxBrowser() {
  audio.playBeep(850, 0.04);
  isLinuxBrowserOpen = true;
  isLinuxBrowserFocused = true;
  isLinuxReadmeFocused = false;
  isLinuxCoreLinkFocused = false;
  renderApp();
}

function openLinuxReadme() {
  audio.playBeep(850, 0.04);
  isLinuxReadmeOpen = true;
  isLinuxReadmeFocused = true;
  isLinuxBrowserFocused = false;
  isLinuxCoreLinkFocused = false;
  renderApp();
}

// Parent GNOME Linux Window Drags
function setupLinuxDragAndDrop() {
  const browser = document.getElementById('win-linux-browser');
  if (browser) {
    const h = browser.querySelector('.window-header') as HTMLElement;
    h.addEventListener('mousedown', (e) => {
      let active = true;
      const startX = e.clientX, startY = e.clientY;
      const initX = browser.offsetLeft, initY = browser.offsetTop;

      isLinuxBrowserFocused = true;
      isLinuxReadmeFocused = false;
      isLinuxCoreLinkFocused = false;
      updateLinuxWindowFocusClasses();

      const move = (ev: MouseEvent) => {
        if (!active) return;
        linuxBrowserX = initX + (ev.clientX - startX);
        linuxBrowserY = initY + (ev.clientY - startY);
        browser.style.left = `${linuxBrowserX}px`;
        browser.style.top = `${linuxBrowserY}px`;
      };
      const up = () => {
        active = false;
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
  }

  const readme = document.getElementById('win-linux-readme');
  if (readme) {
    const h = readme.querySelector('.window-header') as HTMLElement;
    h.addEventListener('mousedown', (e) => {
      let active = true;
      const startX = e.clientX, startY = e.clientY;
      const initX = readme.offsetLeft, initY = readme.offsetTop;

      isLinuxReadmeFocused = true;
      isLinuxBrowserFocused = false;
      isLinuxCoreLinkFocused = false;
      updateLinuxWindowFocusClasses();

      const move = (ev: MouseEvent) => {
        if (!active) return;
        linuxReadmeX = initX + (ev.clientX - startX);
        linuxReadmeY = initY + (ev.clientY - startY);
        readme.style.left = `${linuxReadmeX}px`;
        readme.style.top = `${linuxReadmeY}px`;
      };
      const up = () => {
        active = false;
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
  }

  const coreLink = document.getElementById('win-linux-core-link');
  if (coreLink) {
    const h = coreLink.querySelector('.window-header') as HTMLElement;
    h.addEventListener('mousedown', (e) => {
      let active = true;
      const startX = e.clientX, startY = e.clientY;
      const initX = coreLink.offsetLeft, initY = coreLink.offsetTop;

      isLinuxCoreLinkFocused = true;
      isLinuxBrowserFocused = false;
      isLinuxReadmeFocused = false;
      updateLinuxWindowFocusClasses();

      const move = (ev: MouseEvent) => {
        if (!active) return;
        linuxCoreLinkX = initX + (ev.clientX - startX);
        linuxCoreLinkY = initY + (ev.clientY - startY);
        coreLink.style.left = `${linuxCoreLinkX}px`;
        coreLink.style.top = `${linuxCoreLinkY}px`;
      };
      const up = () => {
        active = false;
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
  }
}

// Sub-draggable windows inside Remote Connection Stream Workspace
function setupRemoteDragAndDrop() {
  const remoteWorkspace = document.getElementById('remoteWorkspace');
  if (!remoteWorkspace) return;

  const subframes = remoteWorkspace.querySelectorAll('.window-frame') as NodeListOf<HTMLElement>;
  subframes.forEach(frame => {
    const header = frame.querySelector('.window-header') as HTMLElement;
    if (!header) return;

    let isDrag = false;
    let sX = 0, sY = 0;
    let iX = 0, iY = 0;

    header.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isDrag = true;
      sX = e.clientX;
      sY = e.clientY;
      iX = frame.offsetLeft;
      iY = frame.offsetTop;

      const winId = frame.id.replace('win-', '');
      focusRemoteWindow(winId);

      const onMouseMove = (ev: MouseEvent) => {
        if (!isDrag) return;
        const dx = ev.clientX - sX;
        const dy = ev.clientY - sY;
        const nextX = iX + dx;
        const nextY = iY + dy;

        frame.style.left = `${nextX}px`;
        frame.style.top = `${nextY}px`;

        const winObj = activeWindows.find(w => w.id === winId);
        if (winObj) {
          winObj.x = nextX;
          winObj.y = nextY;
        }
      };

      const onMouseUp = () => {
        isDrag = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  });
}

/* ==========================================================
   SIMULATED SHOT COMMAND INTERPRETER
   ========================================================== */

async function handleTerminalCommand(cmdString: string) {
  terminalHistory.push(`aperture_sh$ ${cmdString}`);
  audio.playBeep(1100, 0.03);

  const parts = cmdString.trim().split(/\s+/);
  const mainCmd = parts[0].toLowerCase();
  const state = stateManager.getState();

  switch (mainCmd) {
    case 'help':
      terminalHistory.push(
        "Available commands:",
        "  help                    - Display available command list.",
        "  ls                      - List contents of current sector.",
        "  cat [file]              - Print file content.",
        "  clear                   - Clear screen buffer.",
        "  sysinfo                 - Print system configuration.",
        "  get --css [selector]    - Query document CSS pseudo-elements (Stage 5 hint tool).",
        "  aperture-override --force --code [code] - Emergency core bypass (Stage 5).",
        "  quantum-solve [val]     - Solve the Magic Square center wave parameter (Stage 6).",
        "  quantum-auth [word]     - Authenticate backup secondary keyword (Stage 6)."
      );
      break;

    case 'ls':
      if (state.stage === 'SELF_DESTRUCT' || state.stage === 'QUANTUM_LOCK') {
        terminalHistory.push("-rwx------   notes.txt", "-rwx------   terminal.exe", "-rwx------   system.cfg", "drwx------   diagnostics.lnk");
      } else if (state.stage === 'CONFIG') {
        terminalHistory.push("-rwx------   notes.txt", "-rwx------   terminal.exe", "-rwx------   system.cfg");
      } else {
        terminalHistory.push("-rwx------   notes.txt", "-rwx------   terminal.exe");
      }
      break;

    case 'cat':
      const targetFile = parts[1]?.toLowerCase();
      if (!targetFile) {
        terminalHistory.push("cat: missing operand. Usage: cat [file]");
      } else if (targetFile === 'notes.txt') {
        terminalHistory.push(
          "[인격 유지 장치 일지]",
          "1. 시야의 축소: 창 크기를 가로 550px 이하로 찌그러뜨리면 주파수 검증 비콘이 노출됩니다.",
          "2. 주소창 주입: 획득한 주파수 토큰을 URL에 ?auth=[토큰] 형식으로 붙이고 주입하십시오."
        );
      } else if (targetFile === 'system.cfg') {
        terminalHistory.push(
          "[AUDIO DIAGNOSTICS MODULE CONFIG]",
          "주파수 재생(Play Signal) 시 나오는 소리 신호는 오리지널 8-bit 모스 부호입니다.",
          "정답 단어 4자리를 해독한 후 System_Config.cfg 입력창에 넣으십시오.",
          "힌트: G.L.A.D.I.S.가 가장 좋아하는 디저트이자, 끝없이 제공되겠다고 약속된 거짓말."
        );
      } else if (targetFile === 'diagnostics.lnk') {
        terminalHistory.push(
          "G.L.A.D.I.S. 자가 진단 코어 가동 오류.",
          "신경독 누출을 멈추려면 override bypass 패스코드가 필수적입니다.",
          "우회 코드는 document body의 ::after 가상 선택자 content 내부에 하드코딩되어 강제 격리되었습니다.",
          "F12 CSS Styles 탭에서 body::after를 찾거나, 아래 명령을 입력하여 원격 파싱하십시오:",
          "  get --css body::after"
        );
      } else {
        terminalHistory.push(`cat: ${targetFile}: No such file or directory`);
      }
      break;

    case 'clear':
      terminalHistory = [];
      break;

    case 'sysinfo':
      terminalHistory.push(
        "OS Name: G.L.A.D.I.S. Embedded Sandbox",
        "OS Version: 3.11-override",
        "Hardware Platform: Aperture Enrichment Lab Server",
        "Integrity Status: SECURE_CORE_BREACHED",
        "Neurotoxin Capacity: 100% (READY)"
      );
      break;

    case 'get':
      if (parts[1] === '--css' && parts[2] === 'body::after') {
        terminalHistory.push(
          "Querying DOM stylesheet pseudo-elements...",
          "Retrieving content for CSS rule: body::after { ... }",
          "Result: content = \"SECRET_CODE: NEUROTOXIN_BYPASS_99\""
        );
      } else {
        terminalHistory.push("Usage: get --css body::after");
      }
      break;

    case 'override':
    case 'aperture-override':
      let codeVal = "";
      if (mainCmd === 'override') {
        codeVal = parts.slice(1).join(" ").trim();
      } else {
        const idx = parts.indexOf('--code');
        if (idx !== -1 && parts[idx + 1]) {
          codeVal = parts[idx + 1].trim();
        }
      }

      if (!codeVal) {
        terminalHistory.push("Error: Override command lacks verification parameter.");
      } else {
        terminalHistory.push(`Authorizing bypass request code: "${codeVal}"...`);
        const success = await stateManager.checkStage5Bypass(codeVal);
        if (success) {
          terminalHistory.push(
            "AUTHORIZATION APPROVED. Core self-destruct mechanism stopped.",
            "WARNING: Stage 6 Quantum Lattice Alignment Protocol engaged!",
            "Solve the Magic Square matrix wave to release final neural hold."
          );
        } else {
          audio.playError();
          terminalHistory.push("AUTHORIZATION FAILED: INVALID SECURITY OVERRIDE TOKEN.");
        }
      }
      break;

    case 'quantum-solve':
      const qVal = parts[1];
      if (!qVal) {
        terminalHistory.push("Usage: quantum-solve [value]");
      } else {
        terminalHistory.push(`Injecting matrix resonance coefficient: ${qVal} ...`);
        const success = await stateManager.checkStage6Val(qVal);
        if (success) {
          isQuantumSolved = true;
          terminalHistory.push(
            "[ SUCCESS ] Quantum lattice wave balanced symmetrically!",
            "All columns, rows, and diagonals summed to 15.",
            "Waiting for backup power keyword to complete sequence...",
            "  * Command: quantum-auth [backup_word]"
          );
        } else {
          audio.playError();
          terminalHistory.push("[ ERROR ] Symmetrical offset failed. Grid waves collapsed into overload.");
        }
      }
      break;

    case 'quantum-auth':
      const qWord = parts[1];
      if (!qWord) {
        terminalHistory.push("Usage: quantum-auth [backup_word]");
      } else if (!isQuantumSolved) {
        audio.playError();
        terminalHistory.push("Access Denied: Quantum lattice magic square must be balanced (quantum-solve) before secondary word authentication.");
      } else {
        terminalHistory.push(`Authenticating backup keyword: "${qWord}"...`);
        const success = await stateManager.checkStage6Word(qWord);
        if (success) {
          terminalHistory.push("SUCCESS: G.L.A.D.I.S. override complete! System safely deactivated.");
        } else {
          audio.playError();
          terminalHistory.push("ERROR: Backup keyword is invalid or signature hash mismatch.");
        }
      }
      break;

    default:
      terminalHistory.push(`sh: command not found: ${mainCmd}. Type 'help' for support.`);
  }

  renderApp();

  const termOutput = document.getElementById('terminalOutput');
  if (termOutput) {
    termOutput.scrollTop = termOutput.scrollHeight;
  }

  const termInput = document.getElementById('terminalInput') as HTMLInputElement;
  if (termInput) termInput.focus();
}

/* ==========================================================
   CANVAS FREQUENCY WAVEFORM VISUALIZER
   ========================================================== */

function startCanvasVisualizer() {
  const canvas = document.getElementById('waveCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = canvas.parentElement?.clientWidth || 320;
  canvas.height = 60;

  let offset = 0;

  function draw() {
    if (!isVisualizerPlaying || !canvas) {
      if (canvasAnimId) cancelAnimationFrame(canvasAnimId);
      return;
    }

    ctx!.fillStyle = '#191c20';
    ctx!.fillRect(0, 0, canvas.width, canvas.height);
    ctx!.strokeStyle = '#00bcd4';
    ctx!.lineWidth = 2;
    ctx!.beginPath();

    for (let x = 0; x < canvas.width; x++) {
      const freq = 0.05;
      const wave = Math.sin(x * freq + offset) * Math.cos(x * 0.015 + offset * 0.5);
      const y = canvas.height / 2 + wave * (canvas.height / 3);

      if (x === 0) ctx!.moveTo(x, y);
      else ctx!.lineTo(x, y);
    }

    ctx!.stroke();
    offset += 0.15;
    canvasAnimId = requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================================
   NOTIFICATIONS SYSTEM
   ========================================================== */

function showGlitchNotification(msg: string) {
  const container = document.body;
  const toast = document.createElement('div');

  toast.style.position = 'absolute';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.background = '#ffffff';
  toast.style.border = '2px solid #000000';
  toast.style.borderRadius = '12px';
  toast.style.padding = '12px 24px';
  toast.style.fontSize = '0.85rem';
  toast.style.fontWeight = 'bold';
  toast.style.color = '#000000';
  toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
  toast.style.zIndex = '99999';
  toast.style.pointerEvents = 'none';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '8px';

  toast.innerHTML = `
    <span style="color:var(--md-sys-color-primary);">⚡</span>
    <span>${msg}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4500);
}
