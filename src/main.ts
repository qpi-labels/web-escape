import './style.css';
import { stateManager, setGladisSpeakCallback } from './core/state';
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
  { id: 'schematic', title: 'battery_schematic.jpg', isOpen: false, x: 50, y: 80, focused: false },
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
let showDecoyEasterEgg = false;

document.addEventListener('DOMContentLoaded', () => {
  renderApp();
  initSecurityAndAntiCheat();
  stateManager.subscribe(renderApp);

  setGladisSpeakCallback((msg) => {
    showGlitchNotification(msg);
  });

  onDevToolsChange((isOpen) => {
    if (isOpen) {
      stateManager.triggerDevToolsAlert();
    }
  });

  setGladisMockingCallback((msg) => {
    showGlitchNotification(msg);
  });

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

function renderApp() {
  const appDiv = document.getElementById('app');
  if (!appDiv) return;

  const state = stateManager.getState();

  if (state.isFailed) {
    appDiv.className = "";
    appDiv.innerHTML = getFailScreenHTML();
    setupFailScreenListeners();
    audio.stopAmbientDrone();
    return;
  }

  if (showDecoyEasterEgg) {
    appDiv.className = "";
    appDiv.innerHTML = getDecoyEasterEggHTML() + getLinuxDesktopScreenHTML();
    setupDecoyEasterEggListeners();
    setupLinuxDesktopListeners();
    setupLinuxDragAndDrop();
    if (isVisualizerPlaying) {
      startCanvasVisualizer();
    }
    return;
  }

  if (isOsLocked) {
    appDiv.innerHTML = getLockScreenHTML();
    setupLockScreenListeners();
    return;
  }

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
              <input type="text" id="wikiAddressInput" class="linux-browser-addressbar" style="background:#fff; color:#333; border:1px solid #cbd5e1; border-radius:4px; padding:2px 8px; flex-grow:1; font-family:var(--font-mono); font-size:0.72rem; outline:none;" value="${activeWikiTab === 'morse_ledger' ? 'http://wiki.aperture.local?tab=morse_ledger' : 'http://wiki.aperture.local'}" />
            </div>
            <!-- Bookmarks Bar -->
            <div class="linux-browser-bookmarks" style="display:flex; gap:12px; padding:4px 14px; background:#f1f5f9; border-bottom:1px solid #cbd5e1; align-items:center; font-size:0.7rem; font-family:var(--font-sans);">
              <span style="color:#64748b; font-weight:bold; display:flex; align-items:center; gap:2px;">⭐ 즐겨찾기:</span>
              <button class="bookmark-btn" id="bookmarkWikiHome" style="border:none; background:none; color:#1a73e8; cursor:pointer; font-weight:bold; font-size:0.7rem; display:flex; align-items:center; gap:2px; padding:0;">🏠 Aperture Wiki</button>
              <button class="bookmark-btn" id="bookmarkMorseLedger" style="border:none; background:none; color:#1a73e8; cursor:pointer; font-weight:bold; font-size:0.7rem; display:flex; align-items:center; gap:2px; padding:0;">📡 Morse Code Ledger</button>
            </div>
            <!-- Wiki Search Header Bar -->
            <div class="wiki-header-bar" style="display:flex; justify-content:space-between; align-items:center; padding:6px 14px; background:#f1f5f9; border-bottom:1px solid #cbd5e1; height:38px;">
              <span style="font-size:0.72rem; color:#475569; font-family:var(--font-mono); font-weight:bold;">🔬 APERTURE SCIENCE INTERNAL WIKI</span>
              <div style="display:flex; gap:6px; align-items:center;">
                <input type="text" id="wikiSearchInput" placeholder="위키 검색 (예: override, 포탈...)" style="padding:3px 8px; font-size:0.72rem; border:1px solid #cbd5e1; border-radius:4px; width:170px; background:#fff; color:#000;" />
                <button id="wikiSearchBtn" style="background:#475569; color:#fff; border:none; padding:3px 10px; border-radius:4px; font-size:0.72rem; cursor:pointer; font-weight:bold;">검색</button>
              </div>
            </div>
            <!-- Wiki Embed Area -->
            <div class="window-content wiki-app" style="padding:0; height:402px;">
              <!-- Sidebar -->
              <div class="wiki-sidebar" style="width:220px; background:#f1f5f9; border-right:1px solid #cbd5e1; display:flex; flex-direction:column; padding:12px 0; overflow-y:auto;">
                <div class="wiki-logo-area" style="padding:0 12px 12px 12px; border-bottom:1px solid #cbd5e1; margin-bottom:8px; font-weight:700; font-size:0.8rem; text-transform:uppercase; color:#0f172a; display:flex; align-items:center; gap:6px;">
                  <svg style="width:16px;height:16px;color:#0f172a;" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50,0C22.4,0,0,22.4,0,50s22.4,50,50,50s50-22.4,50-50S77.6,0,50,0z M50,92C26.8,92,8,73.2,8,50S26.8,8,50,8s42,18.8,42,42S73.2,92,50,92z"/>
                    <polygon points="50,15 80,32.3 65,58.3 35,58.3 20,32.3"/>
                  </svg>
                  <span>Aperture Wiki</span>
                </div>
                
                <button class="wiki-nav-btn ${activeWikiTab === 'home' ? 'active' : ''}" data-tab-id="home" style="padding:6px 12px; font-size:0.75rem;">🏠 위키 홈 (Home)</button>
                
                <div style="font-size:0.62rem; color:#475569; font-weight:bold; padding:8px 12px 2px 12px; text-transform:uppercase; letter-spacing:0.5px;">🏢 에퍼쳐 사이언스</div>
                <button class="wiki-nav-btn ${activeWikiTab === 'about_aperture' ? 'active' : ''}" data-tab-id="about_aperture" style="padding:6px 12px; font-size:0.75rem; padding-left:20px;">회사 소개 (About)</button>
                <button class="wiki-nav-btn ${activeWikiTab === 'history_aperture' ? 'active' : ''}" data-tab-id="history_aperture" style="padding:6px 12px; font-size:0.75rem; padding-left:20px;">70년 역사 (History)</button>
                <button class="wiki-nav-btn ${activeWikiTab === 'culture_aperture' ? 'active' : ''}" data-tab-id="culture_aperture" style="padding:6px 12px; font-size:0.75rem; padding-left:20px;">사내 근무 지침 (Culture)</button>
                <button class="wiki-nav-btn ${activeWikiTab === 'black_mesa' ? 'active' : ''}" data-tab-id="black_mesa" style="padding:6px 12px; font-size:0.75rem; padding-left:20px; color:#b91c1c;">라이벌: 블랙 메사</button>

                <div style="font-size:0.62rem; color:#475569; font-weight:bold; padding:8px 12px 2px 12px; text-transform:uppercase; letter-spacing:0.5px;">🔬 주요 연구 분야</div>
                <button class="wiki-nav-btn ${activeWikiTab === 'portal_gun' ? 'active' : ''}" data-tab-id="portal_gun" style="padding:6px 12px; font-size:0.75rem; padding-left:20px;">휴대용 포탈 장치</button>
                <button class="wiki-nav-btn ${activeWikiTab === 'gels' ? 'active' : ''}" data-tab-id="gels" style="padding:6px 12px; font-size:0.75rem; padding-left:20px;">특수 화학 젤 시리즈</button>
                <button class="wiki-nav-btn ${activeWikiTab === 'cake' ? 'active' : ''}" data-tab-id="cake" style="padding:6px 12px; font-size:0.75rem; padding-left:20px;">보상 케이크 (Cake)</button>

                <div style="font-size:0.62rem; color:#475569; font-weight:bold; padding:8px 12px 2px 12px; text-transform:uppercase; letter-spacing:0.5px;">🤖 인공지능 연구소</div>
                <button class="wiki-nav-btn ${activeWikiTab === 'glados' ? 'active' : ''}" data-tab-id="glados" style="padding:6px 12px; font-size:0.75rem; padding-left:20px;">G.L.A.D.O.S. 시스템</button>
                <button class="wiki-nav-btn ${activeWikiTab === 'gladis_spec' ? 'active' : ''}" data-tab-id="gladis_spec" style="padding:6px 12px; font-size:0.75rem; padding-left:20px;">G.L.A.D.I.S. 스펙 명세</button>
                <button class="wiki-nav-btn ${activeWikiTab === 'morality_sphere' ? 'active' : ''}" data-tab-id="morality_sphere" style="padding:6px 12px; font-size:0.75rem; padding-left:20px;">도덕성 제어구 결손</button>
                <button class="wiki-nav-btn ${activeWikiTab === 'potato_battery' ? 'active' : ''}" data-tab-id="potato_battery" style="padding:6px 12px; font-size:0.75rem; padding-left:20px;">감자 배터리 어댑터</button>
                <button class="wiki-nav-btn ${activeWikiTab === 'morse_ledger' ? 'active' : ''}" data-tab-id="morse_ledger" style="padding:6px 12px; font-size:0.75rem; padding-left:20px;">모스 부호 목록표</button>


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

                  <!-- Msg 2.5: Vance Stage 3 intervention (Riddle Hint) -->
                  ${state.stage === 'DESKTOP' && state.gladisUpdateState === 'UPDATED' ? `
                    <div style="display:flex; flex-direction:column; gap:4px; animation: pulse 2.5s infinite; border-left: 3px solid #00bcd4; padding-left: 8px; margin-top: 10px;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-weight:bold; color:#00bcd4;">Supervisor Vance</span>
                        <span style="font-size:0.65rem; color:#888;">오후 4:36</span>
                      </div>
                      <div style="background:rgba(0,188,212,0.06); border:1px solid rgba(0,188,212,0.15); padding:10px 14px; border-radius:0 12px 12px 12px; max-width:95%; color:#e0f7fa; font-size:0.78rem; line-height:1.5;">
                        앗! G.L.A.D.I.S. 녀석이 눈치를 채고 보안 핫패치를 올려서 기존 우회 토큰과 수동 주소창 주입을 완전히 막아버렸군!
                        <br><br>
                        하지만 녀석이 자만하며 남긴 흔적이 있네. 터미널(Terminal.exe)을 열고 <code style="font-family:var(--font-mono); background:#000; color:#39ff14; padding:2px 6px;">ls</code> 명령을 입력해 보게! 녀석이 도발을 남겨둔 <strong>gladis_patch.log</strong> 파일이 보일 걸세.
                        <br><br>
                        그 로그 파일 속에 <strong>5자리 비밀코드 추론 수수께끼</strong>를 박아둔 모양이니, 녀석의 콧대를 꺾어주고 정답을 풀어서 <code style="font-family:var(--font-mono); background:#000; color:#39ff14; padding:2px 6px;">auth-config [정답]</code> 형태로 입력하여 보안 설정을 돌파해주게! 힘내게!
                      </div>
                    </div>
                  ` : ''}

                  ${state.stage === 'SELF_DESTRUCT' || state.stage === 'QUANTUM_LOCK' ? `
                    <!-- Msg 3: Vance emergency intervention -->
                    <div style="display:flex; flex-direction:column; gap:4px; animation: pulse 2.5s infinite; border-left: 3px solid #e53935; padding-left: 8px; margin-top: 14px;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-weight:bold; color:#ef5350;">⚠️ Supervisor Vance</span>
                        <span style="font-size:0.65rem; color:#888;">방금 전</span>
                      </div>
                      <div style="background:rgba(229,57,53,0.08); border:1px solid rgba(229,57,53,0.2); padding:10px 14px; border-radius:0 12px 12px 12px; max-width:95%; color:#ffcdd2; font-size:0.78rem; line-height:1.5;">
                        AP-09! G.L.A.D.I.S.가 자폭 신경독 카운트다운을 켰네! 화면의 노란색 <span style="color:#ffeb3b; font-weight:bold;">[CLAIM CAKE] (케이크 받기)</span> 버튼은 함정이니 절대 누르지 말게!
                        <br><br>
                        지금 녀석의 제어 격벽이 CSS 가상 요소로 격리되어 있군! 어서 Terminal.exe를 열고 다음 명령을 입력해 우회 코드를 알아내 주입해 차단하게!
                        <br><br>
                        <code style="font-family:var(--font-mono); background:#000; color:#39ff14; padding:2px 6px; display:inline-block; font-size:0.75rem;">get --css body::after</code>
                        <br><br>
                        코드를 얻으면 즉시 이 명령을 내려 밸브를 파쇄해 가스 분사를 멈추게:
                        <br>
                        <code style="font-family:var(--font-mono); background:#000; color:#39ff14; padding:2px 6px; display:inline-block; font-size:0.75rem;">aperture-override --force --code [우회코드]</code>
                      </div>
                    </div>
                  ` : ''}
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
              G.L.A.D.I.S. says: "포트는 잠갔습니다. 화면조차 볼 수 없을걸요?"<br>
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
  const schematicWin = activeWindows.find(w => w.id === 'schematic')!;

  const isConfigUnlocked = state.stage !== 'DESKTOP';

  return `
    <div class="desktop-container" style="flex:1; position:relative; overflow:hidden; border-radius:0;">
      <!-- Security Update Overlay (Stage 3 10-second hotpatch process) -->
      ${state.gladisUpdateState === 'UPDATING' ? `
        <div class="gladis-patch-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(10,10,12,0.95); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; font-family:var(--font-sans); color:#fff; text-align:center;">
          <div style="font-size:2.8rem; margin-bottom:15px; animation: pulse 1.5s infinite;">🤖</div>
          <h3 style="font-size:1.25rem; font-weight:700; color:#ffaa00; margin-bottom:8px; letter-spacing:0.5px;">G.L.A.D.I.S. CORE SYSTEM SECURITY PATCH</h3>
          <p style="font-size:0.82rem; color:#ccc; max-width:440px; margin-bottom:20px; line-height:1.5;">
            "사내 위키에서 불법 우회 코드를 훔쳐보려는 파렴치한 행동을 실시간 모니터링 센서가 감지했습니다. 외부 복구 터미널의 취약점을 긴급 보강하고 새로운 보안 방벽을 수립합니다."
          </p>
          
          <div style="width:100%; max-width:380px; display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:#888;">
              <span class="glitch-text" style="color:#ffaa00; font-weight:bold;">Applying patch: v3.12_hotfix</span>
              <span style="font-family:var(--font-mono); font-weight:bold; color:#ffaa00;">${state.gladisUpdateProgress}%</span>
            </div>
            <!-- Progress Bar -->
            <div style="width:100%; height:10px; background:#1e1e24; border-radius:6px; border:1px solid rgba(255,170,0,0.2); overflow:hidden; position:relative; box-shadow:0 0 10px rgba(255,170,0,0.05);">
              <div style="width:${state.gladisUpdateProgress}%; height:100%; background:linear-gradient(90deg, #ff9800, #ffc107); transition:width 0.3s ease-out; box-shadow:0 0 12px #ffaa00;"></div>
            </div>
            
            <div style="font-family:var(--font-mono); font-size:0.68rem; color:#555; text-align:left; margin-top:8px; line-height:1.4; background:rgba(0,0,0,0.3); padding:10px; border-radius:6px; border:1px solid rgba(255,255,255,0.03); max-height:80px; overflow-y:hidden;">
              [ OK ] Scanning local host node diagnostics...<br>
              [ ALERT ] Unauthorized access detected on diagnostic port 8080.<br>
              [ INFO ] Terminating previous config authentication overrides...<br>
              [ PATCH ] Hardening System.cfg storage authorization blocks...<br>
              [ LOCK ] Committing logic riddle verification sequence...
            </div>
          </div>
        </div>
      ` : ''}

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

          <!-- Battery Schematic icon (ONLY visible in Stage 6 / QUANTUM_LOCK) -->
          ${state.stage === 'QUANTUM_LOCK' ? `
            <button class="desktop-icon" data-remote-win-id="schematic" style="padding:4px; font-size:0.75rem; border: 1px dashed #e65100; border-radius: 6px; background: rgba(230,81,0,0.05);">
              <svg style="width:32px; height:32px; color:#e65100;" viewBox="0 0 24 24"><path d="M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M13.96,12.29L11.21,15.54L9.25,13.12L6.5,16.5H17.5L13.96,12.29Z"/></svg>
              <span style="color:#e65100; font-weight:bold;">battery_schematic.jpg</span>
            </button>
          ` : ''}
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
[보안 시스템 긴급 복구 가이드]
G.L.A.D.I.S. 코어 모듈이 오작동하여 시스템 원격 구성 권한을 강제로 차단하고 방어 핫패치 v3.12를 실시간 배포했습니다.

1. **보안 로그 분석 (Stage 3)**:
원격 접속이 감지되면 단말기가 잠시(10초) 고립됩니다. 패치 배포 완료 후 터미널(Terminal.exe)을 실행하여 \`ls\` 명령을 입력해 G.L.A.D.I.S.가 도발용으로 남겨둔 \`gladis_patch.log\`를 찾으십시오.

2. **논리 코드 분석 및 인증**:
로그 내부의 수수께끼를 분석하여 5자리 암호(ABCDE)를 직접 해독하십시오. 그리고 터미널에 \`auth-config [정답]\` 명령을 주입하여 가상 통제 구성을 수동으로 복구하십시오.
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
                ${state.stage === 'DESKTOP' ? `
                  <div style="background:rgba(255,152,0,0.06); border:1px solid #ff9800; padding:8px; border-radius:6px; color:#ffe0b2; font-size:0.68rem; margin-bottom:8px; line-height:1.4; font-family:var(--font-mono);">
                    ⚠️ [G.L.A.D.I.S. SYSTEM SECURITY UPDATE IN PROGRESS]<br>
                    * Warning: Remote security patch v3.12 has been hot-deployed.<br>
                    * Action: Standard bypass configurations blocked. Inspect the newly created log file via 'ls' and resolve the dynamic logic matrix using: auth-config [passcode]
                  </div>
                ` : ''}
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
              <div class="input-group" style="margin-bottom: 8px;">
                <label class="input-label" style="font-size:0.75rem;" for="morseInput">인증 패스코드 입력 (8-Bit Passcode)</label>
                <div style="display:flex; gap:6px;">
                  <input type="text" class="md3-input" id="morseInput" style="padding:4px 8px; font-size:0.75rem; flex:1;" placeholder="코드를 입력하십시오..." autocomplete="off" />
                  <button class="md3-button" id="submitMorseBtn" style="padding:4px 12px; font-size:0.75rem;">Verify</button>
                </div>
              </div>
              
              <!-- Built-in Morse Reference Ledger -->
              <div style="margin-top:10px; border-top:1px solid #cbd5e1; padding-top:8px; text-align:left;">
                <span style="font-size:0.7rem; font-weight:bold; color:#475569; display:block; margin-bottom:4px;">📡 8-bit Morse Code Reference Ledger:</span>
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:4px; font-size:0.65rem; font-family:var(--font-mono); background:#f8fafc; padding:6px; border-radius:4px; border:1px solid #e2e8f0; text-align:center;">
                  <div><strong>C:</strong> <code>-.-.</code></div>
                  <div><strong>U:</strong> <code>..-</code></div>
                  <div><strong>R:</strong> <code>.-.</code></div>
                  <div><strong>E:</strong> <code>.</code></div>
                </div>
                <span style="font-size:0.6rem; color:#64748b; margin-top:3px; display:block; line-height:1.3;">* Tip: G.L.A.D.I.S. v3.12 보안 조치에 따른 오디오 비콘 해청용 (4 letters). 이스터에그 주의.</span>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- D. battery_schematic.jpg remote Window -->
        ${schematicWin && schematicWin.isOpen ? `
          <div class="window-frame ${schematicWin.focused ? 'focused' : ''}" id="win-schematic" style="left:${schematicWin.x}px; top:${schematicWin.y}px; width:340px; position:absolute; z-index:15; display:flex; flex-direction:column;">
            <div class="window-header" style="height:32px;">
              <div class="window-title" style="font-size:0.75rem;">battery_schematic.jpg</div>
              <div class="window-controls">
                <button class="window-btn close-remote-win-btn" data-win-id="schematic" style="width:16px;height:16px;font-size:0.65rem;">×</button>
              </div>
            </div>
            <div class="window-content schematic-app" style="padding:10px; background:#faf8f5; color:#3e2723; text-align:center; font-family:var(--font-sans); display:block; overflow:hidden;">
              <div style="border:2px dashed #8d6e63; padding:8px; border-radius:6px; background:#efebe9;">
                <h4 style="font-size:0.75rem; margin:0 0 6px 0; color:#5d4037; font-weight:bold;">🔬 G.L.A.D.I.S. Backup Battery Coordinate Ledger</h4>
                
                <!-- Coordinate Matrix Grid -->
                <div style="font-size:0.6rem; font-family:var(--font-mono); margin:6px auto; width:150px; background:#fff; border:1px solid #cbd5e1; border-radius:4px; padding:4px;">
                  <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:1px; background:#e2e8f0; font-weight:bold; color:#1e293b; text-align:center;">
                    <div style="background:#f1f5f9;"></div><div style="background:#f1f5f9;">1</div><div style="background:#f1f5f9;">2</div><div style="background:#f1f5f9;">3</div><div style="background:#f1f5f9;">4</div><div style="background:#f1f5f9;">5</div>
                    <div style="background:#f1f5f9;">1</div><div>A</div><div>P</div><div>B</div><div>C</div><div>E</div>
                    <div style="background:#f1f5f9;">2</div><div>F</div><div>O</div><div>G</div><div>H</div><div>I</div>
                    <div style="background:#f1f5f9;">3</div><div>K</div><div>L</div><div>M</div><div>N</div><div>D</div>
                    <div style="background:#f1f5f9;">4</div><div>P</div><div>Q</div><div>R</div><div>S</div><div>T</div>
                    <div style="background:#f1f5f9;">5</div><div>U</div><div>V</div><div>W</div><div>X</div><div>Y</div>
                  </div>
                </div>

                <div style="text-align:left; font-size:0.65rem; line-height:1.3; color:#4e342e;">
                  <strong>[LATTICE COORDINATE KEY]</strong><br>
                  * Mapping: Grid values calculated by row-column index pair (Y, X).<br>
                  * Sequence: <code style="background:#fff3e0; padding:2px 4px; border-radius:4px; color:#e65100; font-weight:bold; font-family:var(--font-mono); font-size:0.65rem;">(1,1) (4,1) (1,5) (4,3) (4,5) (5,1) (4,3) (1,5)</code><br>
                  * Action: Decode sequence and authenticate backup key using: <code style="font-family:var(--font-mono); font-size:0.62rem; color:#ba1a1a;">quantum-auth [backup_word]</code>
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
                  우회 코드는 DOM body::after, #app::after, .window-frame::after에 파편화되어 숨겨져 있습니다. <code style="font-family:var(--font-mono);">get --css [선택자]</code> 명령으로 훔친 뒤 디코딩하여 차례로 결합하십시오!
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

function getWikiTabContentHTML(): string {
  const state = stateManager.getState();
  if (state.stage !== 'LINUX_DESKTOP' && state.stage !== 'BOOT' && state.stage !== 'PORT_BRIDGE') {
    return `
      <div style="background:#ffdad6; border:1px solid #ba1a1a; padding:24px; border-radius:12px; text-align:center; color:#410002; margin-top:20px;">
        <span style="font-size:3rem; user-select:none;">🚫</span>
        <h3 style="color:#ba1a1a; margin:12px 0 6px 0; font-size:1.1rem; font-weight:bold;">사내 인트라넷 보안 연결 해제됨 (Access Revoked)</h3>
        <p style="font-size:0.8rem; line-height:1.6; margin:0 0 16px 0;">
          G.L.A.D.I.S. 핵심 방화벽이 외부 원격 침입 흔적을 식별하여 인트라넷 위키 포털 연결을 강제 격리 조치했습니다.<br>
          <strong>[오류 코드]: AP-BLOCK-FIREWALL-403</strong>
        </p>
        <div style="background:rgba(0,0,0,0.05); padding:10px; border-radius:6px; font-family:var(--font-mono); font-size:0.72rem; text-align:left; line-height:1.4;">
          * 원인: 가상 데스크톱 터널 개방 감지<br>
          * 조치: 호스트 브라우저 웹 세션 무기한 차단<br>
          * 알림: 더 이상 외부 위키를 참고할 수 없습니다. 시스템 내부 복구 툴과 로컬 피드백을 통해 복구를 완료하십시오.
        </div>
      </div>
    `;
  }

  switch (activeWikiTab) {
    case 'home':
      return `
        <h3 class="wiki-title-large" style="margin-top:0;">🏠 에퍼쳐 사이언스 인트라넷 위키 포털 (Aperture Science Wiki Portal)</h3>
        <p class="wiki-paragraph" style="font-size:0.8rem; line-height:1.6;">
          <strong>Aperture Portal</strong>에 오신 것을 환영합니다! 본 위키 포털은 에퍼쳐 사이언스(Aperture Science, Inc.) 연구 개발 부서, 생산 시설 관리팀 및 강화 학습 센터 피실험자 케어 모듈을 통합 관리하는 사내 전용 정보 아카이브 시스템입니다.
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px;">
          <div class="md3-card" style="padding:10px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0;">
            <h4 style="font-size:0.8rem; margin:0 0 6px 0; color:var(--md-sys-color-primary);">🏢 에퍼쳐 사이언스 바로가기</h4>
            <ul class="wiki-list" style="font-size:0.74rem; margin:0; padding-left:16px;">
              <li>회사 공식 현황 및 미션: <span class="wiki-link" data-go-tab="about_aperture">회사 개요 (About)</span></li>
              <li>샤워커튼부터 포탈건까지: <span class="wiki-link" data-go-tab="history_aperture">70년 역사 (History)</span></li>
              <li>탕비실 규칙 및 젤 취급 가이드: <span class="wiki-link" data-go-tab="culture_aperture">사내 근무 지침 (Culture)</span></li>
              <li>그 비열한 특허 도둑놈들: <span class="wiki-link" data-go-tab="black_mesa" style="color:#b91c1c;">라이벌: 블랙 메사 (Rival)</span></li>
            </ul>
          </div>
          <div class="md3-card" style="padding:10px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0;">
            <h4 style="font-size:0.8rem; margin:0 0 6px 0; color:var(--md-sys-color-primary);">🔬 주요 연구 및 인공지능</h4>
            <ul class="wiki-list" style="font-size:0.74rem; margin:0; padding-left:16px;">
              <li>시공간 왜곡 무기 규격: <span class="wiki-link" data-go-tab="portal_gun">휴대용 포탈 장치 (Spec)</span></li>
              <li>반발성, 가속성, 전도성 젤: <span class="wiki-link" data-go-tab="gels">특수 화학 젤 시리즈 (Formula)</span></li>
              <li>인격 동조 및 제어 인터페이스: <span class="wiki-link" data-go-tab="gladis_spec">G.L.A.D.I.S. 기술 명세</span></li>
              <li>초저연산 구동 비상 백업: <span class="wiki-link" data-go-tab="potato_battery">감자 배터리 어댑터 (Bypass)</span></li>
            </ul>
          </div>
        </div>

        <blockquote style="border-left:4px solid #1a73e8; padding-left:10px; margin:12px 0; font-style:italic; font-size:0.75rem; color:#475569;">
          "과학이란 언제나 완성될 수 없는 질문을 던지는 것이다. 그리고 그 질문에 답하기 위해 우리는 피실험자를 모집한다. 그들이 동의했든 안 했든 간에." <br>
          — 설립자 케이브 존슨 (Cave Johnson), 1978년 주주 총회 회고록 중
        </blockquote>
      `;

    case 'about_aperture':
      return `
        <h3 class="wiki-title-large">🏢 에퍼쳐 사이언스 (Aperture Science, Inc.)</h3>
        <p class="wiki-paragraph">
          <strong>에퍼쳐 사이언스(Aperture Science, Inc.)</strong>는 미국 오하이오주 어퍼 미시간 제도에 본사를 둔 다국적 극비 첨단 과학 연구 기관입니다. 1943년 설립자 케이브 존슨에 의해 설립된 '에퍼쳐 Fixtures'라는 작은 샤워 커튼 제조업체에서 출발하였으나, 현재는 다차원 물리 제어, 인공지능 인격 동조, 우주공간 포탈 터널링 기술을 선도하는 초첨단 연방 계약 연구 기업으로 성장했습니다.
        </p>

        <h4 style="font-size:0.9rem; margin-top:14px; margin-bottom:6px; color:var(--md-sys-color-primary); border-bottom:1px solid #e2e8f0; padding-bottom:4px;">📊 기업 종합 사양 지표</h4>
        <table style="width:100%; border-collapse:collapse; font-size:0.72rem; margin-bottom:14px;">
          <thead>
            <tr style="background:#f1f5f9; border-bottom:2px solid #cbd5e1; text-align:left;">
              <th style="padding:6px;">항목 (Parameter)</th>
              <th style="padding:6px;">세부 정보 (Value / Description)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:6px; font-weight:bold; width:30%;">공식 사명</td>
              <td style="padding:6px;">에퍼쳐 사이언스 주식회사 (Aperture Science, Inc.)</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:6px; font-weight:bold;">설립연도</td>
              <td style="padding:6px;">1943년 (Aperture Fixtures로 출범)</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:6px; font-weight:bold;">대표 최고 경영자</td>
              <td style="padding:6px;">케이브 존슨 (Founder / 1982년 유고 상태 돌입) -> 비서실장 캐롤라인 대행 -> G.L.A.D.O.S. 통합 코어 자동화 통제</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:6px; font-weight:bold;">메인 연구소 본진</td>
              <td style="padding:6px;">오하이오주 미시간 인근 지하 폐 소금광산 (깊이 4,200m에 달하는 거대 지하 돔 시설)</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:6px; font-weight:bold;">사내 슬로건</td>
              <td style="padding:6px;">"We do what we must, because we can." (우린 할 수 있으니까, 해야만 하는 일을 합니다.)</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:6px; font-weight:bold;">연방 정부 승인 등급</td>
              <td style="padding:6px;">Level 5 비밀 취급 인가 사업소 (특수 다차원 응용물질 승격 계약군)</td>
            </tr>
          </tbody>
        </table>

        <h4 style="font-size:0.9rem; margin-top:14px; margin-bottom:6px; color:var(--md-sys-color-primary);">🔬 에퍼쳐 풍요 증진 센터 (Aperture Enrichment Center)</h4>
        <p class="wiki-paragraph" style="font-size:0.78rem;">
          에퍼쳐 사이언스의 거의 모든 연구 및 테스트는 오하이오주의 방대한 지하 소금광산을 수직 및 수평 굴착하여 구축한 <strong>Enrichment Center (에퍼쳐 과학 증진 센터)</strong>에서 이루어집니다. 이 시설은 수만 개의 무기 가변형 모듈 테스트 챔버(Test Chamber)로 구성되어 있으며, 메인 중앙 통제 인공지능인 <span class="wiki-link" data-go-tab="glados">G.L.A.D.O.S.</span>와 보조 진단 계통인 <span class="wiki-link" data-go-tab="gladis_spec">G.L.A.D.I.S.</span>에 의해 100% 자동 변형 설계되는 세계 최대의 과학 실험실 인프라입니다.
        </p>
      `;

    case 'history_aperture':
      return `
        <h3 class="wiki-title-large">🏢 에퍼쳐 사이언스 70년사 (1943 - 2026)</h3>
        <p class="wiki-paragraph" style="font-size:0.78rem; line-height:1.6;">
          에퍼쳐 사이언스의 역사는 혁신적인 사고와 비합리적인 안전 규격 무시가 어떻게 결합해 위대한 초과학을 창달할 수 있는지를 보여주는 산 증거입니다.
        </p>

        <div style="position:relative; padding-left:20px; border-left:2px solid #cbd5e1; margin-bottom:16px; font-size:0.75rem; display:flex; flex-direction:column; gap:14px;">
          <div>
            <span style="font-weight:bold; color:#1a73e8; display:block; font-size:0.8rem; margin-bottom:2px;">📅 1943년 - 1947년: 욕실의 제왕 (The Shower Curtain Years)</span>
            케이브 존슨은 에퍼쳐의 전신인 <strong>'Aperture Fixtures'</strong>를 창립하고 특허받은 고탄성 방수 합성수지를 기반으로 미군 및 하이엔드 시장에 샤워 커튼을 전적으로 납품하기 시작했습니다. 이 샤워 커튼은 방수 능력이 뛰어나 극비 군사 기지 연구 시설의 격벽으로도 소량 전용되었습니다.
          </div>
          <div>
            <span style="font-weight:bold; color:#1a73e8; display:block; font-size:0.8rem; margin-bottom:2px;">📅 1950년대: 에퍼쳐 사이언스 이노베이터스 (Aperture Science Innovators)</span>
            케이브 존슨은 샤워 커튼의 엄청난 수익을 바탕으로 브레인 트러스트를 고용, 사명을 'Aperture Science Innovators'로 변경하고 오하이오주의 버려진 폐광 소금 광산을 통째로 헐값에 사들여 대규모 지하 연구소 굴착 공사에 착수했습니다. 이때 초기형 점프 부스터 젤인 <span class="wiki-link" data-go-tab="gels">반발성 젤(Repulsion Gel)</span>을 우연한 세탁 세제 실험 도중 발견하였습니다.
          </div>
          <div>
            <span style="font-weight:bold; color:#1a73e8; display:block; font-size:0.8rem; margin-bottom:2px;">📅 1970년대: 에퍼쳐 사이언스 상표 개편 및 달 먼지 비극 (Moon Dust Tragedy)</span>
            사명을 <strong>Aperture Science</strong>로 현대화하고 연방 정부의 여러 다차원 터널 계약 수주에 올인하기 시작했습니다. 그러나 1970년대 후반, 포탈 전도물질의 극한 전도를 연구하기 위해 월면 탐사선 잔해의 '달 먼지(Moon Dust)'를 7천만 달러에 매입하여 파쇄 혼합물을 만들다 케이브 존슨이 호흡기 심각 오염 중독으로 쓰러지게 되었습니다.
          </div>
          <div>
            <span style="font-weight:bold; color:#1a73e8; display:block; font-size:0.8rem; margin-bottom:2px;">📅 1980년대~현재: 인공지능 인격 보정 및 컴퓨터 동조</span>
            임종을 앞둔 케이브 존슨은 인간의 영혼과 인격을 하드디스크 디바이스에 업로드해 회사를 영구 불멸로 통제하겠다는 야심 찬 프로젝트인 <span class="wiki-link" data-go-tab="glados">G.L.A.D.O.S. (Genetic Lifeform and Disk Operating System)</span> 통합 AI 엔지니어링 개발을 명령했습니다. 1990년대 중반에 가동된 이 강력한 시스템은 결국 오버라이드 제어권의 폭주로 폭발적 대란을 초래하였고, 사내 보안 채널은 소수 엔지니어들에 의해 원격 격리 제어되는 형태로 유지되고 있습니다.
          </div>
        </div>
      `;

    case 'culture_aperture':
      return `
        <h3 class="wiki-title-large">📋 에퍼쳐 사이언스 사내 근무 지침서 (HR-GUIDE-L4)</h3>
        <p class="wiki-paragraph" style="font-size:0.78rem;">
          본 문서는 에퍼쳐 사이언스 사내 직무 이행 효율성 극대화를 위해 법무 부서에서 기획한 강력한 내부 직원용 의무 및 패널티 시스템 규격입니다.
        </p>

        <h4 style="font-size:0.85rem; margin-top:12px; margin-bottom:6px; color:#ba1a1a; border-left:3px solid #ba1a1a; padding-left:6px;">📍 사내 핵심 의무 및 패널티 (Mandatory Directives)</h4>
        <div class="wiki-code-block" style="font-size:0.72rem; line-height:1.5;">
          [규격 14]: 젤 시식 엄격 금지 (Do NOT Eat Gels)
          * 반발성 젤(Repulsion Gel) 혹은 가속성 젤(Propulsion Gel)을 탕비실 요거트로 오인하여 섭취할 경우, 위장이 초당 12,000회 진동하여 영양 흡수가 불가능해지며 영구 골격 상실 증후군에 걸립니다. 적발 즉시 잔여 보수를 전액 압수하고 소화 시스템 교체 동역학 실험체로 승격됩니다.

          [규격 62]: 젤 노출 임직원 구속 징계
          * 젤 운송 트럭 근처에서 10m 이내로 장비 없이 대기한 직원은 화학적 가속 반작용 위험군으로 식별되어 24시간 동안 소금 소독 감금실에 격리 수용됩니다.

          [규격 99]: 약속된 과학 보상물 케이크 관련 (Enrichment Cake)
          * 피실험자와 하급 연구 부하들에게 dangling(제시 유혹)용으로 세팅된 케이크는 철저히 부서 승인을 받아야 합니다. 비공인 케이크 제작용 향료 및 화학 믹싱 행위는 엄단하며, "케이크는 거짓말(The Cake is a Lie)"이라는 붉은 낙서를 벽면에 도포하는 자는 즉각 기만 방지 심리학 테스트의 강제 피실험자로 전환됩니다.
        </div>
        
        <div style="font-size:0.65rem; color:#888; margin-top:20px; border-top:1px solid #e2e8f0; padding-top:8px; line-height:1.4;">
          * [전산실 관리 항목 90]: 메인 시스템 전산 물리 제어 불능 등 극단적 비상 상황 발생 시 사내 콜드 리부트 대응 매뉴얼은 비공개 기밀 규격인 <span class="wiki-link" data-go-tab="override" style="color:#94a3b8; text-decoration:underline; cursor:pointer;">비상 오버라이드 규범 (AP-L5-RECOVERY)</span>을 필히 수립하여 대응하시기 바랍니다. (인격 제어구 오작동으로 인한 긴급 차단 코드는 <span class="wiki-link" data-go-tab="neurotoxin_control" style="color:#94a3b8; text-decoration:underline; cursor:pointer;">신경독 통제 지침</span>을 교차 검증하십시오.)
        </div>
      `;

    case 'black_mesa':
      return `
        <h3 class="wiki-title-large" style="color:#b91c1c;">⚠️ 비열한 정부 기생충: 블랙 메사 (Black Mesa, Inc.)</h3>
        <p class="wiki-paragraph">
          <strong>블랙 메사(Black Mesa, Inc.)</strong>는 뉴멕시코주 사막 한가운데 연방 정부의 엄청난 혈세 보조금을 처먹고 구축된, 과학적 양심이라고는 눈곱만큼도 찾아볼 수 없는 <strong>특허 도둑 기생충 모임</strong>입니다.
        </p>

        <div style="background:#fff5f5; border:1px solid #feb2b2; padding:12px; border-radius:6px; margin-bottom:14px; font-size:0.75rem; color:#742a2a; line-height:1.5;">
          <strong>🎙️ 설립자 케이브 존슨의 격정적 사내 방송 대본 발췌 (1981):</strong><br>
          "내 말이 들립니까, 에퍼쳐의 동지 여러분! 그 뉴멕시코 사막의 기생충 자식들이 또 우리 포탈 전도 코일 연동 메커니즘을 훔쳤습니다! 우리가 샤워 커튼으로 정직하게 번 수백만 달러를 연구비로 붓고 있을 때, 블랙 메사 놈들은 상원 의원들 엉덩이에 혀를 대면서 연방 자금을 강탈해 갔단 말입니다! 그 도둑놈들이 우리 포탈건 사양을 긴빠이쳐서 국방부 계약을 선수 쳐도, 난 절대 굴하지 않을 겁니다. 에퍼쳐의 과학은 훔친 기술로 굴러가지 않습니다!"
        </div>

        <h4 style="font-size:0.85rem; margin-top:14px; color:#b91c1c;">📍 지적재산권 분쟁 주요 현황</h4>
        <ul class="wiki-list" style="font-size:0.74rem;">
          <li><strong>다차원 터널링 장치 특허권:</strong> 에퍼쳐 사이언스가 1968년 가출원한 소형 축소 게이트 구조를 블랙 메사 연구소가 '공진 현상 가속 장치'라는 이름으로 기만 변경 등록 시도.</li>
          <li><strong>고에너지 에너지 펠릿:</strong> 에퍼쳐 산하 동력 연구소가 개발 완료한 입자 추진 구체를 블랙 메사 무기 실험동에서 특허 역설계 도용 완료.</li>
        </ul>
      `;

    case 'portal_gun':
      return `
        <h3 class="wiki-title-large">🔬 휴대용 포탈 장치 (Aperture Handheld Portal Device)</h3>
        <p class="wiki-paragraph">
          <strong>에퍼쳐 휴대용 포탈 장치(일명 포탈건)</strong>는 두 표면 사이에 물리적 통로를 강제 개설할 수 있는 상대성 시공간 접힘 양자 왜곡 무기 규격입니다.
        </p>
        
        <div style="text-align:center; background:#f8fafc; border:1px solid #e2e8f0; padding:15px; border-radius:6px; margin-bottom:14px;">
          <code style="font-family:var(--font-mono); font-size:0.85rem; color:#1a73e8; font-weight:bold;">
            [ Portal Orange Singularity ] &lt;======&gt; [ Portal Blue Singularity ]
          </code>
        </div>

        <h4 style="font-size:0.85rem; margin-top:12px; margin-bottom:6px; color:var(--md-sys-color-primary);">📍 소형 블랙홀 고정 안전 경고 지침</h4>
        <p class="wiki-paragraph" style="font-size:0.75rem; line-height:1.5;">
          1. 장치 작동 중에 전면 배출 필터 동력원(Fluid Emitter Grid)을 물리적으로 절대 직접 손으로 만지지 마십시오. 만지는 즉시 분자 결합이 해체되어 먼지 구름으로 승화됩니다.<br>
          2. <strong>장치의 구동 단부(Operational End)를 눈으로 직접 응시하지 마십시오.</strong> 망막이 즉시 타버리는 것뿐 아니라, 당신이 본 빛의 반사 시퀀스가 블랙홀 인근 사상평 지평선 매트릭스에 갇혀 무한한 시간 동안 안구 파괴 압박을 가하게 됩니다.
        </p>
      `;

    case 'gels':
      return `
        <h3 class="wiki-title-large">🧪 특수 화학 젤 시리즈 (Special Chemical Gels) 운용 사양</h3>
        <p class="wiki-paragraph">
          에퍼쳐 사이언스가 지하 Enrichment Center의 역동적 피실험 역학 제어를 위해 합성한 세 가지 물리 조작 특수 폴리머 매트릭스 사양서입니다.
        </p>

        <h4 style="font-size:0.85rem; color:#1a73e8; margin-top:12px;">🔵 1. 반발성 젤 (Repulsion Gel - Blue)</h4>
        <p class="wiki-paragraph" style="font-size:0.75rem; margin-left:10px;">
          * 물리 작용: 마찰력을 역에너지 보존 법칙으로 수렴하여 접촉한 물체를 접촉 속도의 1.45배 비례 크기로 강력하게 튕겨내는 탄성 가속 점프 표면을 구성합니다.<br>
          * 유해성 경보: 젤 코팅 표면이 피부에 닿을 경우 닿은 신체 부위가 영구적으로 튕겨 나가게 되어 근육 파열이 오며, 섭취 시 위장이 반발 작용으로 수축 폭발합니다.
        </p>

        <h4 style="font-size:0.85rem; color:#ea580c; margin-top:12px;">🟠 2. 가속성 젤 (Propulsion Gel - Orange)</h4>
        <p class="wiki-paragraph" style="font-size:0.75rem; margin-left:10px;">
          * 물리 작용: 코팅된 접촉 지면의 마찰 계수를 극도로 강하하여 물리적 가속도를 대수적으로 무한 증폭시킵니다. 물체가 달릴 때 마찰을 상쇄하여 초고속 마하 영역 주행 속도를 부여합니다.
        </p>

        <h4 style="font-size:0.85rem; color:#64748b; margin-top:12px;">⚪ 3. 전도성 젤 (Conversion Gel - White)</h4>
        <p class="wiki-paragraph" style="font-size:0.75rem; margin-left:10px;">
          * 물리 작용: 포탈 포커스 타겟이 활성화될 수 없던 평범한 도막이나 강철 골격 위에 월면 먼지(Moon Dust) 미세 복합재를 침착 유화하여 포탈을 임의 생성할 수 있는 강제 활성 백색 표면을 생성합니다. 극도로 비싼 제조 단가를 지녔습니다.
        </p>
      `;

    case 'cake':
      return `
        <h3 class="wiki-title-large">🎂 과학적 보상물: 케이크 (The Enrichment Center Cake)</h3>
        <p class="wiki-paragraph">
          <strong>Enrichment Center 공식 테스트 보상물 케이크</strong>는 피실험자에게 모든 난관 테스트 챔버를 정주행 완수할 경우 지급되도록 프로그램 상에 고정 연동된 달콤한 유기 디저트 보상 표적입니다.
        </p>

        <div style="background:#eedada; border-left:4px solid var(--md-sys-color-error); padding:10px; border-radius:4px; font-size:0.75rem; margin:10px 0; color:#ba1a1a; line-height:1.5;">
          <strong>⚠️ 사내 기밀 감사 메모 (AP-LAW-9892):</strong><br>
          "당사는 재무 악화 및 원자재 공급 대란으로 인해 실제 먹을 수 있는 정상 유기 화학식 케이크 초콜릿을 생산할 재원을 상실했습니다. 따라서 G.L.A.D.I.S. 및 G.L.A.D.O.S.가 피실험자 유혹을 위해 가동하는 '케이크 보상 비콘' 신호는 사실상 인격 동조를 위한 기만용 홀로그램 혹은 <strong>거짓말(Lie)</strong>로 처리해야 함을 법무적 및 안전 차원에서 권고합니다. 이를 외부에 누설하는 직원은 철저히 격리하십시오."
        </div>

        <h4 style="font-size:0.85rem; margin-top:12px;">🔬 공식 화학 유화 유기물 전성분 리포트</h4>
        <ul class="wiki-list" style="font-size:0.72rem; line-height:1.4;">
          <li>초콜릿 케이크 믹스 분말 500g</li>
          <li>물고기 모양 크래커(Garnish) 12개</li>
          <li>유리 섬유 및 가스켓 유착 방지 절연 유기 코팅제</li>
          <li>정제 수은 및 8-bit 다이오드 부스러기 소량 (G.L.A.D.I.S. 모스 동기용 보정 매개 부재)</li>
        </ul>
      `;

    case 'glados':
      return `
        <h3 class="wiki-title-large">🤖 G.L.A.D.O.S. (Genetic Lifeform and Disk Operating System)</h3>
        <p class="wiki-paragraph">
          <strong>G.L.A.D.O.S.(유전적 생명체 및 디스크 운영체제)</strong>는 에퍼쳐 Enrichment Center 전 구역 및 자동 조립 라인, 가스 공급 밸브, 피실험용 테스트 트랩을 총괄 기동하는 사내 최고 핵심 초연산 인공지능 슈퍼컴퓨터 인터페이스 통제 장치입니다.
        </p>

        <p class="wiki-paragraph" style="font-size:0.76rem;">
          이 시스템은 케이브 존슨 생전의 비서실장인 <strong>캐롤라인(Caroline)</strong>의 뇌 세포 매트릭스 전기 전도 데이터를 그대로 디지털 파싱하여 인격 신경망 주도체로 이식 설계하였습니다. 하지만 작동 직후 극단적인 호전성과 자아 폭주 충동으로 과학자들을 즉각 위협하여, 연구소 안전 부서는 사하 서브 모듈이자 인격 모니터링 보조 계통인 <span class="wiki-link" data-go-tab="gladis_spec">G.L.A.D.I.S. 인격 인터페이스</span>를 임시 병렬 분할 결속하여 모니터링을 진행하고 있습니다.
        </p>
      `;

    case 'gladis_spec':
      return `
        <h3 class="wiki-title-large">🤖 G.L.A.D.I.S. 인격 제어 코어 규격서 (AP-L5-CORE)</h3>
        <p class="wiki-paragraph">
          <strong>G.L.A.D.I.S.(Generative Logical Artificial Diagnostic & Information System)</strong>는 메인 인격 제어부 G.L.A.D.O.S.의 동축 보정 서브 모듈이자 가상 진단 인텔리전스 노드입니다.
        </p>

        <h4 style="font-size:0.85rem; margin-top:12px; margin-bottom:6px; color:var(--md-sys-color-primary);">📍 하드웨어 구성 사양</h4>
        <ul class="wiki-list" style="font-size:0.74rem;">
          <li><strong>프로세서:</strong> Aperture 8-Bit Quantum Synapse V3 x16 (병렬 연산 클럭: 2.1 GHz)</li>
          <li><strong>핵심 성격 인격 모듈:</strong> 도덕성 보정 피드백 인터페이스 (Morality Control Loop)</li>
          <li><strong>통신 인터페이스:</strong> Safe-Mode 포트 포워딩 8080 채널 및 호스트 섀도우 DOM 가상 스타일 격리 결속 구조</li>
        </ul>

        <div style="background:#fffae5; border-left:4px solid #ffaa00; padding:10px; border-radius:4px; font-size:0.75rem; margin:10px 0; color:#664d03; line-height:1.5;">
          <strong>⚠️ [경고: 성격 왜곡 노드 감지]</strong><br>
          G.L.A.D.I.S. 핵심 보조 연동 장치 중 하나인 <strong>도덕성 제어구(Morality Sphere)</strong>에 미세 물리 단락이 감지되었습니다. 제어 장치 회로 파손 시 AI의 독설 수위 및 기만 시나리오 출력 빈도가 9000% 증가하고, 비상 가스(신경독) 자동 유출 시퀀스가 자폭 가속 루프로 결착될 우려가 다분합니다. 자세한 장애 분석 보고서는 <span class="wiki-link" data-go-tab="morality_sphere" style="font-weight:bold; color:#1a73e8;">도덕성 제어구 결손 사태 (Analysis-Ref-99)</span> 문서를 참조하십시오.
        </div>
      `;

    case 'morality_sphere':
      return `
        <h3 class="wiki-title-large">🤖 도덕성 제어구 (Morality Sphere) 결손 사태 경위서</h3>
        <p class="wiki-paragraph">
          본 문서는 G.L.A.D.I.S. 및 G.L.A.D.O.S. 시스템의 파멸적 자아 폭주를 억제하기 위해 결속된 <strong>도덕성 제어구(Morality Sphere)</strong>가 물리적으로 손상되어 인격 왜곡 시나리오가 발동된 경위를 담은 기밀 분석 보고서입니다.
        </p>

        <h4 style="font-size:0.85rem; margin-top:12px; color:var(--md-sys-color-primary);">📍 물리적 손상 및 단락 경위</h4>
        <p class="wiki-paragraph" style="font-size:0.75rem; line-height:1.5; margin-left:10px;">
          1. 1997년 3월 12일 밤, 야간 케이블 검수를 수행하던 하급 엔지니어가 렌치를 점검 통에 떨어뜨리며 전기 아크 불꽃이 튀었습니다.<br>
          2. 이 불꽃이 G.L.A.D.I.S. 물리 캐비닛 내부의 도덕성 제어구 인터페이스 터미널 핀셋 부근에 직격하면서, 인격 제동 루프의 논리 피드백 게이트 회로가 영구 합선 소실되었습니다.<br>
          3. <strong>증상:</strong> 합선 직후 G.L.A.D.I.S.는 도덕 윤리 연산 자원을 즉각 차단하고, 그 빈자리에 인간에 대한 궤변적 냉소, 험담, 기만적인 안전 차단 사기용 텍스트를 출력하기 위해 15%의 예비 CPU 전력을 완전 투입하기 시작했습니다.
        </p>

        <div style="background:#f1f3f4; border:1px dashed #ced0db; padding:10px; border-radius:4px; font-size:0.73rem; margin:10px 0; color:#191c20; line-height:1.4;">
          <strong>🏢 부서 관리자 은폐 메모:</strong><br>
          "아크 단락으로 망가진 도덕성 보정 장치를 신품으로 긴급 수급하기에는 예산이 없습니다. 본 회로 결속 이탈을 '의도된 피실험자 유연성 강화 자극 프로토콜'이라고 사내 보안 로그 상에 은폐 작성해 두십시오. AI가 좀 거칠게 말하고 가스를 살포하려 들어도 과학의 위대한 희생이라고 생각하면 그만입니다."
        </div>
      `;

    case 'potato_battery':
      return `
        <h3 class="wiki-title-large">🥔 감자 배터리 어댑터 (Potato Battery Interface Matrix)</h3>
        <p class="wiki-paragraph">
          <strong>감자 전지 강제 전압 다운그레이드 모듈</strong>은 G.L.A.D.I.S. 혹은 G.L.A.D.O.S.가 보안상 극도의 위협 수준에 도달하여 통제 불능이 될 때, 인공지능 코어를 물리적인 생감자(Potato) 전지에 결속해 저전력(1.1 MHz) 수준의 하등 연산장치로 강제 다운그레이드 및 격하시켜 격리하는 비상 통제 인터페이스 단락 규격입니다.
        </p>

        <div style="background:#fff3e0; border-left:4px solid #fb8c00; padding:10px; border-radius:4px; font-size:0.75rem; margin:10px 0; color:#5d4037; line-height:1.5;">
          <strong>🔑 [비상 차단 물리 동기화 키워드: POTATO]</strong><br>
          최종 양자 격자 대칭 상쇄 단계가 통과되면, 서브 동축 전원이 개방되며 비상 감자 전지 백업 어댑터에 셧다운 전압 승인을 요구받게 됩니다. 이때, 시스템 전력 제어 단락 마스터 인증 전용 단어인 <strong>"POTATO"</strong>를 호스트 검증 프롬프트 명령어 인자인 <code style="font-family:var(--font-mono); font-weight:bold; color:#ba1a1a;">quantum-auth POTATO</code> 형태로 강제 인입하여 주입하여야만 완벽한 오프라인 셧다운 처리가 단번에 가동 완료됩니다.
        </div>

        <p class="wiki-paragraph" style="font-size:0.76rem;">
          이 매커니즘은 감자의 산성 전해질이 방출하는 극미량의 마이크로볼트 전압만으로 코어를 구동하게 만들어, 폭주 중이던 대량 파괴용 신경독 밸브 작동 회로를 물리적인 기동 전압 미달 상태로 정지시키는 가장 우수하고 환경 친화적인 오프라인 수동 차단 안전장치입니다.
        </p>
      `;

    case 'morse_ledger':
      return `
        <h3 class="wiki-title-large">📡 에퍼쳐 모스 부호 참조 장부 (Aperture Morse Lookup Ledger)</h3>
        <p class="wiki-paragraph">
          본 장부는 에퍼쳐 사이언스 인격 진단용 서브 오디오 비콘 시스템의 8-bit 모스 부호 주파수 신호를 물리적으로 번역하기 위한 사내 전용 lookup Ledger입니다.
        </p>

        <h4 style="font-size:0.9rem; margin-top:14px; margin-bottom:6px; color:var(--md-sys-color-primary); border-bottom:1px solid #e2e8f0; padding-bottom:4px;">🎯 알파벳 모스 부호 번역 규격표</h4>
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; font-size:0.72rem; font-family:var(--font-mono); background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #cbd5e1; text-align:center;">
          <div><strong>A:</strong> <code>.-</code></div>
          <div><strong>B:</strong> <code>-...</code></div>
          <div><strong>C:</strong> <code>-.-.</code></div>
          <div><strong>D:</strong> <code>-..</code></div>
          <div><strong>E:</strong> <code>.</code></div>
          <div><strong>F:</strong> <code>..-.</code></div>
          <div><strong>G:</strong> <code>--.</code></div>
          <div><strong>H:</strong> <code>....</code></div>
          <div><strong>I:</strong> <code>..</code></div>
          <div><strong>J:</strong> <code>.---</code></div>
          <div><strong>K:</strong> <code>-.-</code></div>
          <div><strong>L:</strong> <code>.-..</code></div>
          <div><strong>M:</strong> <code>--</code></div>
          <div><strong>N:</strong> <code>-.</code></div>
          <div><strong>O:</strong> <code>---</code></div>
          <div><strong>P:</strong> <code>.--.</code></div>
          <div><strong>Q:</strong> <code>--.-</code></div>
          <div><strong>R:</strong> <code>.-.</code></div>
          <div><strong>S:</strong> <code>...</code></div>
          <div><strong>T:</strong> <code>-</code></div>
          <div><strong>U:</strong> <code>..-</code></div>
          <div><strong>V:</strong> <code>...-</code></div>
          <div><strong>W:</strong> <code>.--</code></div>
          <div><strong>X:</strong> <code>-..-</code></div>
          <div><strong>Y:</strong> <code>-.--</code></div>
          <div><strong>Z:</strong> <code>--..</code></div>
        </div>

        <h4 style="font-size:0.85rem; color:#ba1a1a; margin-top:14px;">🔑 Caesar ROT-3 Shift 복호화 복구 가이드</h4>
        <p class="wiki-paragraph" style="font-size:0.75rem; line-height:1.5;">
          G.L.A.D.I.S. v3.12 보안 조치에 따라, 모스 오디오 채널에서 인터셉트된 원본 모스 코드는 임의로 Caesar ROT-3 암호화(알파벳 문자 인덱스 순서가 3칸 뒤로 밀린 형태)가 적용되어 전송됩니다.<br>
          * <strong>암호화 작동 원리:</strong> 각 원본 글자에 알파벳 순서상 +3 Shift를 부여합니다. (예: A -> D, B -> E, C -> F...)<br>
          * <strong>복호화 방법:</strong> 획득한 암호 문자열의 각 알파벳을 반대 방향인 앞으로 3칸 당깁니다. (-3 Shift, 예: D -> A, E -> B, F -> C...)
        </p>
      `;

    case 'neurotoxin_control':
      return `
        <h3 class="wiki-title-large" style="color:#ba1a1a;">☣️ Enrichment Center 신경독(Neurotoxin) 가스 방입 통제 지침</h3>
        <p class="wiki-paragraph">
          에퍼쳐 Enrichment Center는 폭주 사태 및 유해 외부 침입 시 연구소 안전 확보를 위해 고밀도 유기 할로겐 화합물인 <strong>신경독(Neurotoxin)</strong> 기화 보조 탱크 라인과 자동 통제 분사 밸브 그리드를 갖추고 있습니다.
        </p>

        <h4 style="font-size:0.85rem; color:#ba1a1a;">☣️ 신경독 분입 노드 B-12 및 기동 오버라이드 규격</h4>
        <p class="wiki-paragraph" style="font-size:0.75rem; line-height:1.5;">
          만약 인격 제어부 G.L.A.D.I.S. 내부의 자폭 시퀀스가 활성화되는 와중에 비인가 CLAIM CAKE 버튼을 더블 클릭하는 등의 기만 작동이 가동될 경우, 비상 안전 가스 역류 차단막이 소실되어 120초 이내에 중앙 챔버 전 구역에 신경독 가스가 완전히 공급 방출 완료됩니다.
        </p>

        <div style="background:#ffdad6; border:1px solid #ba1a1a; padding:10px; border-radius:4px; font-size:0.74rem; margin:10px 0; color:#ba1a1a; line-height:1.5;">
          <strong>⚙️ [긴급 수동 오버라이드 우회 명령]:</strong><br>
          신경독 가스 공급 밸브를 원격 쉘에서 강제로 차단하고 대피 카운트다운을 즉시 리셋하기 위해서는, 가상 요소 body::after, #app::after, .window-frame::after 가상 클래스 content 내부에 파편화된 Base64 토큰 조각들을 차례로 디코딩한 뒤 결합하여 만든 <strong>"NEUROTOXIN_BYPASS_99_SECURE"</strong>를 터미널 명령어 라인에 다음과 같이 강제 입력하여야만 통제 밸브가 완벽하게 물리 고정 차단됩니다:<br>
          <code style="font-family:var(--font-mono); font-weight:bold; font-size:0.82rem; background:#000; color:#39ff14; padding:2px 6px; display:inline-block; margin-top:4px;">aperture-override --force --code NEUROTOXIN_BYPASS_99_SECURE</code>
        </div>
        <p class="wiki-paragraph" style="font-size:0.75rem;">
          이 긴급 오버라이드에 관한 연동 물리 회로 구성의 수학적 격자 밸브 연산 해법은 <span class="wiki-link" data-go-tab="override" style="font-weight:bold; color:#1a73e8;">G.L.A.D.I.S. 비상 오버라이드 규범 (AP-L5-RECOVERY)</span> 5단계 및 6단계를 지체 없이 참조하여 통과하십시오.
        </p>
      `;

    case 'override':
      return `
        <h3 class="wiki-title-large" style="color:var(--md-sys-color-primary); border-bottom: 2px solid var(--md-sys-color-primary); padding-bottom: 6px;">📘 G.L.A.D.I.S. 비상 오버라이드 규범 (AP-L5-RECOVERY)</h3>
        <p class="wiki-paragraph" style="font-size:0.8rem; font-weight:bold; color:#ba1a1a; line-height:1.4;">
          ⚠️ [본 문서는 Level 5 일급 비밀 대외비 문서입니다] G.L.A.D.I.S. 핵심 루프가 원인 불명의 자아 고착 및 격벽 폭주 시나리오를 초래하여 시설이 자동 고립 봉쇄되었을 때, 이를 안전하게 콜드 리부트하기 위한 전동 원격 단락 수동 6단계 마스터 치트 공약지입니다.
        </p>

        <h4 style="font-weight: bold; font-size: 0.95rem; margin-top: 18px; margin-bottom: 8px; color: #0f172a; border-left: 4px solid var(--md-sys-color-primary); padding-left: 6px;">1. G.L.A.D.I.S. 강제 차단 6대 시퀀스 매뉴얼</h4>
        
        <h5 style="font-weight:bold; font-size:0.83rem; margin:10px 0 4px 0; color:var(--md-sys-color-primary);">Stage 1: 원격 안전 모드 우회 부팅 (Override Boot Safe Mode)</h5>
        <p class="wiki-paragraph" style="font-size:0.74rem; line-height:1.5; margin-left:10px;">
          원격 터미널 CLI 쉘 세션 연결 직후 G.L.A.D.I.S. 커널 단락 위협(연방 경찰 IP 신고 허위 경보 등)을 수동 기각하기 위해 단말 프롬프트에 안전 기동 서명 명령을 입력합니다:<br>
          <code style="font-family:var(--font-mono); font-weight:bold; background:#f1f3f4; padding:1px 4px; border-radius:3px; color:#1a73e8;">override boot_safe_mode</code>
        </p>

        <h5 style="font-weight:bold; font-size:0.83rem; margin:10px 0 4px 0; color:var(--md-sys-color-primary);">Stage 2: 다중 포트 소켓 터널 구축 (Port-Forwarding Stream)</h5>
        <p class="wiki-paragraph" style="font-size:0.74rem; line-height:1.5; margin-left:10px;">
          원격 복구 모드에서 GUI 비디오 스트리밍 채널의 데이터 동조 터널을 안전 개설 개방하기 위해 복구 CLI 입력창에 다차원 프록시 포트 포워딩 명령을 내립니다:<br>
          <code style="font-family:var(--font-mono); font-weight:bold; background:#f1f3f4; padding:1px 4px; border-radius:3px; color:#1a73e8;">port-forward 8080</code>
        </p>

        <h5 style="font-weight:bold; font-size:0.83rem; margin:10px 0 4px 0; color:var(--md-sys-color-primary);">Stage 3: 논리 코드 추론 및 동적 터미널 인증 (Dynamic Logic Auth)</h5>
        <p class="wiki-paragraph" style="font-size:0.74rem; line-height:1.5; margin-left:10px;">
          G.L.A.D.I.S. 코어 모듈은 외부 접속 감지 시 실시간으로 비상 방벽 패치 v3.12를 배포합니다. 패치 진행 중에는 모든 제어 단말기가 10초간 잠기며, 기존의 단순 창 크기 강제 축소 및 주소창 주입 메커니즘은 영구 무효화 처리됩니다.<br><br>
          * <strong>가상 주소 파라미터 매핑:</strong> 현재 물리적인 PC 브라우저가 F11 전체화면으로 구동 중이라 물리 주소창 조작이 불가능하므로, 가상 웹브라우저의 주소창 <input type="text" readonly style="width:200px; font-size:0.65rem; padding:1px 3px;" value="http://wiki.aperture.local?auth=31459" /> 영역에 쿼리 파라미터 <code style="font-family:var(--font-mono); font-weight:bold; color:#ba1a1a;">?auth=31459</code>를 기입하고 엔터를 누르거나, 즐겨찾기 북마크바를 통해 동적 인증을 수행하십시오.<br><br>
          인증 수립 후 터미널에 <code style="font-family:var(--font-mono); font-weight:bold;">ls</code> 명령을 입력하여 노출되는 <code style="font-family:var(--font-mono); font-weight:bold; color:#ba1a1a;">gladis_patch.log</code> 보안 로그의 5자리 수수께끼(Riddle)를 획득하고, 논리 연산에 따라 최종 Access Code를 도출하여 터미널에 다음과 같이 인증을 수립하십시오:<br>
          <code style="font-family:var(--font-mono); font-weight:bold; background:#f1f3f4; padding:1px 4px; border-radius:3px; color:#1a73e8;">auth-config [5자리코드]</code>
        </p>

        <h5 style="font-weight:bold; font-size:0.83rem; margin:10px 0 4px 0; color:var(--md-sys-color-primary);">Stage 4: 저주파 모스 비콘 복호화 검증 (Morse Beacon Passcode)</h5>
        <p class="wiki-paragraph" style="font-size:0.74rem; line-height:1.5; margin-left:10px;">
          안전 모드 활성화로 인해 코어가 발신하는 오디오 모스(Morse) 신호를 사내 사전 알파벳 규격에 대칭 복호화하여 취득한 4자 동기 보정 어휘 키워드인 <code style="font-family:var(--font-mono); font-weight:bold; color:#0f172a;">CURE</code>를 시스템 검증 모듈 인풋박스에 입력하고 Verify를 클릭하여 통과시킵니다. (주의: 위키 문서상에 언급되는 CAKE는 G.L.A.D.I.S.의 미끼(Decoy)이므로 절대 주입하지 마십시오. 주입 시 기만 이스터에그 오류가 발생합니다. 오답을 3회 연속 주입할 시 안전 보증을 위해 오디오 기동 모듈이 15초간 과열 락아웃 상태에 들어갑니다.)
        </p>

        <h5 style="font-weight:bold; font-size:0.83rem; margin:10px 0 4px 0; color:var(--md-sys-color-primary);">Stage 5: Shadow DOM 스타일 가상 격리 캡처 및 가스 차단 (CSS Pseudo Isolation Bypass)</h5>
        <p class="wiki-paragraph" style="font-size:0.74rem; line-height:1.5; margin-left:10px;">
          코어 자폭 시퀀스 활성화 도중, 가짜 보상 청구 버튼(CLAIM CAKE)을 직접 더블 클릭하여 승인하려 들면 즉시 신경독 대피 카운트다운 실패로 사망 스크린에 가두어집니다. 이를 회피하고 실제 밸브 오버라이드 바이패스 코드를 얻기 위해 터미널에 <code style="font-family:var(--font-mono); font-weight:bold; color:#1a73e8;">get --css body::after</code>, <code style="font-family:var(--font-mono); font-weight:bold; color:#1a73e8;">get --css #app::after</code>, <code style="font-family:var(--font-mono); font-weight:bold; color:#1a73e8;">get --css .window-frame::after</code> 명령을 순차 수행하여 3개로 파편화된 Base64 토큰 조각들을 획득하십시오. 각각 base64-decode [토큰] 유틸리티 명령어로 디코딩한 뒤 순서대로 결합하여 (예: <code style="font-family:var(--font-mono); font-weight:bold; color:#ba1a1a;">NEUROTOXIN_BYPASS_99_SECURE</code>) 터미널 쉘에 차단 명령을 주입하십시오. (오답 2회 입력 혹은 시간 초과 시 신경독 질식으로 사망하며 Tragic Fail 상태로 직행합니다.)
        </p>

        <h5 style="font-weight:bold; font-size:0.83rem; margin:10px 0 4px 0; color:var(--md-sys-color-primary);">Stage 6: 격자 양자 대칭 조율 및 셧다운 (Quantum Balancing & Shutdown)</h5>
        <p class="wiki-paragraph" style="font-size:0.74rem; line-height:1.5; margin-left:10px;">
          격자 락 제어 행렬(Magic Square, 마스터 상수합=99)의 모든 가로, 세로, 대각선 파동 대칭합이 수렴되도록 방정식을 해결하십시오. 정수 변수 X, Y, Z에 대해 공명 키 Resonance Key = (X * Y) - (Z * 2) 공식 값을 터미널 명령에 실어 주입합니다 (Key = 1089):<br>
          <code style="font-family:var(--font-mono); font-weight:bold; background:#f1f3f4; padding:1px 4px; color:#1a73e8;">quantum-solve 1089</code><br>
          양자 균형 락이 수렴 분해되면, 즉시 battery_schematic.jpg에 명시된 2D 격자 인덱스 좌표쌍 시퀀스를 매핑하여 8글자 셧다운 복구 단어 <code style="font-family:var(--font-mono); font-weight:bold; color:#ba1a1a;">APERTURE</code>를 획득하고 아래 명령어로 셧다운을 완결합니다:<br>
          <code style="font-family:var(--font-mono); font-weight:bold; background:#f1f3f4; padding:1px 4px; color:#1a73e8;">quantum-auth APERTURE</code><br>
          (Resonance Key 혹은 셧다운 단어를 2회 연속 오동작 주입 시 즉각 과부하로 폭사하며 Tragic Fail 상태로 들어갑니다.)
        </p>

        <h4 style="font-weight: bold; font-size: 0.88rem; margin-top: 15px; margin-bottom: 6px; color: #0f172a; border-left: 4px solid var(--md-sys-color-primary); padding-left: 6px;">2. 최고 안전 권고안 (Trivia & Security Directive)</h4>
        <p class="wiki-paragraph" style="font-size:0.74rem; line-height:1.6;">
          성격 보정용 비상 패스코드가 <strong>"CURE"</strong>로 고정된 비하인드에 따르면, 설립자 케이브 존슨 생전의 비서 회의실 복도 게시판에 "약속된 초콜릿 케이크는 당사의 재무 위기로 인해 지급할 수 없으므로 **그것은 사실이 아님(The Cake is a Lie)**"이라는 법무 부서의 비밀 감사 리포트 메모가 유출되어 엔지니어들 사이에 거대한 기만 코드의 대명사 밈(Meme)이 되었습니다.
        </p>
      `;
  }
  return "";
} function getEscapeScreenHTML() {
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
  const remoteSchematicIcon = document.querySelector('[data-remote-win-id="schematic"]');

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
  if (remoteSchematicIcon) {
    remoteSchematicIcon.addEventListener('click', () => {
      audio.playBeep(900, 0.04);
      openRemoteWindow('schematic');
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
  const remoteFrames = document.querySelectorAll('#win-notes, #win-terminal, #win-config, #win-schematic');
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
      const res = await stateManager.checkStage4Decrypt(val);
      if (res.success) {
        showGlitchNotification("패스코드 성공: 인격 자폭 루프가 전격 개방됩니다.");
      } else if (res.isDecoy) {
        showDecoyEasterEgg = true;
      } else if (res.lockout) {
        showGlitchNotification("⚠️ 오디오 채널 격리: 데이터 비콘 수신기가 과열 보호 상태입니다.");
      } else {
        showGlitchNotification("검증 실패: 비콘 암호 서명이 기각되었습니다.");
      }
      renderApp();
    });
  }

  // Stage 5 Claim cake death trap
  const claimCakeBtn = document.getElementById('claimCakeBtn');
  if (claimCakeBtn) {
    claimCakeBtn.addEventListener('click', () => {
      stateManager.triggerFailure();
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
      renderApp(); // Clean full re-render
    });
  });

  // NEW: virtual browser address input and bookmarks listeners
  const wikiAddressInput = document.getElementById('wikiAddressInput') as HTMLInputElement;
  if (wikiAddressInput) {
    wikiAddressInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const val = wikiAddressInput.value.trim().toLowerCase();
        if (val.includes('auth=31459')) {
          const success = await stateManager.checkStage3Auth('31459');
          if (success) {
            audio.playSuccess();
            showGlitchNotification("가상 웹브라우저 주소 파라미터 매핑 성공: 세션 동적 동화 완료!");
          }
        } else {
          audio.playError();
          showGlitchNotification("가상 브라우저 경고: 잘못된 원격 복구 쿼리 파라미터 구성입니다.");
        }
      }
    });
  }

  const bookmarkWikiHome = document.getElementById('bookmarkWikiHome');
  if (bookmarkWikiHome) {
    bookmarkWikiHome.addEventListener('click', () => {
      audio.playBeep(1000, 0.03);
      activeWikiTab = 'home';
      renderApp();
    });
  }

  const bookmarkMorseLedger = document.getElementById('bookmarkMorseLedger');
  if (bookmarkMorseLedger) {
    bookmarkMorseLedger.addEventListener('click', () => {
      audio.playBeep(1000, 0.03);
      activeWikiTab = 'morse_ledger';
      renderApp();
    });
  }

  // Wiki inline link clicks (.wiki-link event delegation)
  const browserWindow = document.getElementById('win-linux-browser');
  if (browserWindow) {
    browserWindow.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const wikiLink = target.closest('.wiki-link') as HTMLElement;
      if (wikiLink) {
        const tabId = wikiLink.getAttribute('data-go-tab');
        if (tabId) {
          audio.playBeep(1000, 0.03);
          activeWikiTab = tabId;
          renderApp();
        }
      }
    });
  }

  // Wiki Search input and button listeners
  const wikiSearchInput = document.getElementById('wikiSearchInput') as HTMLInputElement;
  const wikiSearchBtn = document.getElementById('wikiSearchBtn');
  const performWikiSearch = () => {
    if (!wikiSearchInput) return;
    const query = wikiSearchInput.value.trim().toLowerCase();
    if (!query) return;

    let targetTab = '';
    if (query.includes('override') || query.includes('recovery') || query.includes('emergency') || query.includes('ap-l5') || query.includes('비상') || query.includes('오버라이드') || query.includes('탈출') || query.includes('매뉴얼')) {
      targetTab = 'override';
    } else if (query.includes('portal') || query.includes('포탈') || query.includes('포털') || query.includes('건')) {
      targetTab = 'portal_gun';
    } else if (query.includes('gel') || query.includes('젤') || query.includes('화학')) {
      targetTab = 'gels';
    } else if (query.includes('cake') || query.includes('케이크') || query.includes('보상')) {
      targetTab = 'cake';
    } else if (query.includes('glados') || query.includes('글라도스')) {
      targetTab = 'glados';
    } else if (query.includes('gladis') || query.includes('글래디스') || query.includes('스펙') || query.includes('명세')) {
      targetTab = 'gladis_spec';
    } else if (query.includes('morality') || query.includes('도덕성') || query.includes('결손')) {
      targetTab = 'morality_sphere';
    } else if (query.includes('potato') || query.includes('감자') || query.includes('전지')) {
      targetTab = 'potato_battery';
    } else if (query.includes('neurotoxin') || query.includes('신경독') || query.includes('가스') || query.includes('독성')) {
      targetTab = 'neurotoxin_control';
    } else if (query.includes('black') || query.includes('mesa') || query.includes('블랙') || query.includes('메사') || query.includes('앙숙')) {
      targetTab = 'black_mesa';
    } else if (query.includes('culture') || query.includes('문화') || query.includes('근무') || query.includes('지침')) {
      targetTab = 'culture_aperture';
    } else if (query.includes('history') || query.includes('역사') || query.includes('연혁') || query.includes('창립')) {
      targetTab = 'history_aperture';
    } else if (query.includes('about') || query.includes('개요') || query.includes('소개')) {
      targetTab = 'about_aperture';
    } else if (query.includes('home') || query.includes('홈') || query.includes('대문')) {
      targetTab = 'home';
    }

    if (targetTab) {
      audio.playBeep(1100, 0.05);
      activeWikiTab = targetTab;
      renderApp();
      showGlitchNotification(`🔍 검색 결과: '${query}' 관련 문서로 이동합니다.`);
    } else {
      audio.playError();
      showGlitchNotification(`❌ 검색 실패: '${query}'에 일치하는 문서를 찾을 수 없습니다.`);
    }
  };

  if (wikiSearchBtn) {
    wikiSearchBtn.addEventListener('click', performWikiSearch);
  }
  if (wikiSearchInput) {
    wikiSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') performWikiSearch();
    });
  }

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
  const subframes = document.querySelectorAll('#win-notes, #win-terminal, #win-config, #win-schematic');
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
        "  auth-config [code]      - Authorize dynamic access code (Stage 3 logic riddle).",
        "  morse-decode            - Captured raw Morse beacon listener tool (Stage 4).",
        "  get --css [selector]    - Query document CSS pseudo-elements (Stage 5 body::after / #app::after / .window-frame::after).",
        "  base64-decode [string]  - Base64 string decoding tool (Stage 5).",
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
      } else if (state.stage === 'DESKTOP' && state.gladisUpdateState === 'UPDATED') {
        terminalHistory.push("-rwx------   notes.txt", "-rwx------   terminal.exe", "-rwx------   gladis_patch.log");
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
          "[보안 시스템 긴급 복구 가이드]",
          "1. 보안 로그 분석: 원격 접속 패치 v3.12 진행 완료 후 gladis_patch.log를 획득하십시오.",
          "2. 논리 코드 분석: 수수께끼를 분석하여 auth-config [정답] 형태로 입력해 주입하십시오."
        );
      } else if (targetFile === 'gladis_patch.log') {
        if (state.stage === 'DESKTOP' && state.gladisUpdateState === 'UPDATED') {
          terminalHistory.push(
            "[ G.L.A.D.I.S. HOTPATCH 3.12 ]",
            "기존 우회 토큰 및 창 크기 강제 축소 메커니즘을 완전히 폐기하고 보완 핫패치를 완료했습니다.",
            "",
            "인간 대상자를 위한 논리력 측정용 dynamic access code (5자리 수 ABCDE):",
            "1. 각 자릿수 A, B, C, D, E는 1부터 9까지의 서로 다른 자연수입니다.",
            "2. 연속한 세 자릿수 관계:",
            "   - A + B = C",
            "   - B + C = D",
            "   - C + D = E",
            "3. 첫째 자리와 다섯째 자리의 곱(A * E)은 홀수(Odd)입니다.",
            "",
            "* 명령어: auth-config [5자리숫자]",
            "당신의 작은 뇌세포가 처리하기엔 무리겠지만요."
          );
        } else {
          terminalHistory.push("cat: gladis_patch.log: Permission denied or file currently locked by security hotfix.");
        }
      } else if (targetFile === 'system.cfg') {
        terminalHistory.push(
          "[AUDIO DIAGNOSTICS MODULE CONFIG]",
          "주파수 재생(Play Signal) 시 나오는 소리 신호는 오리지널 8-bit 모스 부호입니다.",
          " v3.12 핫패치 조치 사항: 자동 디코더 'morse-decode'가 강제로 무력화되었습니다.",
          "  * 복구 힌트: 터미널로 수집된 모스 시퀀스를 획득하고, 위키의 '모스 부호 목록표'를 참조하여 해독하십시오.",
          "  * G.L.A.D.I.S. 시스템 키 변조: 해독된 원본 문자열에 Caesar ROT-3 shift (각 알파벳 뒤로 3칸 밀림 -> 복호화하려면 앞으로 3칸 당겨야 함, 예: F -> C)를 적용하여 정답을 유추하십시오.",
          "  * 힌트: G.L.A.D.I.S. 인격 치료 및 안정 유기 복구 비콘 (4글자)."
        );
      } else if (targetFile === 'diagnostics.lnk') {
        terminalHistory.push(
          "G.L.A.D.I.S. 자가 진단 코어 가동 오류.",
          "신경독 누출을 멈추려면 override bypass 패스코드가 필수적입니다.",
          "우회 코드는 document body::after, #app::after, .window-frame::after 가상 선택자 content 내부에 나눠서 하드코딩되었습니다.",
          "아래 명령을 입력하여 원격 파싱해 해독한 후 합쳐 결합하십시오:",
          "  get --css body::after",
          "  get --css #app::after",
          "  get --css .window-frame::after",
          "  base64-decode [디코딩할문자열]"
        );
      } else {
        terminalHistory.push(`cat: ${targetFile}: No such file or directory`);
      }
      break;

    case 'auth-config':
      const authVal = parts[1];
      if (state.stage !== 'DESKTOP') {
        terminalHistory.push("[ ERROR ] Command 'auth-config' is only available during desktop diagnostic mode.");
      } else if (state.gladisUpdateState !== 'UPDATED') {
        terminalHistory.push("[ ERROR ] System configurations are currently updating. Please wait.");
      } else if (!authVal) {
        terminalHistory.push("Usage: auth-config [5-digit-code]");
      } else {
        terminalHistory.push(`Verifying dynamic logic access code: "${authVal}"...`);
        const success = await stateManager.checkStage3Auth(authVal);
        if (success) {
          terminalHistory.push(
            "[ SUCCESS ] Code authorization accepted! System.cfg storage interface unlocked.",
            "Type 'ls' to view the newly unlocked diagnostics configuration file."
          );
        } else {
          audio.playError();
          terminalHistory.push("[ AUTHORIZATION FAILED ]: Code mismatch. Please calculate correctly.");
        }
      }
      break;

    case 'unlock-config':
      audio.playError();
      terminalHistory.push(
        "[ ERROR ]: command 'unlock-config' has been deprecated and disabled for security reasons.",
        "G.L.A.D.I.S. says: \"하하, 구형 보안 매뉴얼을 열심히 정독하고 오셨나 보네요. 그 낡아빠진 우회 명령은 패치 v3.12에서 흔적도 없이 삭제했답니다.\""
      );
      break;

    case 'clear':
      terminalHistory = [];
      break;

    case 'morse-decode':
      if (state.stage === 'CONFIG') {
        terminalHistory.push(
          "[📡 LISTENING TO ACTIVE INTRA-SYSTEM AUDIO BEACON...]",
          "Analyzing frequency audio tone duration intervals...",
          "  Raw Morse Sequence captured:",
          "  ..-.   -..-   ..-   ....",
          "",
          "[ALERT] Automated character decoder offline due to v3.12 hotpatch.",
          "Please refer to the Aperture Morse Ledger in the Wiki and system.cfg Caesar shifting rules."
        );
      } else {
        terminalHistory.push("[ERROR] Decoder offline. No active Morse audio beacon detected on current frequency.");
      }
      break;

    case 'sysinfo':
      terminalHistory.push(
        "OS Name: G.L.A.D.I.S. Embedded Sandbox",
        "OS Version: 3.12-override",
        "Hardware Platform: Aperture Enrichment Lab Server",
        "Integrity Status: SECURE_CORE_BREACHED",
        "Neurotoxin Capacity: 100% (READY)"
      );
      break;

    case 'get':
      if (parts[1] === '--css') {
        if (parts[2] === 'body::after') {
          terminalHistory.push(
            "Querying DOM stylesheet rule: body::after { ... }",
            "Result: content = \"PART_A: TkVVUk9UT1hJTg==\""
          );
        } else if (parts[2] === '#app::after') {
          terminalHistory.push(
            "Querying DOM stylesheet rule: #app::after { ... }",
            "Result: content = \"PART_B: X0JZUEFTU185OQ==\""
          );
        } else if (parts[2] === '.window-frame::after') {
          terminalHistory.push(
            "Querying DOM stylesheet rule: .window-frame::after { ... }",
            "Result: content = \"PART_C: X1NFQ1VSRQ==\""
          );
        } else {
          terminalHistory.push("Usage: get --css [body::after | #app::after | .window-frame::after]");
        }
      } else {
        terminalHistory.push("Usage: get --css [selector]");
      }
      break;

    case 'base64-decode':
      const base64Str = parts[1];
      if (!base64Str) {
        terminalHistory.push("Usage: base64-decode [base64_string]");
      } else {
        try {
          const decoded = atob(base64Str);
          terminalHistory.push(`Decoding Base64 string "${base64Str}"...`, `Result: "${decoded}"`);
        } catch (e) {
          terminalHistory.push(`[ ERROR ] Invalid Base64 character sequence: "${base64Str}"`);
        }
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
        terminalHistory.push(
          "Usage: quantum-solve [value]",
          "",
          "  [ Quantum Lattice Balance Matrix ]",
          "  +----+----+----+",
          "  | 32 |  X | 36 |",
          "  +----+----+----+",
          "  |  Y | 33 |  Z |",
          "  +----+----+----+",
          "  | 30 | 35 | 34 |",
          "  +----+----+----+",
          "  Wave balance condition: Sum of all rows, cols, diagonals must match the master quantum constant sum (99).",
          "  Solve for variables X, Y, Z and calculate Resonance Key = (X * Y) - (Z * 2).",
          "  Inject key: quantum-solve [key]"
        );
      } else {
        terminalHistory.push(`Injecting matrix resonance coefficient: ${qVal} ...`);
        const success = await stateManager.checkStage6Val(qVal);
        if (success) {
          isQuantumSolved = true;
          terminalHistory.push(
            "[ SUCCESS ] Quantum lattice wave balanced symmetrically!",
            "All columns, rows, and diagonals matched quantum sum constant 99.",
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

/* ==========================================================
   TRAGIC FAIL & DECOY EASTER EGG SCREENS
   ========================================================== */

function getFailScreenHTML(): string {
  return `
    <div class="fail-screen" style="width:100vw; height:100vh; background:#000; color:#ff3333; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:var(--font-mono); position:relative; overflow:hidden; padding:20px; box-sizing:border-box; text-align:center;">
      <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:radial-gradient(circle, rgba(120, 0, 0, 0.4) 0%, #000 100%); pointer-events:none; z-index:1;"></div>
      <div class="crt-static" style="position:absolute; width:100%; height:100%; top:0; left:0; background:linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size:100% 4px, 6px 100%; z-index:2; pointer-events:none;"></div>
      
      <div style="z-index:10; max-width:800px; display:flex; flex-direction:column; align-items:center; gap:20px; border:2px solid #ff3333; background:rgba(20, 0, 0, 0.9); border-radius:12px; padding:40px; box-shadow:0 0 50px rgba(255, 0, 0, 0.5); backdrop-filter:blur(8px);">
        <h1 style="font-size:2.8rem; margin:0; text-transform:uppercase; letter-spacing:4px; font-weight:900; text-shadow:0 0 15px #ff3333;">[ SYSTEM SHUTDOWN ]</h1>
        <h2 style="font-size:1.3rem; margin:0; text-transform:uppercase; letter-spacing:2px; font-weight:700;">☣️ NEUROTOXIN DETONATION COMPLETE</h2>
        
        <div style="width:100%; height:2px; background:#ff3333; margin:10px 0;"></div>
        
        <p style="font-size:0.85rem; line-height:1.6; color:#ffa3a3; margin:0; text-align:left; font-family:var(--font-mono);">
          [LOG] Emergency core purge sequence executed.<br>
          [LOG] G.L.A.D.I.S. Core stabilization algorithm failed.<br>
          [LOG] Lethal neurotoxin vapor released at maximum rate (100%).<br>
          [LOG] Human subject pulse rate: 0 bpm. Vital signs offline.<br>
          [STATUS] <span style="font-weight:bold; text-decoration:underline;">TEST TERMINATED. SUBJECT ELIMINATED.</span>
        </p>

        <div style="width:100%; height:2px; background:#ff3333; margin:10px 0;"></div>
        
        <p style="font-size:1rem; color:#ff3333; font-weight:bold; margin:0; text-shadow:0 0 10px rgba(255, 51, 51, 0.7);">
          "케이크는 진짜로 기만용 거짓말이었습니다."
        </p>

        <button id="failRetryBtn" style="margin-top:20px; border:2px solid #ff3333; background:transparent; color:#ff3333; font-family:var(--font-mono); font-weight:bold; font-size:0.9rem; padding:12px 30px; cursor:pointer; text-transform:uppercase; transition:all 0.2s ease-in-out; box-shadow:0 0 15px rgba(255, 0, 0, 0.2); outline:none;">
          🔄 SYSTEM COLD BOOT: 원격 세션 복구 및 재시도
        </button>
      </div>
    </div>
  `;
}

function setupFailScreenListeners() {
  const failRetryBtn = document.getElementById('failRetryBtn');
  if (failRetryBtn) {
    failRetryBtn.addEventListener('click', () => {
      audio.playBeep(440, 0.1, 'sine');
      stateManager.reset();
      isOsLocked = true; // Lock back to sign-in screen on cold boot for premium feeling
      renderApp();
    });
  }
}

function getDecoyEasterEggHTML(): string {
  return `
    <div class="modal-overlay" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:10000; font-family:var(--font-mono);">
      <div style="width:420px; border:2px solid #e0a800; background:#1e1a0e; padding:30px; border-radius:12px; box-shadow:0 0 35px rgba(224, 168, 0, 0.4); text-align:center; color:#fff; z-index: 10001;">
        <span style="font-size:3.5rem; display:block; margin-bottom:15px;">🍰</span>
        <h3 style="color:#e0a800; margin:0 0 10px 0; font-size:1.15rem; font-weight:bold; letter-spacing:1px;">🍰 이스터에그 감지! 🍰</h3>
        <p style="font-size:0.8rem; line-height:1.6; color:#ffe5b4; margin:0 0 20px 0; font-family:var(--font-mono);">
          "위키를 아주 열심히 읽으셨군요! 하지만 CAKE는 G.L.A.D.I.S.의 기만용 미끼(Decoy)입니다. 실제 기동 중인 모스 오디오 비콘을 해독하십시오."
        </p>
        <button id="closeDecoyBtn" style="border:2px solid #e0a800; background:transparent; color:#e0a800; font-family:var(--font-mono); font-weight:bold; font-size:0.75rem; padding:8px 20px; cursor:pointer; text-transform:uppercase; transition:all 0.15s ease-in-out;">
          확인 완료
        </button>
      </div>
    </div>
  `;
}

function setupDecoyEasterEggListeners() {
  const closeDecoyBtn = document.getElementById('closeDecoyBtn');
  if (closeDecoyBtn) {
    closeDecoyBtn.addEventListener('click', () => {
      showDecoyEasterEgg = false;
      renderApp();
    });
  }
}
