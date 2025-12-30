# AI Token Burner

Help Your AI Stay Active and Engaged — By sending friendly, automated chat prompts, this extension keeps your AI from falling behind on its exercise regimen.

## Features

- **Automated AI Activity**: Sends small requests at a configurable interval using the VS Code LLM API
- **Status Bar Control**: Quick access to all controls via a single status bar item
- **Session & All-time Counters**: Track your burn activity across sessions

## Usage

1. Click the "AI Token Burner" status bar item (bottom of VS Code)
2. Select "Enable Burn Mode" from the menu
3. The extension will start sending periodic prompts to the AI model

## Configuration

| Setting                         | Default | Description                                     |
| ------------------------------- | ------- | ----------------------------------------------- |
| `aiTokenBurner.autoStart`       | false   | Automatically start burning when VS Code starts |
| `aiTokenBurner.intervalMinutes` | 30      | Interval in minutes between burns               |

## Requirements

- A language model available through VS Code's LLM API (e.g., GitHub Copilot)

## Output

To view detailed logs, open the Output panel (View > Output) and select "AI Token Burner" from the dropdown. The output shows:

- Timestamps for each action
- Model used for each burn
- Prompts sent
- Response summaries

## Disclaimer

This extension is purely vibe-coded. All code is unreviewed and provided with absolutely no warranty. Use at your own risk.
