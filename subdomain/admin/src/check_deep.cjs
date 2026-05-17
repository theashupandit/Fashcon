
const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\ashwi\\Desktop\\fashcon\\subdomain\\admin\\src\\app\\(dashboard)\\users\\page.tsx', 'utf8');
const lines = content.split('\n');

let balance = 0;
let stack = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '(') {
            balance++;
            stack.push({ line: i + 1, col: j + 1 });
        }
        if (char === ')') {
            balance--;
            if (balance < 0) {
                console.log(`Extra closing parenthesis at line ${i + 1}, col ${j + 1}`);
                process.exit(1);
            }
            stack.pop();
        }
    }
}

if (balance > 0) {
    console.log(`Unclosed parentheses: ${balance}`);
    stack.forEach(s => console.log(`Opened at line ${s.line}, col ${s.col}`));
} else {
    console.log("Balanced!");
}
