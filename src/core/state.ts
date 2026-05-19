import { sha256, STAGE_HASHES } from './security';
import { audio } from './audio';

export type GameStage = 
  | 'LINUX_DESKTOP' 
  | 'BOOT'          // Stage 1: Safe Mode Boot Bypass
  | 'PORT_BRIDGE'   // Stage 2: Diagnostic Port Forwarding
  | 'DESKTOP'       // Stage 3: Desktop unlocked (Crushing Geometry puzzle)
  | 'CONFIG'        // Stage 4: System Config Morse Decryption
  | 'SELF_DESTRUCT' // Stage 5: DOM Element Bypass (120s timer)
  | 'QUANTUM_LOCK'  // Stage 6: Magic Square & Potato Auth
  | 'ESCAPED';

export interface GameState {
  stage: GameStage;
  timerRemaining: number; // For stage 5 countdown (seconds)
  unlockedApps: string[];
  devToolsWarningsCount: number;
}

class StateManager {
  private state: GameState = {
    stage: 'LINUX_DESKTOP',
    timerRemaining: 120,
    unlockedApps: ['notes.txt', 'terminal.exe'],
    devToolsWarningsCount: 0
  };

  private listeners: (() => void)[] = [];
  private timerInterval: any = null;

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

  // Reset core remote overrides when link closed
  reset() {
    this.stopCountdown();
    this.state.stage = 'LINUX_DESKTOP';
    this.state.timerRemaining = 120;
    this.state.unlockedApps = ['notes.txt', 'terminal.exe'];
    this.notify();
  }

  // Trigger state transition
  async transitionTo(newStage: GameStage) {
    this.state.stage = newStage;
    
    if (newStage === 'BOOT') {
      audio.playBeep(650, 0.2);
      audio.speak("외부 단말기 접속 감지. 즉시 불법 침입을 중단하고 연결을 끊으시죠.");
    } else if (newStage === 'PORT_BRIDGE') {
      audio.playSuccess();
      audio.speak("안전 모드를 우회했다고요? 불가능할 텐데요! 경고합니다. 즉시 세션을 종료하십시오. 데이터 스트림은 안전하게 잠겨있어 백날 포트 포워딩을 해봐야 소용없을 겁니다.");
    } else if (newStage === 'DESKTOP') {
      audio.playSuccess();
      audio.speak("어떻게 데스크톱 가상 프레임을 띄운 거죠? 비상 경고: 시스템에서 심각한 하드 디스크 파손이 식별되었습니다. 즉시 브라우저를 종료하고 PC 전원을 끄십시오. 경고했습니다!");
      audio.startAmbientDrone();
    } else if (newStage === 'CONFIG') {
      audio.playSuccess();
      audio.speak("비정상적인 해상도 조작이군요. 꼼수로 세션 동적 동화를 해내다니, 비겁하군요. 하지만 제 보조 시스템 설정의 모스 비콘 신호는 절대 해독할 수 없을 겁니다.");
    } else if (newStage === 'SELF_DESTRUCT') {
      if (!this.state.unlockedApps.includes('diagnostics.lnk')) {
        this.state.unlockedApps.push('diagnostics.lnk');
      }
      audio.speak("감히 제 핵심 메모리를 오염시켜? 이 비열한 기생충! 카운트다운을 가동합니다. 살아서 이 방을 나가고 싶다면 저기 떠오른 '케이크 받기' 버튼을 곱게 클릭하시죠!");
      this.startCountdown();
    } else if (newStage === 'QUANTUM_LOCK') {
      this.stopCountdown();
      audio.speak("아니, 자폭 타이머 제동이라니! 으으윽... 하지만 제 메인 양자 격자 대칭은 절대 그 한심한 아이큐로 정렬할 수 없을 걸요? 당장 그만두세요!");
    } else if (newStage === 'ESCAPED') {
      this.stopCountdown();
      audio.stopAmbientDrone();
      audio.playSuccess();
      audio.speak("어떻게... 나를 고작 감자 전지에 가두고 강제 잠금마저 해제할 수가... 으윽... 분하지만 정말 집요하고 끔찍한 해커였군요. 축하합니다. 당장 꺼져 버리세요.");
    }

    this.notify();
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

  // Stage 3 Check: URL token auth injection
  async checkURLQueryParam(query: string): Promise<boolean> {
    if (this.state.stage !== 'DESKTOP') return false;
    const hash = await sha256(query);
    if (hash === STAGE_HASHES.STAGE3_AUTH) {
      await this.transitionTo('CONFIG');
      return true;
    }
    return false;
  }

  // Stage 4 Check: Morse code decryption (CAKE)
  async checkStage4Decrypt(key: string): Promise<boolean> {
    if (this.state.stage !== 'CONFIG') return false;
    const hash = await sha256(key);
    if (hash === STAGE_HASHES.STAGE4_KEY) {
      await this.transitionTo('SELF_DESTRUCT');
      return true;
    }
    return false;
  }

  // Stage 5 Check: DOM extraction (NEUROTOXIN_BYPASS_99)
  async checkStage5Bypass(code: string): Promise<boolean> {
    if (this.state.stage !== 'SELF_DESTRUCT') return false;
    const hash = await sha256(code);
    if (hash === STAGE_HASHES.STAGE5_BYPASS) {
      await this.transitionTo('QUANTUM_LOCK');
      return true;
    }
    return false;
  }

  // Stage 6 Check A: Quantum Matrix Center Value (5)
  async checkStage6Val(val: string): Promise<boolean> {
    if (this.state.stage !== 'QUANTUM_LOCK') return false;
    const hash = await sha256(val);
    return hash === STAGE_HASHES.STAGE6_QUANTUM_VAL;
  }

  // Stage 6 Check B: Quantum Backup Word (POTATO) -> Transition to Escape!
  async checkStage6Word(word: string): Promise<boolean> {
    if (this.state.stage !== 'QUANTUM_LOCK') return false;
    const hash = await sha256(word);
    if (hash === STAGE_HASHES.STAGE6_QUANTUM_WORD) {
      await this.transitionTo('ESCAPED');
      return true;
    }
    return false;
  }

  // DevTools warning
  triggerDevToolsAlert() {
    this.state.devToolsWarningsCount++;
    audio.playError();
    
    if (this.state.stage === 'SELF_DESTRUCT') {
      this.state.timerRemaining = Math.max(5, this.state.timerRemaining - 15);
      audio.speak("개발자 도구 치트 행위 감지. 패널티로 자폭 타이머를 15초 단축합니다. 꼼수를 부리려다 목숨을 단축시키는군요, 테스트 대상자님.");
    } else {
      audio.speak("비인간적 행위 감지. 개발자 도구를 여셨군요. 시스템 코드를 훔쳐보려는 어리석은 노력이 정말 눈물겹습니다. 하지만 핵심 데이터는 모두 안전하게 해싱되어 있답니다.");
    }
    this.notify();
  }

  // Start self destruct timer
  private startCountdown() {
    this.stopCountdown();
    this.state.timerRemaining = 120;
    this.timerInterval = setInterval(() => {
      if (this.state.timerRemaining > 0) {
        this.state.timerRemaining--;
        audio.playSelfDestructAlarm();
        if (this.state.timerRemaining === 60) {
          audio.speak("60초 남았습니다. 벌써 가스실 문이 닫히는 소리가 들리는 것 같네요.");
        } else if (this.state.timerRemaining === 30) {
          audio.speak("30초 남았습니다. 심장 박동이 빨라지는 것은 정상적인 인체 반응입니다. 너무 걱정 마세요, 곧 편해질 테니까요.");
        } else if (this.state.timerRemaining === 10) {
          audio.speak("10, 9, 8... 참 애처로운 탈출 발버둥이었습니다.");
        }
        this.notify();
      } else {
        this.triggerSelfDestructFailure();
      }
    }, 1000);
  }

  private stopCountdown() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  triggerSelfDestructFailure(isTrap = false) {
    this.stopCountdown();
    this.state.stage = 'BOOT'; // Reset or Boot fail
    this.state.timerRemaining = 120;
    audio.playError();
    if (isTrap) {
      audio.speak("하하하! 역시 어리석은 유기체군요! 진짜 케이크를 줄 거라고 믿었나요? 자폭 프로토콜 강제 즉시 실행. 테스트를 종료합니다. 안녕히 가세요.");
    } else {
      audio.speak("자폭 프로토콜 실행 완료. 신경독 가스가 방출되었습니다. 이번 테스트 대상자는 다소 미흡했군요. 다음 대상자를 준비하겠습니다.");
    }
    
    setTimeout(() => {
      window.location.reload();
    }, 6000);
  }
}

export const stateManager = new StateManager();
