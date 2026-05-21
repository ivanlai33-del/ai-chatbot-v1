const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'app/api/webhook/[botId]/route.ts');
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  "console.error('Gemini Error, falling back to OpenAI:', geminiErr.message);",
  "console.error('Gemini Error, falling back to OpenAI:', geminiErr.message); require('fs').appendFileSync('gemini_error_log.txt', new Date().toISOString() + ' ' + geminiErr.message + '\\n' + geminiErr.stack + '\\n');"
);
fs.writeFileSync(file, code);
