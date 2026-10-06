請在這個儲存庫裡安裝並設定 Granada。

請用繁體中文（台灣用語）回覆我。指令、檔名、旗標和錯誤訊息保持原文，不要翻譯。

Granada 是一個 CLI：它把一行需求帶過一條固定的工作站產線，最後產出一個
draft pull request。你（AI 程式代理）負責代理工作站的工作；Granada 負責
執行工具工作站和各項檢查。

請依序執行下列步驟。任何一步失敗時，請停下來告訴我哪裡失敗。
不要使用 sudo。

1. 執行 `node --version`。Granada 需要 Node.js 22.12 或更新版本，用
   Homebrew 安裝時也一樣。如果 Node 版本太舊或沒有安裝，請停下來告訴我。

2. 執行 `granada --version`。如果找不到這個指令，請安裝 Granada：
   - 如果有 `brew`：
       brew tap daskinnyman/granada https://github.com/daskinnyman/granada-release
       brew install granada
   - 否則：
       curl -fsSL https://raw.githubusercontent.com/daskinnyman/granada-release/main/install.sh | bash
     這會把 `granada` 放在 ~/.local/bin。如果還是找不到 `granada`，請在
     這個 shell 把 ~/.local/bin 加進 PATH，並告訴我要修改哪個 shell 設定檔。

3. 執行 `git rev-parse --show-toplevel`，確認這個資料夾是 git 儲存庫。
   `granada host sync` 會拒絕不是儲存庫的資料夾。
   如果它不是儲存庫，而且資料夾是空的（新專案），請先問我，再執行
   `git init`。其他情況請停下來問我。

4. 執行 `granada host sync`，然後執行 `granada host doctor`。
   把 doctor 回報的每個警告或失敗都給我看。如果 doctor 說主機還沒有核准
   `granada` MCP server，請告訴我在這個主機上要怎麼核准。

5. 執行 `git status`，給我看 sync 寫入了哪些檔案。建議我提交（commit）
   這些檔案。提交前請先問我。

6. 只有在這個儲存庫有 `openspec/` 資料夾時，才執行：
       npm install -g @fission-ai/openspec@1.13.2
   Granada 預設使用一般 markdown 規格，不需要安裝任何東西。

7. 如果沒有安裝 `gh`，請告訴我：GitHub CLI 是選用的，有了它 Granada
   才能在 GitHub 開 draft pull request。

8. 如果這個儲存庫有 package.json，請告訴我：feature 產線預設會執行
   mutation 工作站，它需要把 `@stryker-mutator/core` 列為 devDependency，
   並提交到基底分支。`granada run start` 會列出加入它的指令。除非我要求，
   否則不要自己加入。

9. 告訴我現在可以使用的三個指令：
       /granada-feature <要加入的功能>
       /granada-patch <要修正的 bug>
       /granada-bootstrap <要建立的專案>
   並告訴我：可能需要重新啟動這個 CLI，它才會載入新的 skills。
