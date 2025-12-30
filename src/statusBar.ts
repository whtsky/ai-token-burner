import * as vscode from 'vscode'
import { BurnEngine } from './burnEngine'

export class StatusBarController implements vscode.Disposable {
  private statusBarItem: vscode.StatusBarItem
  private burnEngine: BurnEngine
  private context: vscode.ExtensionContext

  constructor(context: vscode.ExtensionContext, burnEngine: BurnEngine) {
    this.context = context
    this.burnEngine = burnEngine

    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
    this.statusBarItem.command = 'aiTokenBurner.showMenu'
    this.statusBarItem.show()

    burnEngine.onStateChange(() => this.updateDisplay())
    this.updateDisplay()
  }

  private updateDisplay(): void {
    const state = this.burnEngine.getState()
    const sessionCount = state.sessionCount
    const allTimeCount = state.allTimeCount

    if (state.isBurning) {
      this.statusBarItem.text = `$(flame) Burning...`
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground')
    } else if (state.isEnabled) {
      this.statusBarItem.text = `$(flame) ${sessionCount}/${allTimeCount}`
      this.statusBarItem.backgroundColor = undefined
    } else {
      this.statusBarItem.text = `$(flame) Off`
      this.statusBarItem.backgroundColor = undefined
    }

    this.statusBarItem.tooltip = `AI Token Burner\nSession: ${sessionCount} | All-time: ${allTimeCount}\nInterval: ${state.intervalMinutes}m\nModel: ${state.selectedModel || 'auto'}`
  }

  async showQuickPick(): Promise<void> {
    const state = this.burnEngine.getState()
    const items: vscode.QuickPickItem[] = [
      {
        label: state.isEnabled ? '$(debug-stop) Disable Burn Mode' : '$(play) Enable Burn Mode',
        description: state.isEnabled ? 'Stop burning tokens' : 'Start burning tokens',
      },
      {
        label: '$(zap) Trigger Burn Now',
        description: 'Send a request immediately',
      },
      {
        label: '$(gear) Select Model',
        description: state.selectedModel || 'auto',
      },
      {
        label: '$(clock) Set Interval',
        description: `Currently: ${state.intervalMinutes} minutes`,
      },
    ]

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'AI Token Burner',
    })

    if (!selected) return

    if (selected.label.includes('Enable')) {
      this.burnEngine.enable()
    } else if (selected.label.includes('Disable')) {
      this.burnEngine.disable()
    } else if (selected.label.includes('Trigger')) {
      this.burnEngine.burnNow()
    } else if (selected.label.includes('Model')) {
      this.showModelPicker()
    } else if (selected.label.includes('Interval')) {
      this.showIntervalInput()
    }
  }

  async showModelPicker(): Promise<void> {
    const models = await this.burnEngine.getAvailableModels()
    const items: vscode.QuickPickItem[] = [
      { label: 'auto', description: 'Use any available model' },
      ...models.map((m) => ({ label: m.id, description: m.name })),
    ]

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select model for burning',
    })

    if (selected) {
      this.burnEngine.setModel(selected.label === 'auto' ? undefined : selected.label)
    }
  }

  async showIntervalInput(): Promise<void> {
    const state = this.burnEngine.getState()
    const input = await vscode.window.showInputBox({
      prompt: 'Enter burn interval in minutes',
      value: state.intervalMinutes.toString(),
      validateInput: (value) => {
        const num = parseInt(value, 10)
        if (isNaN(num) || num < 1) {
          return 'Please enter a number >= 1'
        }
        return null
      },
    })

    if (input) {
      const config = vscode.workspace.getConfiguration('aiTokenBurner')
      await config.update('intervalMinutes', parseInt(input, 10), vscode.ConfigurationTarget.Global)
    }
  }

  dispose(): void {
    this.statusBarItem.dispose()
  }
}
