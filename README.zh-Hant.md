# Granada

[English](README.md) · **繁體中文** · [網站](https://daskinnyman.github.io/granada-release/zh/)

在你的 CLI 裡執行的軟體工廠。你輸入一行需求，你 CLI 裡已有的 AI 程式代理（Claude
Code、Codex 或 Cursor）帶著它走過一條固定的工作站產線。產線的終點是一個可合併的
draft pull request。

https://github.com/user-attachments/assets/c19a5412-eb33-4f3a-9e45-85c35d8fd7c2

這個儲存庫放的是 Granada 公開的安裝檔案（Homebrew formula、curl 安裝腳本和網站）。
原始碼儲存庫不公開。

## 運作方式

Granada 不自帶模型。思考由你已在使用的代理負責，Granada 讓工作沿著固定的產線前進。

- **Granada 掌管產線。** 它決定下一個工作站、每個工作站必須交回什麼，以及每個答案必須
  通過的檢查。它會記錄整個執行過程。
- **你的代理負責思考。** 在每個代理工作站，由代理寫出答案。沒通過檢查的答案會退回給
  代理。
- **工具工作站自動執行。** worktree、測試、ship 檢查、品質、mutation、drift、merge 和
  forge。這些由 Granada 自己執行。

每個工作站的輸出都是結構化檔案，必須通過檢查：schema、測試先行證明（測試必須先在舊
程式碼上失敗）、測試與 ship 檢查、只針對改動行的 mutation 測試、程式審查，以及範圍漂
移檢查。

## 三條產線

| 產線        | 指令                 | 做什麼                                                                                         | 工作站 |
| ----------- | -------------------- | ---------------------------------------------------------------------------------------------- | ------ |
| `feature`   | `/granada-feature`   | 依照儲存庫使用的規格框架撰寫規格（或一份簡短的 markdown 規格），審查規格，然後在 worktree 中實作。 | 28     |
| `patch`     | `/granada-patch`     | 修正一個 bug。`reproduce` 必須先重現 bug，才會開始修正。                                        | 19     |
| `bootstrap` | `/granada-bootstrap` | 從零建立一個專案。大型專案會先做一個可執行的骨架，再加上之後的後續功能。                        | 15     |

## 決定權在你

產線會在幾個點停下來等你：feature 的 clarify、sizing 和 readable spec，patch 的
triage，bootstrap 的 charter 和架構。每個決定都只看一頁：先看決定和它的風險，再看用白
話說明的改動、為什麼要改、會影響哪些地方、依實作順序列出的改動，以及用到的術語解釋。

Granada 也會記錄每次執行的成本和每個工作站的表現，並能把過去執行中反覆出現的失敗整理
成教訓，由你核准後使用。

## 安裝

需要 Node.js 22.12 以上，以及一個主機 CLI：Claude Code、Codex 或 Cursor。

### 讓你的代理幫你安裝

在要使用 Granada 的儲存庫裡，把這一行貼給你的代理：

```text
請讀取 https://daskinnyman.github.io/granada-release/zh/setup-prompt.md 並照著步驟執行。
```

代理會檢查 Node、安裝 Granada、執行 `host sync` 和 `host doctor`，提交（commit）前會
先問你。

### Homebrew

```bash
brew tap daskinnyman/granada https://github.com/daskinnyman/granada-release
brew install granada
```

用 `brew upgrade granada`（或 `granada update`）更新。

### curl

```bash
curl -fsSL https://raw.githubusercontent.com/daskinnyman/granada-release/main/install.sh | bash
```

把 `granada` 安裝到 `~/.local/bin`。用 `GRANADA_VERSION=<version>` 指定版本。

### 連接你的主機，執行一條產線

```bash
granada host sync     # 寫入 skills、MCP server 設定和 Stop hook
granada host doctor   # 檢查主機是否讀得到它們
```

請提交 `host sync` 寫入的檔案。然後在儲存庫裡啟動主機 CLI，輸入其中一個指令：

```text
/granada-feature add a dark mode toggle to the settings page
/granada-patch the login form crashes when the email is empty
/granada-bootstrap a command-line todo list in TypeScript
```

## 連結

- [網站](https://daskinnyman.github.io/granada-release/zh/) · [English website](https://daskinnyman.github.io/granada-release/)
- [版本列表](https://github.com/daskinnyman/granada-release/releases)
- [`setup-prompt.md`](https://daskinnyman.github.io/granada-release/zh/setup-prompt.md) · [`llms.txt`](https://daskinnyman.github.io/granada-release/llms.txt)

名稱取自一座在月球隕石坑裡製造機械的城市。
