
const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\ashwi\\Desktop\\fashcon\\subdomain\\admin\\src\\app\\(dashboard)\\users\\page.tsx', 'utf8');
const lines = content.split('\n');

let balance = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let char of line) {
        if (char === '(') balance++;
        if (char === ')') balance--;
    }
    if (balance < 0) {
        console.log(`Unbalanced at line ${i + 1}: balance is ${balance}`);
        process.exit(1);
    }
}
console.log(`Final balance: ${balance}`);
if (balance !== 0) {
    console.log("Still unbalanced at the end!");
}
