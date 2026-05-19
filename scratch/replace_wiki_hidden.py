import os
import re

file_path = r"c:\Users\erida\OneDrive\Documents\repo\antigravity\web-escape\src\main.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove the "⚠️ 비상 복구 규격" category and items from the sidebar navigation completely
old_sidebar_emergency = """                <div style="font-size:0.62rem; color:#475569; font-weight:bold; padding:8px 12px 2px 12px; text-transform:uppercase; letter-spacing:0.5px;">⚠️ 비상 복구 규격</div>
                <button class="wiki-nav-btn ${activeWikiTab === 'neurotoxin_control' ? 'active' : ''}" data-tab-id="neurotoxin_control" style="padding:6px 12px; font-size:0.75rem; padding-left:20px; color:#ba1a1a;">신경독 통제 지침</button>
                <button class="wiki-nav-btn ${activeWikiTab === 'override' ? 'active' : ''}" data-tab-id="override" style="padding:6px 12px; font-size:0.75rem; padding-left:20px; color:#1a73e8; font-weight:bold;">비상 오버라이드 규범</button>"""

if old_sidebar_emergency in content:
    content = content.replace(old_sidebar_emergency, "")
    print("Success: Removed Emergency category from wiki sidebar!")
else:
    # Fuzzy replace
    content, count = re.subn(r'<div style="font-size:0\.62rem; color:#475569; font-weight:bold; padding:8px 12px 2px 12px; text-transform:uppercase; letter-spacing:0\.5px;">⚠️ 비상 복구 규격</div>\s*<button class="wiki-nav-btn.*?</button>\s*<button class="wiki-nav-btn.*?</button>', "", content, flags=re.DOTALL)
    print(f"Fuzzy sidebar emergency count: {count}")

# 2. Remove the red warning block from the Wiki Home
old_wiki_home_warning = """        <div style="background:#ffdad6; border:1px solid #ba1a1a; padding:12px; border-radius:6px; margin-bottom:16px; color:#410002; font-size:0.75rem; line-height:1.5; display:flex; gap:10px; align-items:center;">
          <span style="font-size:1.5rem; user-select:none;">☣️</span>
          <div>
            <strong style="color:#ba1a1a;">🚨 [경보] 메인 코어 GLaDIS 자폭 안전 격벽 긴급 기동 프로토콜 안내</strong><br>
            현재 시스템 인격 제어부 이상으로 인해 연구소 내 신경독 방출 밸브 오버랩 격리가 활성화되었습니다. 즉각 원격 셧다운 시퀀스를 수립하십시오. 콜드 리부트와 상세 6단계 세부 회복 공정은 <span class="wiki-link" data-go-tab="override" style="font-weight:bold; color:#ba1a1a;">GLaDIS 비상 오버라이드 규범 (AP-L5-RECOVERY)</span>을 필히 복호화 참조하십시오.
          </div>
        </div>

        <h3 class="wiki-title-large" style="margin-top:0;">🏠 에퍼쳐 사이언스 인트라넷 위키 포털 (Aperture Science Wiki Portal)</h3>"""

new_wiki_home_warning = """        <h3 class="wiki-title-large" style="margin-top:0;">🏠 에퍼쳐 사이언스 인트라넷 위키 포털 (Aperture Science Wiki Portal)</h3>"""

if old_wiki_home_warning in content:
    content = content.replace(old_wiki_home_warning, new_wiki_home_warning)
    print("Success: Removed red warning block from Wiki Home!")
else:
    # Fuzzy replace
    content, count = re.subn(r'<div style="background:#ffdad6; border:1px solid #ba1a1a; padding:12px; border-radius:6px; margin-bottom:16px; color:#410002; font-size:0\.75rem; line-height:1\.5; display:flex; gap:10px; align-items:center;">.*?</h3>', new_wiki_home_warning, content, flags=re.DOTALL)
    print(f"Fuzzy wiki home warning count: {count}")

# 3. Add hidden footnote at the bottom of case 'culture_aperture':
old_culture_case = """    case 'culture_aperture':
      return `
        <h3 class="wiki-title-large">📋 에퍼쳐 사이언스 사내 근무 지침서 (HR-GUIDE-L4)</h3>
        <p class="wiki-paragraph" style="font-size:0.78rem;">
          본 문서는 에퍼쳐 사이언스 사내 직무 이행 효율성 극대화를 위해 법무 부서에서 기획한 강력한 내부 직원용 의무 및 패널티 시스템 규격입니다.
        </p>

        <h4 style="font-size:0.85rem; margin-top:12px; margin-bottom:6px; color:#ba1a1a; border-left:3px solid #ba1a1a; padding-left:6px;">📍 사내 핵심 의무 및 패널티 (Mandatory Directives)</h4>
        <div class="wiki-code-block" style="font-size:0.72rem; line-height:1.5;">
          [규격 14]: 젤 시식 엄격 금지 (Do NOT Eat Gels)
          * 반발성 젤(Repulsion Gel) 혹은 가속성 젤(Propulsion Gel)을 탕비실 요거트로 오인하여 섭취할 경우, 위장이 초당 12,000회 진동하여 영양 흡수가 불가능해지며 영구 골격 상실 증후군에 걸립니다. 적발 즉시 잔여 보수를 전액 압수하고 소화 시스템 교체 동역학 실험체로 승격됩니다.

          [규격 62]: 라이벌 기업 발설 시 징계 (Strict Censorship)
          * 사내에서 단어 "블랙 메사(Black Mesa)" 혹은 "블랙"과 "메사"의 연쇄 연상 단어를 발화, 작문, 파싱하는 임직원은 15%의 급여 삭감과 함께 4200m 지하 소금 먼지 청소 봉사 90일에 처해집니다. 그 기생충들의 언급은 에퍼쳐의 신성한 과학 기품을 훼손시킵니다.

          [규격 99]: 약속된 과학 보상물 케이크 관련 (Enrichment Cake)
          * 피실험자와 하급 연구 부하들에게 dangling(제시 유혹)용으로 세팅된 케이크는 철저히 부서 승인을 받아야 합니다. 비공인 케이크 제작용 향료 및 화학 믹싱 행위는 엄단하며, "케이크는 거짓말(The Cake is a Lie)"이라는 붉은 낙서를 벽면에 도포하는 자는 즉각 기만 방지 심리학 테스트의 강제 피실험자로 전환됩니다.
        </div>
      `;"""

new_culture_case = """    case 'culture_aperture':
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
      `;"""

if old_culture_case in content:
    content = content.replace(old_culture_case, new_culture_case)
    print("Success: Hidden override guide inside HR policy footnote!")
else:
    # Fuzzy replace culture case
    content, count = re.subn(r'case \'culture_aperture\':.*?GUIDE-L4.*?Enrichment Cake.*?/div>\s*`;', new_culture_case, content, flags=re.DOTALL)
    print(f"Fuzzy culture case count: {count}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Hiding and warning removal script completed successfully!")
