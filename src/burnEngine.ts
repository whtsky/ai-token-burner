import * as vscode from 'vscode'
import { OutputLogger } from './outputLogger'

const PROMPTS = ['Ping.', 'Hello.', 'Hi there.', 'Test.', 'Check.']

export interface BurnState {
  isEnabled: boolean
  isBurning: boolean
  sessionCount: number
  allTimeCount: number
  intervalMinutes: number
  selectedModel: string | undefined
}

export class BurnEngine implements vscode.Disposable {
  private context: vscode.ExtensionContext
  private logger: OutputLogger
  private isEnabled = false
  private isBurning = false
  private sessionCount = 0
  private selectedModel: string | undefined
  private timer: NodeJS.Timeout | undefined
  private stateChangeEmitter = new vscode.EventEmitter<void>()

  readonly onStateChange = this.stateChangeEmitter.event

  constructor(context: vscode.ExtensionContext, logger: OutputLogger) {
    this.context = context
    this.logger = logger
  }

  getState(): BurnState {
    return {
      isEnabled: this.isEnabled,
      isBurning: this.isBurning,
      sessionCount: this.sessionCount,
      allTimeCount: this.getAllTimeCount(),
      intervalMinutes: this.getIntervalMinutes(),
      selectedModel: this.selectedModel,
    }
  }

  private getIntervalMinutes(): number {
    const config = vscode.workspace.getConfiguration('aiTokenBurner')
    return config.get<number>('intervalMinutes', 5)
  }

  private getAllTimeCount(): number {
    return this.context.globalState.get<number>('allTimeCount', 0)
  }

  private async incrementAllTimeCount(): Promise<void> {
    const current = this.getAllTimeCount()
    await this.context.globalState.update('allTimeCount', current + 1)
  }

  enable(): void {
    if (this.isEnabled) return
    this.isEnabled = true
    this.startTimer()
    this.stateChangeEmitter.fire()
    this.logger.log('Burn mode enabled')
  }

  disable(): void {
    if (!this.isEnabled) return
    this.isEnabled = false
    this.stopTimer()
    this.stateChangeEmitter.fire()
    this.logger.log('Burn mode disabled')
  }

  updateInterval(): void {
    if (this.isEnabled) {
      this.stopTimer()
      this.startTimer()
    }
    this.stateChangeEmitter.fire()
  }

  setModel(modelId: string | undefined): void {
    this.selectedModel = modelId
    this.stateChangeEmitter.fire()
    this.logger.log(`Model set to: ${modelId || 'auto'}`)
  }

  async getAvailableModels(): Promise<{ id: string; name: string }[]> {
    try {
      const models = await vscode.lm.selectChatModels()
      return models.map((m) => ({ id: m.id, name: m.name }))
    } catch {
      return []
    }
  }

  async burnNow(): Promise<void> {
    if (this.isBurning) return
    await this.performBurn()
  }

  private startTimer(): void {
    const intervalMs = this.getIntervalMinutes() * 60 * 1000
    this.timer = setInterval(() => this.performBurn(), intervalMs)
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }
  }

  private async performBurn(): Promise<void> {
    if (this.isBurning) return

    this.isBurning = true
    this.stateChangeEmitter.fire()

    try {
      const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)]
      const models = await vscode.lm.selectChatModels(this.selectedModel ? { id: this.selectedModel } : undefined)

      if (models.length === 0) {
        this.logger.log('No models available')
        return
      }

      const model = models[0]
      const messages = [vscode.LanguageModelChatMessage.User(prompt)]

      const response = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token)

      // Consume the response stream
      let responseText = ''
      for await (const chunk of response.text) {
        responseText += chunk
      }

      this.sessionCount++
      await this.incrementAllTimeCount()

      this.logger.log(
        `Burn complete - Model: ${model.name}, Prompt: "${prompt}", Response: "${responseText.slice(0, 100).replace(/\n/g, ' ')}${responseText.length > 100 ? '...' : ''}"`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.logger.log(`Burn failed: ${message}`)
      this.statusBarWarning(message)
    } finally {
      this.isBurning = false
      this.stateChangeEmitter.fire()
    }
  }

  private statusBarWarning(message: string): void {
    vscode.window.setStatusBarMessage(`$(warning) Token Burner: ${message}`, 5000)
  }

  dispose(): void {
    this.stopTimer()
    this.stateChangeEmitter.dispose()
  }
}
