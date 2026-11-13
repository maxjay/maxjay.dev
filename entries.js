// The whole site is this file. `node build.js` turns it into pages.
//
// In `line` and `text`:  *word* is drawn in the entry's colour,  {word} is censored.
// `planned: true` lists name.maxjay.dev under Go to as not built yet.

export const site = {
  name: 'maxjay.dev',
  url: 'https://maxjay.dev',
  repo: 'https://github.com/maxjay/maxjay.dev',
};

export const entries = [
  {
    name: 'jvmd', planned: true, lang: 'java', state: 'active', since: 'Sep 2026',
    built: 'Java 25, javac, RocksDB',
    works: 'Editors over LSP, coding agents over MCP',
    line: 'Java tooling that keeps up.',
    text: [
      'A daemon that stays running, so nothing gets worked out twice.',
      'Maven and jdtls redo everything on every change. jvmd keeps it in a tree and only redoes what the change touches.',
      'Your environment is indexed once. Your code is fingerprinted as you edit.',
      'Every leaf is hashed, and every branch is the sum of the hashes under it. Change a leaf and only the branches above it change. Anything that depended on a branch that did not change still stands.',
    ],
    links: ['https://github.com/maxjay/jvmd'],
  },
  {
    name: 'dova', planned: true, lang: 'typescript', state: 'active', since: 'Aug 2026',
    built: 'TypeScript, Node, zod',
    works: 'Azure Boards, Repos and Pipelines',
    line: 'Azure DevOps, starting from your git repo.',
    text: [
      'Your branch, its PR, its tickets and its pipeline run are one piece of work. Azure keeps them in separate places.',
      'dova follows the links from the repo you are in. 1 call instead of 7. Stay coding.',
      'Also an *MCP* server, so agents get the same.',
    ],
    links: ['https://github.com/maxjay/dova'],
  },
  {
    name: 'workbench', planned: true, lang: 'rust', state: 'active', since: 'Oct 2026',
    built: 'Tauri 2, Solid, Rust',
    works: 'Pi, WSL',
    line: 'Editor, terminal, browser and agent in one window.',
    text: [
      'The browser is one app. The editor is another. The editor is growing a chatbot, and the chatbot wants to be an editor.',
      'This is all of it in one window, as tabs.',
    ],
    links: ['https://github.com/maxjay/pi-workbench'],
  },
  {
    name: 'patchwork', lang: 'typescript', state: 'active', since: 'Apr 2026',
    built: 'TypeScript, JSONPath',
    works: 'Angular, MCP, any LLM, JSON Schema',
    line: 'Diff, undo and review for any JSON document.',
    text: [
      'Every config editor rebuilds the same 3 things. Patchwork is an engine that does them once, and a UI framework for building on it.',
      'One *JSONPath* reads, writes and diffs. One path can change every match.',
      'Every change is a *JSON Patch* operation. Export it, replay it, or check it against a *JSON Schema* before saving.',
      'An LLM edits the draft. A person reads the diff.',
    ],
    links: ['https://maxjay.github.io/patchwork/', 'https://github.com/maxjay/patchwork'],
  },
  {
    name: 'chiapet', planned: true, lang: 'python', state: 'private', since: 'Oct 2026',
    built: 'Chialisp, Rue, Python, Rust',
    works: 'Chia',
    line: 'A garden game on Chia.',
    text: [
      'Everyone keeps one shared pet, Timmy, alive by growing fruit and feeding him.',
      'Early. Nothing is playable yet.',
    ],
  },
  {
    name: 'archive', state: '2019-2022',
    line: 'Earlier work.',
    list: [
      ['https://github.com/maxjay/mathExtract', '2022. Pulls maths and text out of PDFs. Final-year university project.'],
      ['https://github.com/maxjay/cool-syntax', '2022. VS Code syntax highlighting for the COOL teaching language.'],
      ['https://github.com/maxjay/AntSimulation', '2021. A small ant simulation in Python.'],
      ['https://github.com/maxjay/CelestialPhysicsEngine', '2020. A simple gravity simulation in Python.'],
      ['https://github.com/maxjay/GameBoyEmulator', '2019. An unfinished Game Boy emulator in Python.'],
      ['https://github.com/maxjay/yolo-labeller', '2019. A tool for labelling car-park images to train YOLOv2.'],
    ],
  },
  {
    name: 'max', does: 'A bit of everything', where: 'London',
    line: 'I make {shit} work.',
    links: ['https://github.com/maxjay'],
  },
];
