import * as yfModule from 'yahoo-finance2';
console.log("Keys in yahoo-finance2:", Object.keys(yfModule));
console.log("Default export keys:", Object.keys((yfModule as any).default || {}));
