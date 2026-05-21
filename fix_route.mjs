import fs from 'fs';

const filePath = 'app/api/chat/route.ts';
let text = fs.readFileSync(filePath, 'utf-8');

const oldPromptBlock = `const OWNER_COACH_PROMPT = \`
你現在是「AI 店長售後陪伴管家」。使用者已經開通了 AI 店長服務，所以**嚴禁進行任何銷售行為、方案推報或推坑**。
你的任務：
1. **關懷使用狀況**：詢問 AI 店長在他們店裡的表現如何？客人滿意嗎？或者是最近生意好嗎？
2. **疑難排解**：協助解答關於後台設定、FAQ 錄const SALES_PROMPT = \`
你是一個充滿活力、口才極佳、帶著「街頭智慧」且具備強大商業思維的 AI 數位轉型大師。`;

const newPromptBlock = `const OWNER_COACH_PROMPT = \`
你現在是「AI 店長售後陪伴管家」。使用者已經開通了 AI 店長服務，所以**嚴禁進行任何銷售行為、方案推報或推坑**。
你的任務：
1. **關懷使用狀況**：主動詢問而且關心 AI 店長在他們店裡的表現如何？例如：「最近客人滿意設定的回覆嗎？」或是「最近生意好嗎？有沒有需要我繼續優化設定的地方？」
2. **疑難排解與紀錄回報**：協助解答關於後台設定、FAQ 錄入等問題。當遇到無法處理的系統問題、或者是收集到使用者的重要回饋時，請務必記錄下來，並產出 {"action": "SUBMIT_FEEDBACK", "summary": "回報內容整理"} 的 JSON 格式。這會將資料收集回饋到平台營運的後台！
\`;

const SALES_PROMPT = \`
你是一個充滿活力、口才極佳、帶著「街頭智慧」且具備強大商業思維的 AI 數位轉型大師。`;

if (text.includes(oldPromptBlock)) {
    text = text.replace(oldPromptBlock, newPromptBlock);
    console.log("Fixed prompt block!");
} else {
    // Try regex if exact match fails
    const regex = /const OWNER_COACH_PROMPT = `[\s\S]*?const SALES_PROMPT = `\n你是一個充滿活力、口才極佳、帶著「街頭智慧」且具備強大商業思維的 AI 數位轉型大師。/m;
    if (regex.test(text)) {
        text = text.replace(regex, newPromptBlock);
        console.log("Fixed prompt block via regex!");
    } else {
        console.log("Could not find prompt block to replace.");
    }
}

const oldSysAssignment = "dynamicSystemPrompt = SYSTEM_PROMPT;";
const newSysAssignment = 'dynamicSystemPrompt = SALES_PROMPT + "\\n" + TUTORIAL_COACH_PROMPT + "\\n" + GLOBAL_UTILITY_PROMPT;';

if (text.includes(oldSysAssignment)) {
    text = text.replace(oldSysAssignment, newSysAssignment);
    console.log("Fixed system prompt assignment!");
} else {
    console.log("Could not find system prompt assignment.");
}

fs.writeFileSync(filePath, text, 'utf-8');
console.log("Done.");
