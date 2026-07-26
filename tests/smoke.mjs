import { readFile } from 'node:fs/promises';
for (const f of [
  'index.html',
  'src/main.js',
  'src/modules/frenagem/module.json',
  'src/modules/frenagem/quiz.json',
  '.github/workflows/deploy.yml',
]) {
  await readFile(new URL(`../${f}`, import.meta.url));
}
const q = JSON.parse(
  await readFile(new URL('../src/modules/frenagem/quiz.json', import.meta.url), 'utf8'),
);
if (q.questions.length !== 5) throw new Error('Quiz deve conter 5 questões');
console.log('Smoke test concluído.');
