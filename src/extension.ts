import * as vscode from 'vscode'
import { StatusBarController } from './statusBar'
import { BurnEngine } from './burnEngine'
import { OutputLogger } from './outputLogger'

let statusBar: StatusBarController
let burnEngine: BurnEngine
let outputLogger: OutputLogger

export function activate(context: vscode.ExtensionContext) {
  outputLogger = new OutputLogger()
  burnEngine = new BurnEngine(context, outputLogger)
  statusBar = new StatusBarController(context, burnEngine)

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('aiTokenBurner.showMenu', () => {
      statusBar.showQuickPick()
    }),
    vscode.commands.registerCommand('aiTokenBurner.enable', () => {
      burnEngine.enable()
    }),
    vscode.commands.registerCommand('aiTokenBurner.disable', () => {
      burnEngine.disable()
    }),
    vscode.commands.registerCommand('aiTokenBurner.burnNow', () => {
      burnEngine.burnNow()
    }),
    vscode.commands.registerCommand('aiTokenBurner.selectModel', () => {
      statusBar.showModelPicker()
    }),
    vscode.commands.registerCommand('aiTokenBurner.setInterval', () => {
      statusBar.showIntervalInput()
    }),
    vscode.commands.registerCommand('aiTokenBurner.showOutput', () => {
      outputLogger.show()
    }),
  )

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('aiTokenBurner.intervalMinutes')) {
        burnEngine.updateInterval()
      }
    }),
  )

  context.subscriptions.push(statusBar, burnEngine, outputLogger)

  // Auto-start if configured
  const config = vscode.workspace.getConfiguration('aiTokenBurner')
  if (config.get<boolean>('autoStart', false)) {
    burnEngine.enable()
  }
}

export function deactivate() {
  // Cleanup handled by disposables
}
