const vscode = require('vscode');
const path = require('path');
const { playSound } = require('./soundPlayer');

let isEnabled = vscode.workspace.getConfiguration('funErrorMusic').get('enabled', true);
let lastErrorTime = 0;
const DEBOUNCE_MS = 1000; // Prevent spamming sound

function activate(context) {
  console.log('Fun Error Music is now active!');

  // Register toggle command
  let toggleCommand = vscode.commands.registerCommand('funErrorMusic.toggle', () => {
    isEnabled = !isEnabled;
    vscode.workspace.getConfiguration('funErrorMusic').update('enabled', isEnabled, true);
    vscode.window.showInformationMessage(`Fun Error Music is now ${isEnabled ? 'enabled' : 'disabled'}.`);
  });

  context.subscriptions.push(toggleCommand);

  // Monitor terminal output
  vscode.window.onDidChangeTerminalState(terminal => {
    if (!isEnabled) return;
    checkTerminalForErrors(terminal);
  });

  // Monitor output channels (e.g., Problems or Extension Host logs)
  const outputChannel = vscode.window.createOutputChannel('Fun Error Music Monitor');
  vscode.window.onDidWriteTerminalData(event => {
    if (!isEnabled) return;
    const data = event.data.toString().toLowerCase();
    if (data.includes('error') || data.includes('failed')) {
      playErrorSound();
    }
  });
}

function checkTerminalForErrors(terminal) {
  // Note: Direct terminal content access is limited in VS Code API.
  // We rely on terminal data events or output channels instead.
  // This is a placeholder for future API enhancements.
}

function playErrorSound() {
  const now = Date.now();
  if (now - lastErrorTime < DEBOUNCE_MS) return; // Debounce to avoid spamming
  lastErrorTime = now;

  const soundPath = path.join(__dirname, '..', 'sounds', 'error-sound.mp3');
  try {
    playSound(soundPath);
    vscode.window.showInformationMessage('Oops! Error detected, let’s jam! 🎶');
  } catch (err) {
    console.error('Error playing sound:', err);
  }
}

function deactivate() {
  console.log('Fun Error Music is now deactivated.');
}

module.exports = {
  activate,
  deactivate
};