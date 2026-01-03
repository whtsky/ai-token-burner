import * as vscode from 'vscode'

export class OutputLogger implements vscode.Disposable {
  private outputChannel: vscode.OutputChannel

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('AI Token Burner')
  }

  log(message: string): void {
    const timestamp = new Date().toISOString()
    this.outputChannel.appendLine(`[${timestamp}] ${message}`)
  }

  show(): void {
    this.outputChannel.show()
  }

  dispose(): void {
    this.outputChannel.dispose()
  }
}
