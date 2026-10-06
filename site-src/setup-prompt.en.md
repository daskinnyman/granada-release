Set up Granada in this repository.

Granada is a CLI that runs a one-line intent through a fixed track of
stations and ends with a draft pull request. You, the coding agent, do the
work at its agent stations. Granada runs the tool stations and the checks.

Do these steps in order. If a step fails, stop and tell me what failed.
Do not use sudo.

1. Run `node --version`. Granada needs Node.js 22.12 or newer, also when it
   is installed with Homebrew. If Node is older or missing, stop and tell me.

2. Run `granada --version`. If the command is not found, install Granada:
   - If `brew` is available:
       brew tap daskinnyman/granada https://github.com/daskinnyman/granada-release
       brew install granada
   - Else:
       curl -fsSL https://raw.githubusercontent.com/daskinnyman/granada-release/main/install.sh | bash
     This puts `granada` in ~/.local/bin. If `granada` is still not found,
     add ~/.local/bin to PATH for this shell and tell me which shell file to
     change.

3. Run `git rev-parse --show-toplevel` to check that this folder is a git
   repository. `granada host sync` refuses a folder that is not one.
   If it is not a repository and the folder is empty (a new project), ask
   me, then run `git init`. In any other case, stop and ask me.

4. Run `granada host sync`, then `granada host doctor`.
   Show me every warning or failure that doctor reports. If doctor says the
   host has not approved the `granada` MCP server, tell me how to approve it
   in this host.

5. Run `git status` and show me the files that sync wrote. Suggest that I
   commit them. Ask me before you commit.

6. Only if this repository has an `openspec/` folder, run:
       npm install -g @fission-ai/openspec@1.13.2
   Plain markdown specs, Granada's default, need nothing installed.

7. If `gh` is not installed, tell me that the GitHub CLI is optional and
   lets Granada open GitHub draft pull requests.

8. If this repository has a package.json, tell me: the feature track runs a
   mutation station by default, and it needs `@stryker-mutator/core` as a
   devDependency, committed on the base branch. `granada run start` names
   the command to add it. Do not add it unless I ask.

9. Tell me the three commands I can use now:
       /granada-feature <what to add>
       /granada-patch <the bug to fix>
       /granada-bootstrap <the project to create>
   Tell me that I may need to restart this CLI so it loads the new skills.
