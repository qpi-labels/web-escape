/**
 * G.L.A.D.I.S. Core Security & Anti-Cheat Module
 * Handles DevTools detection, input blocking, and cryptographic hash verification.
 */

// Simple SHA-256 implementation using Web Crypto API
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message.trim().toUpperCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Stage target hashes (all strings are normalized to UPPERCASE and trimmed before hashing)
export const STAGE_HASHES = {
  STAGE1_CMD: "362f693824526a884542fc87af05f54ce32b76c3fbc237db1321f3e08c5fefe6", // "BOOT_SAFE_MODE"
  STAGE2_PORT: "6c237681e70921603a306be9a1a5d9833fce5c1e268f52b1650970eaad0dce21", // "8080"
  STAGE3_AUTH: "6938cc50acbcaf05413529962cd17de53352bfa60c61e3163de6faa4e7d3b162", // "AUTH_TOKEN_RESIZE_MD3"
  STAGE4_KEY: "8c38b376fdf45f4a7ca56a6b1062add530646a45ec959d059b1777edf00a37a5", // "CAKE"
  STAGE5_BYPASS: "5b4091630954a3185c7b01da686041acdf700437590f84bbe6c676a882225b27", // "NEUROTOXIN_BYPASS_99"
  STAGE6_QUANTUM_VAL: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d", // "5"
  STAGE6_QUANTUM_WORD: "49b42d8ff02a373707d532df7e896651d786f4b948b18cc9488aecb30db84584" // "POTATO"
};

type DevToolsCallback = (isOpen: boolean) => void;
let devToolsOpen = false;
let devToolsCallbacks: DevToolsCallback[] = [];

export function onDevToolsChange(callback: DevToolsCallback) {
  devToolsCallbacks.push(callback);
}

function notifyDevToolsChange(isOpen: boolean) {
  if (devToolsOpen !== isOpen) {
    devToolsOpen = isOpen;
    devToolsCallbacks.forEach(cb => cb(isOpen));
  }
}

/**
 * Detects if DevTools is open using two methods:
 * 1. Window dimensions (works when docked)
 * 2. Debugger performance latency (works when undocked/docked)
 */
export function initSecurityAndAntiCheat() {
  // Prevent context menu (Right-click)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    if (target.closest('.linux-icon') || target.closest('.linux-desktop') || target.closest('.window-frame')) {
      return; // Handled by custom context menu
    }
    triggerGladisMocking("우클릭 감지됨: 비인가 외부 탐색이 감지되었습니다. 정말 애처롭군요.");
  });

  // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
      (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
    ) {
      e.preventDefault();
      triggerGladisMocking("G.L.A.D.I.S System Core : 현 시간부로 임직원의 모든 외부 인터페이스 접근이 차단됩니다.");
      notifyDevToolsChange(true);
    }
  });

  // Method 1: Check window geometry differences
  const threshold = 160;
  const checkGeometry = () => {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    // Windows titlebar/borders take some space, so threshold is high
    const isDocked = widthDiff > threshold || heightDiff > threshold;
    if (isDocked) {
      notifyDevToolsChange(true);
    }
  };

  // Method 2: Debugger check (runs periodically)
  setInterval(() => {
    const startTime = performance.now();
    // This debugger statement will cause a minor delay if DevTools is open and active
    debugger;
    const endTime = performance.now();

    if (endTime - startTime > 100) {
      notifyDevToolsChange(true);
    }
  }, 1000);

  // Monitor window resize to trigger geometry check
  window.addEventListener('resize', checkGeometry);
  // Initial check
  checkGeometry();
}

// Global listener hook for G.L.A.D.I.S. messages
let gladisMockingCallback: ((msg: string) => void) | null = null;
export function setGladisMockingCallback(cb: (msg: string) => void) {
  gladisMockingCallback = cb;
}

function triggerGladisMocking(message: string) {
  if (gladisMockingCallback) {
    gladisMockingCallback(message);
  }
}
