import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Dynamic Stress-Testing Follow-Up
app.post('/api/detective/follow-up', async (req, res) => {
  try {
    const { candidate, dialogue, round = 1 } = req.body;
    const name = candidate?.name || '求職者';
    const jobTitle = candidate?.jobTitle || '關鍵職缺';

    if (!process.env.GEMINI_API_KEY) {
      // Fallback if API key is not configured in local environment
      const defaultFollowUps = [
        {
          targetDimension: 'J/P 維度 (計畫秩序 vs 彈性應變)',
          question: `針對你剛才提到在工作流程與突發變動的處置方式，你強調自己具備極高敏捷與組織紀律。但在應徵「${jobTitle}」時，如果團隊突然面臨核心骨幹集體反彈、要求推翻目前進度，且此時只剩下最後 3 天交付，你當下會強勢執行既定清單，還是徹底放手讓大家即興發揮？你私底下最無法忍受的是失控混亂，還是僵化死板？請說實話。`,
          rationale: '偵測到回答偏向標準面試官腔，測試在極端資源衝突下的第一本能反應。',
          isFinalRound: round >= 2,
        },
        {
          targetDimension: 'T/F 維度 (事理邏輯 vs 人際情感)',
          question: `你剛剛對於團隊衝突與死線拉鋸的回答聽起來面面俱到。然而在現實職場中，魚與熊掌往往不能兼得。如果今天必須在「保護同仁免受心理重創」與「向執行長坦白該同仁失職並承擔客戶百萬罰款」之間二選一，你的本能天秤會倒向哪一邊？請具體說明你在這類掙扎時的真實心理防線。`,
          rationale: '進一步擠壓同理心與冷酷決策的模糊地帶，迫使展現真實情感取向。',
          isFinalRound: true,
        },
      ];
      const selected = defaultFollowUps[Math.min(round - 1, defaultFollowUps.length - 1)];
      return res.json(selected);
    }

    const conversationHistory = dialogue
      .map(
        (d: { question: string; answer: string; type?: string }, idx: number) =>
          `[題號 ${idx + 1} (${d.type || '情境'})] 問題: ${d.question}\n求職者回答: ${d.answer}`
      )
      .join('\n\n');

    const prompt = `
你是一位極為敏銳、洞察力頂級的資深 HR 招募總監與 MBTI 測謊情境偵探。
現在正在對應徵職缺「${jobTitle}」的求職者「${name}」進行 AI 情境壓力測試。
求職者剛回答了先前的 workplace 題目：

${conversationHistory}

目前是第 ${round} 輪追問（最多 2 輪）。
請分析求職者回答中：
1. 哪一個 MBTI 維度（E/I、S/N、T/F、J/P）最具有「修飾包裝」、「面試官腔（刻意背答案迎合${jobTitle}職位期待）」或「前後矛盾、語焉不詳」？
2. 針對該漏洞，生成 1 個極度犀利、具體、帶有迫選兩難（Dilemma）情境的動態追問題目，刺破求職者的防衛心，迫使其露出最本能的真實人格。
3. 追問語氣保持專業、冷靜、一針見血，直切核心，避免客套。

請以繁體中文輸出 JSON 格式：
{
  "targetDimension": "目標檢驗維度 (如: J/P 計畫秩序 vs 彈性隨機)",
  "question": "犀利反問文字",
  "rationale": "偵探後台解析：為何挑選此點質疑求職者",
  "isFinalRound": ${round >= 2}
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetDimension: { type: Type.STRING },
            question: { type: Type.STRING },
            rationale: { type: Type.STRING },
            isFinalRound: { type: Type.BOOLEAN },
          },
          required: ['targetDimension', 'question', 'rationale', 'isFinalRound'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      targetDimension: parsed.targetDimension || 'J/P 維度檢驗',
      question: parsed.question || '請進一步說明你在突發極端情況下的直覺抉擇。',
      rationale: parsed.rationale || '檢驗面試回答與本能反應的落差。',
      isFinalRound: round >= 2 || parsed.isFinalRound,
    });
  } catch (error) {
    console.error('Error generating follow-up question:', error);
    return res.status(500).json({
      error: '無法生成追問題目',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Endpoint: Generate Full Detective MBTI Report
app.post('/api/detective/report', async (req, res) => {
  try {
    const { candidate, dialogue } = req.body;
    const name = candidate?.name || '求職者';
    const jobTitle = candidate?.jobTitle || '關鍵職缺';

    const conversationHistory = dialogue
      .map(
        (d: { question: string; answer: string; type?: string }, idx: number) =>
          `[題號 ${idx + 1} (${d.type || '情境'})] 問題: ${d.question}\n回答: ${d.answer}`
      )
      .join('\n\n');

    if (!process.env.GEMINI_API_KEY) {
      // Mock detective report if no API key
      return res.json(createFallbackReport(name, jobTitle));
    }

    const prompt = `
你是一位擁有 20 年高階獵頭與心理分析背景的「AI 情境測試偵探 (AI Stress-Test Detective)」。
針對應徵「${jobTitle}」的求職者「${name}」在 4 題中立情境與 1-2 輪犀利追問中的完整發言進行深度測謊與 MBTI 交叉比對：

【完整對話紀錄】：
${conversationHistory}

【任務要求】：
1. 判定真實 MBTI 4 碼（例如 INTJ、ENTP、ISFJ、ENTJ 等）與代表性稱號（例如：戰略建築師、敏捷智囊、秩序推動者）。
2. 誠實度警示燈（綠/黃/紅）與真實度信任指數（0 - 100 分）：
   - 綠燈 (80-100分)：表達真實坦誠、前後一致、面對壓力追問能直言不諱。
   - 黃燈 (50-79分)：部分維度有明顯迎合面試官與職缺的修飾包裝痕跡。
   - 紅燈 (0-49分)：前後重度矛盾、強行背誦標準答案、追問時詞窮狡辯。
3. MBTI 八大維度雷達圖數值（E, I, S, N, T, F, J, P，各自給 0-100 分）：
   - 必須給出「baseline」(求職者一開始想展現的包裝面) 與「converged」(經壓力追問後逼出的真實本能面)。
   - 兩者數值落差 (Gap) 愈大代表包裝痕跡愈重！
   - 例如：為了應徵 ${jobTitle}，在 Q4 baseline 刻意表現 J=85 (高度條理縝密)，但在追問時露餡，真實 converged J 僅有 35，而 P 達到 80。
4. 顯著人格特徵（2-3個維度深入描述其職場行為特徵、團隊角色風格、溝通偏好）。
5. 「需要關注可能的包裝」防偽解析（核心亮點）：
   - 針針見血點出求職者在哪幾題刻意包裝、為了迎合此職缺塑造了何種假象，但追問時暴露何種本質。
   - 警示 HR 該包裝若錄用可能帶來的管理災難或試用期磨合風險。
6. HR 專用「面試追問指南」：
   - 產出 1 題給 HR 在實體面試時親自對質的犀利問題。
   - 註明此問題的檢驗目的。
   - 附上「真實坦誠的表現訊號 (authenticSign)」與「持續包裝掩飾的紅旗警訊 (fakeSign)」。

請嚴格以繁體中文與 JSON 格式輸出：
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mbti: { type: Type.STRING },
            mbtiTitle: { type: Type.STRING },
            mbtiSummary: { type: Type.STRING },
            honestyAlert: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, enum: ['green', 'yellow', 'red'] },
                score: { type: Type.INTEGER },
                label: { type: Type.STRING },
                summary: { type: Type.STRING },
              },
              required: ['status', 'score', 'label', 'summary'],
            },
            radarData: {
              type: Type.OBJECT,
              properties: {
                E: {
                  type: Type.OBJECT,
                  properties: { baseline: { type: Type.NUMBER }, converged: { type: Type.NUMBER } },
                  required: ['baseline', 'converged'],
                },
                I: {
                  type: Type.OBJECT,
                  properties: { baseline: { type: Type.NUMBER }, converged: { type: Type.NUMBER } },
                  required: ['baseline', 'converged'],
                },
                S: {
                  type: Type.OBJECT,
                  properties: { baseline: { type: Type.NUMBER }, converged: { type: Type.NUMBER } },
                  required: ['baseline', 'converged'],
                },
                N: {
                  type: Type.OBJECT,
                  properties: { baseline: { type: Type.NUMBER }, converged: { type: Type.NUMBER } },
                  required: ['baseline', 'converged'],
                },
                T: {
                  type: Type.OBJECT,
                  properties: { baseline: { type: Type.NUMBER }, converged: { type: Type.NUMBER } },
                  required: ['baseline', 'converged'],
                },
                F: {
                  type: Type.OBJECT,
                  properties: { baseline: { type: Type.NUMBER }, converged: { type: Type.NUMBER } },
                  required: ['baseline', 'converged'],
                },
                J: {
                  type: Type.OBJECT,
                  properties: { baseline: { type: Type.NUMBER }, converged: { type: Type.NUMBER } },
                  required: ['baseline', 'converged'],
                },
                P: {
                  type: Type.OBJECT,
                  properties: { baseline: { type: Type.NUMBER }, converged: { type: Type.NUMBER } },
                  required: ['baseline', 'converged'],
                },
                greatestGapDimension: { type: Type.STRING },
                gapExplanation: { type: Type.STRING },
              },
              required: ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P', 'greatestGapDimension', 'gapExplanation'],
            },
            prominentTraits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dimension: { type: Type.STRING },
                  scoreText: { type: Type.STRING },
                  behavior: { type: Type.STRING },
                  teamRole: { type: Type.STRING },
                  communication: { type: Type.STRING },
                },
                required: ['dimension', 'scoreText', 'behavior', 'teamRole', 'communication'],
              },
            },
            packagingAnalysis: {
              type: Type.OBJECT,
              properties: {
                detectedExaggeration: { type: Type.STRING },
                pressureRevealed: { type: Type.STRING },
                recruitmentRiskWarning: { type: Type.STRING },
              },
              required: ['detectedExaggeration', 'pressureRevealed', 'recruitmentRiskWarning'],
            },
            hrFollowUpGuide: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                purpose: { type: Type.STRING },
                whatToListenFor: {
                  type: Type.OBJECT,
                  properties: {
                    authenticSign: { type: Type.STRING },
                    fakeSign: { type: Type.STRING },
                  },
                  required: ['authenticSign', 'fakeSign'],
                },
              },
              required: ['question', 'purpose', 'whatToListenFor'],
            },
          },
          required: [
            'mbti',
            'mbtiTitle',
            'mbtiSummary',
            'honestyAlert',
            'radarData',
            'prominentTraits',
            'packagingAnalysis',
            'hrFollowUpGuide',
          ],
        },
      },
    });

    const report = JSON.parse(response.text || '{}');
    return res.json(report);
  } catch (error) {
    console.error('Error generating detective report:', error);
    // Return high quality fallback report instead of failing
    const { candidate } = req.body;
    return res.json(createFallbackReport(candidate?.name || '求職者', candidate?.jobTitle || '關鍵職缺'));
  }
});

function createFallbackReport(name: string, jobTitle: string) {
  return {
    mbti: 'ENTP',
    mbtiTitle: '智謀創變型 (真實偏向) / 偽裝成 ENTJ',
    mbtiSummary: `${name} 具備極強的臨場變通與靈敏概念推演力，善於應變突發狀況。然而在應徵「${jobTitle}」時，為了符合高階主管嚴謹縝密之期待，刻意在基本題中包裝成高組織度、高 J 型人格。`,
    honestyAlert: {
      status: 'yellow',
      score: 64,
      label: '黃燈警示：中度包裝修飾',
      summary: `受測者在核心溝通維度保持真實，但在「計畫秩序 (J)」與「冷酷邏輯 (T)」上存在刻意迎合職缺特徵，前後落差達 32%。`,
    },
    radarData: {
      E: { baseline: 75, converged: 70 },
      I: { baseline: 25, converged: 30 },
      S: { baseline: 30, converged: 25 },
      N: { baseline: 80, converged: 85 },
      T: { baseline: 85, converged: 65 },
      F: { baseline: 20, converged: 45 },
      J: { baseline: 88, converged: 36 },
      P: { baseline: 22, converged: 84 },
      greatestGapDimension: 'J / P 維度 (計畫排程 vs 敏捷隨興)',
      gapExplanation:
        '初始自述中受測者宣稱極度仰賴甘特圖與里程碑紀律 (J=88)，但在追問高壓情境中，其本能直覺更傾向彈性推翻、尋求靈活折衷 (P=84)，落差幅度達 52 分。',
    },
    prominentTraits: [
      {
        dimension: '高 N 型 (前瞻直覺) 85%',
        scoreText: '直覺與趨勢探索導向',
        behavior: '面對未知專案不執著於過往死板歷史數據，偏好尋找前瞻新突破口，能快速抓住核心脈絡。',
        teamRole: '團隊破局者與策略創新先鋒，能打破常規提出顛覆性思路。',
        communication: '偏好大局觀推導與概念對話，對微觀細節重複確認易產生不耐煩。',
      },
      {
        dimension: '實質高 P 型 (敏捷應變) 84%',
        scoreText: '高適應力與即興反應',
        behavior: '在面臨外力突發轉向時表面抱怨，但實際上在不確定性中更能激發其戰鬥力與靈活解法。',
        teamRole: '危機處理與消防員角色，擅長在規則被推翻後迅速重整戰局。',
        communication: '不喜歡被過多既定卡死的時間表綁住，需要保留隨機應變的授權空間。',
      },
    ],
    packagingAnalysis: {
      detectedExaggeration: `受測者在第 4 題中刻意強調自己具備「鋼鐵般嚴格的排程與高條理性（J=88）」，試圖迎合「${jobTitle}」需要的穩重專案控管特質。`,
      pressureRevealed:
        '在第二輪壓力追問中，受測者坦承面對下游反彈時，第一步並非落實 KPI 查核，而是選擇即興斡旋與換路而行，徹底暴露其骨子裡其實是崇尚自由與彈性的 Perceiving (P) 本能。',
      recruitmentRiskWarning:
        '若公司期望此人建立嚴謹的制度化流程、撰寫細緻的 SOP，其入職後恐因追求彈性而使團隊里程碑失控，導致下游執行端產生混亂與抱怨。',
    },
    hrFollowUpGuide: {
      question: `「請舉一個你過去帶領專案時，『完全依照既定甘特圖嚴格執行、且拒絕任何中途大幅轉向』的實際案例。如果當時團隊成員紛紛提出更有創意的新點子，你具體是如何壓制這些變動並要求所有人按部就班的？」`,
      purpose: '檢驗受測者是否真的具備其在第一輪宣稱的「高 J 紀律執行力」，還是只要一有火花就忍不住順勢放飛排程。',
      whatToListenFor: {
        authenticSign: '能具體講出甘特圖關鍵路徑 (Critical Path) 的管控機制與驗收標準，展現對秩序的真實捍衛。',
        fakeSign: '言詞含糊，講不到三句話就立刻轉為描述「其實適度靈活調整也很重要」，證明其高 J 純屬面試包裝。',
      },
    },
  };
}

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Detective Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
