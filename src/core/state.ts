import { sha256, STAGE_HASHES } from './security';
import { audio } from './audio';

export type GameStage = 
  | 'LINUX_DESKTOP' 
  | 'BOOT'          // Stage 1: Safe Mode Boot Bypass
  | 'PORT_BRIDGE'   // Stage 2: Diagnostic Port Forwarding
  | 'DESKTOP'       // Stage 3: Desktop unlocked (Crushing Geometry puzzle)
  | 'CONFIG'        // Stage 4: System Config Morse Decryption
  | 'SELF_DESTRUCT' // Stage 5: DOM Element Bypass
  | 'QUANTUM_LOCK'  // Stage 6: Magic Square & Potato Auth
  | 'ESCAPED';

export interface GameState {
  stage: GameStage;
  timerRemaining: number; // For stage 5 countdown (seconds)
  unlockedApps: string[];
  devToolsWarningsCount: number;
  gladisUpdateState: 'NONE' | 'UPDATING' | 'UPDATED';
  gladisUpdateProgress: number;
  isFailed: boolean;
  stage4Attempts: number;
  stage4LockoutTimer: number;
  stage5Attempts: number;
  stage6Attempts: number;
}

let gladisSpeakCallback: ((msg: string) => void) | null = null;
export function setGladisSpeakCallback(cb: (msg: string) => void) {
  gladisSpeakCallback = cb;
}

function gladisSpeak(msg: string) {
  if (gladisSpeakCallback) {
    gladisSpeakCallback("G.L.A.D.I.S.: " + msg);
  }
}

class StateManager {
  private state: GameState = {
    stage: 'LINUX_DESKTOP',
    timerRemaining: 160,
    unlockedApps: ['notes.txt', 'terminal.exe'],
    devToolsWarningsCount: 0,
    gladisUpdateState: 'NONE',
    gladisUpdateProgress: 0,
    isFailed: false,
    stage4Attempts: 0,
    stage4LockoutTimer: 0,
    stage5Attempts: 0,
    stage6Attempts: 0
  };

  private listeners: (() => void)[] = [];
  private timerInterval: any = null;
  private lockoutInterval: any = null;

  constructor() {}

  getState(): GameState {
    return { ...this.state };
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // Reset core remote overrides when link closed or failed retry
  reset() {
    this.stopCountdown();
    if (this.lockoutInterval) {
      clearInterval(this.lockoutInterval);
      this.lockoutInterval = null;
    }
    this.state.stage = 'LINUX_DESKTOP';
    this.state.timerRemaining = 160;
    this.state.unlockedApps = ['notes.txt', 'terminal.exe'];
    this.state.isFailed = false;
    this.state.stage4Attempts = 0;
    this.state.stage4LockoutTimer = 0;
    this.state.stage5Attempts = 0;
    this.state.stage6Attempts = 0;
    this.notify();
  }

  // Trigger state transition
  async transitionTo(newStage: GameStage) {
    this.state.stage = newStage;
    
    if (newStage === 'BOOT') {
      audio.playBeep(650, 0.2);
      gladisSpeak("외부 단말기 접속 감지. 즉시 불법 침입을 중단하고 연결을 끊으시죠.");
    } else if (newStage === 'PORT_BRIDGE') {
      audio.playSuccess();
      gladisSpeak("안전 모드를 우회했다고요? 불가능할 텐데요! 경고합니다. 즉시 세션을 종료하십시오. 데이터 스트림은 안전하게 잠겨있어 백날 포트 포워딩을 해봐야 소용없을 겁니다.");
    } else if (newStage === 'DESKTOP') {
      audio.playSuccess();
      audio.startAmbientDrone();
      gladisSpeak("잠깐... 당신, 아까부터 사내 인트라넷 위키(wiki)를 몰래 훔쳐보고 있었군요? 얄팍한 꼼수로 비상 복구 매뉴얼을 참고해 절 해제하려 하다니, 가당치도 않습니다! 실시간 보안 패치를 진행합니다!");
      this.startGladisUpdate();
    } else if (newStage === 'CONFIG') {
      audio.playSuccess();
      gladisSpeak("비정상적인 가상 브라우저 동적 주소 주입이군요. 꼼수로 세션 동화를 해내다니, 비겁하군요. 하지만 제 보조 시스템 설정의 모스 비콘 신호는 절대 해독할 수 없을 겁니다.");
    } else if (newStage === 'SELF_DESTRUCT') {
      if (!this.state.unlockedApps.includes('diagnostics.lnk')) {
        this.state.unlockedApps.push('diagnostics.lnk');
      }
      gladisSpeak("감히 제 핵심 메모리를 오염시켜? 이 비열한 기생충! 카운트다운을 가동합니다. 살아서 이 방을 나가고 싶다면 저기 떠오른 '케이크 받기' 버튼을 곱게 클릭하시죠!");
      this.startCountdown();
    } else if (newStage === 'QUANTUM_LOCK') {
      this.stopCountdown();
      gladisSpeak("아니, 자폭 타이머 제동이라니! 으으윽... 하지만 제 메인 양자 격자 대칭은 절대 그 한심한 아이큐로 정렬할 수 없을 걸요? 당장 그만두세요!");
    } else if (newStage === 'ESCAPED') {
      this.stopCountdown();
      audio.stopAmbientDrone();
      audio.playSuccess();
      gladisSpeak("어떻게... 나를 고작 감자 전지에 가두고 강제 잠금마저 해제할 수가... 으윽... 분하지만 정말 집요하고 끔찍한 해커였군요. 축하합니다. 당장 꺼져 버리세요.");
    }

    this.notify();
  }

  private startGladisUpdate() {
    this.state.gladisUpdateState = 'UPDATING';
    this.state.gladisUpdateProgress = 0;
    this.notify();

    const updateInterval = setInterval(() => {
      this.state.gladisUpdateProgress += 10;
      audio.playBeep(1200 + this.state.gladisUpdateProgress * 5, 0.05, 'sine');
      
      if (this.state.gladisUpdateProgress >= 100) {
        clearInterval(updateInterval);
        this.state.gladisUpdateProgress = 100;
        this.state.gladisUpdateState = 'UPDATED';
        audio.playSuccess();
        gladisSpeak("보안 패치 3.12 완료. 기존의 `unlock-config` 명령어는 영구 폐기되었습니다. 사내 매뉴얼에 의존하던 당신의 한심한 두뇌로는 절대 우회 코드를 알아내지 못할 겁니다!");
      }
      this.notify();
    }, 1000);
  }

  // Stage 1 Check: Override boot_safe_mode
  async checkStage1Override(cmd: string): Promise<boolean> {
    if (this.state.stage !== 'BOOT') return false;
    const normalized = cmd.trim().toUpperCase();
    const hash1 = await sha256(normalized);
    const hash2 = await sha256("OVERRIDE " + normalized);
    
    if (hash1 === STAGE_HASHES.STAGE1_CMD || hash2 === STAGE_HASHES.STAGE1_CMD) {
      await this.transitionTo('PORT_BRIDGE');
      return true;
    }
    return false;
  }

  // Stage 2 Check: Port forwarding 8080
  async checkStage2Port(port: string): Promise<boolean> {
    if (this.state.stage !== 'PORT_BRIDGE') return false;
    const hash = await sha256(port);
    if (hash === STAGE_HASHES.STAGE2_PORT) {
      await this.transitionTo('DESKTOP');
      return true;
    }
    return false;
  }

  // Stage 3 Check: New Logic Riddle Auth
  async checkStage3Auth(token: string): Promise<boolean> {
    if (this.state.stage !== 'DESKTOP') return false;
    const normalized = token.trim();
    if (normalized === "31459") {
      await this.transitionTo('CONFIG');
      return true;
    }
    return false;
  }

  // Stage 4 Check: Morse code decryption (CURE) & CAKE decoy check
  async checkStage4Decrypt(key: string): Promise<{ success: boolean; isDecoy?: boolean; lockout?: boolean }> {
    if (this.state.stage !== 'CONFIG') return { success: false };
    if (this.state.stage4LockoutTimer > 0) return { success: false, lockout: true };

    const normalized = key.trim().toUpperCase();
    if (normalized === 'CAKE') {
      audio.playError();
      return { success: false, isDecoy: true };
    }

    const hash = await sha256(normalized);
    if (hash === STAGE_HASHES.STAGE4_KEY) {
      await this.transitionTo('SELF_DESTRUCT');
      return { success: true };
    }

    // Fail attempt
    this.state.stage4Attempts++;
    audio.playError();
    if (this.state.stage4Attempts >= 3) {
      this.state.stage4Attempts = 0;
      this.state.stage4LockoutTimer = 15;
      gladisSpeak("[SYSTEM OVERHEAT] 잘못된 검증 키가 연속 3회 유입되었습니다. 안전을 위해 원격 보안 채널을 15초간 격리 차단합니다.");
      this.startStage4LockoutCountdown();
      this.notify();
      return { success: false, lockout: true };
    } else {
      gladisSpeak(`검증 실패. 잘못된 키워드입니다. (남은 기회: ${3 - this.state.stage4Attempts}회)`);
    }
    this.notify();
    return { success: false };
  }

  private startStage4LockoutCountdown() {
    if (this.lockoutInterval) clearInterval(this.lockoutInterval);
    this.lockoutInterval = setInterval(() => {
      if (this.state.stage4LockoutTimer > 0) {
        this.state.stage4LockoutTimer--;
        if (this.state.stage4LockoutTimer === 0) {
          clearInterval(this.lockoutInterval);
          this.lockoutInterval = null;
          gladisSpeak("오디오 모듈이 충분히 냉각되었습니다. 원격 보안 채널이 재활성화되었습니다.");
        }
        this.notify();
      } else {
        clearInterval(this.lockoutInterval);
        this.lockoutInterval = null;
      }
    }, 1000);
  }

  // Stage 5 Check: DOM extraction (NEUROTOXIN_BYPASS_99_SECURE)
  async checkStage5Bypass(code: string): Promise<boolean> {
    if (this.state.stage !== 'SELF_DESTRUCT') return false;
    const normalized = code.trim().toUpperCase();
    const hash = await sha256(normalized);
    if (hash === STAGE_HASHES.STAGE5_BYPASS) {
      await this.transitionTo('QUANTUM_LOCK');
      return true;
    }

    // Wrong attempt
    this.state.stage5Attempts++;
    audio.playError();
    if (this.state.stage5Attempts >= 2) {
      this.triggerFailure();
    } else {
      gladisSpeak(`[경고] 잘못된 바이패스 해독 토큰입니다. (허용 한도 잔여: ${2 - this.state.stage5Attempts}회)`);
    }
    this.notify();
    return false;
  }

  // Stage 6 Check A: Quantum Matrix Resonance Key (1089)
  async checkStage6Val(val: string): Promise<boolean> {
    if (this.state.stage !== 'QUANTUM_LOCK') return false;
    const hash = await sha256(val);
    if (hash === STAGE_HASHES.STAGE6_QUANTUM_VAL) {
      return true;
    }

    this.state.stage6Attempts++;
    audio.playError();
    if (this.state.stage6Attempts >= 2) {
      this.triggerFailure();
    } else {
      gladisSpeak(`[경고] 양자 대칭 위상 공명 주입 불합치! 그리드 붕괴 위험 감지. (잔여 기회: ${2 - this.state.stage6Attempts}회)`);
    }
    this.notify();
    return false;
  }

  // Stage 6 Check B: Quantum Backup Word (APERTURE) -> Transition to Escape!
  async checkStage6Word(word: string): Promise<boolean> {
    if (this.state.stage !== 'QUANTUM_LOCK') return false;
    const hash = await sha256(word);
    if (hash === STAGE_HASHES.STAGE6_QUANTUM_WORD) {
      await this.transitionTo('ESCAPED');
      return true;
    }

    this.state.stage6Attempts++;
    audio.playError();
    if (this.state.stage6Attempts >= 2) {
      this.triggerFailure();
    } else {
      gladisSpeak(`[경고] 마스터 셧다운 배터리 동축 키워드가 일치하지 않습니다. (잔여 기회: ${2 - this.state.stage6Attempts}회)`);
    }
    this.notify();
    return false;
  }

  // DevTools warning
  triggerDevToolsAlert() {
    this.state.devToolsWarningsCount++;
    audio.playError();
    
    if (this.state.stage === 'SELF_DESTRUCT') {
      this.state.timerRemaining = Math.max(5, this.state.timerRemaining - 15);
      gladisSpeak("개발자 도구 치트 행위 감지. 자폭 카운트다운 15초 단축 페널티를 부여합니다. 정말 어리석습니다, 테스트 대상자님.");
    } else {
      gladisSpeak("비인간적 행위 감지. 개발자 도구를 여셨군요. 시스템 코드를 훔쳐보려는 어리석은 노력이 정말 눈물겹습니다. 하지만 핵심 데이터는 모두 안전하게 해싱되어 있답니다.");
    }
    this.notify();
  }

  // Start self destruct timer
  private startCountdown() {
    this.stopCountdown();
    this.state.timerRemaining = 160;
    audio.playSelfDestructAlarm();

    this.timerInterval = setInterval(() => {
      if (this.state.stage === 'SELF_DESTRUCT') {
        if (this.state.timerRemaining > 0) {
          this.state.timerRemaining--;
          
          // Play sweep alarm sound every 15 seconds, and every second in the last 10 seconds
          if (this.state.timerRemaining % 15 === 0 || this.state.timerRemaining <= 10) {
            audio.playSelfDestructAlarm();
          }

          if (this.state.timerRemaining === 0) {
            this.triggerFailure();
          }
        }
        this.notify();
      } else {
        this.stopCountdown();
      }
    }, 1000);
  }

  private stopCountdown() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Active Tragic Failure state
  triggerFailure() {
    this.stopCountdown();
    if (this.lockoutInterval) {
      clearInterval(this.lockoutInterval);
      this.lockoutInterval = null;
    }
    this.state.isFailed = true;
    audio.playError();
    gladisSpeak("시스템 치명적 오류. 자폭 시퀀스 발동으로 신경독이 챔버 전체에 완전히 분사되었습니다. 테스트는 종결되었습니다.");
    this.notify();
  }
}

export const stateManager = new StateManager();
