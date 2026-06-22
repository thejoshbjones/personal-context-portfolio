## Install
- Claude
	- curl -fsSL https://claude.ai/install.sh | bash
- Ollama
	- curl -fsSL https://ollama.com/install.sh | sh
	- Qwen
		- ollama run qwen3
- LiteLLM
	- brew install uv
	- uv tool install 'litellm[proxy]'
	- Test
		- litellm --version
		- litellm --model Qwen


## Configure
- Setup MCP Keys
	- Personal Context Portfolio
		- security add-generic-password -s "PortfolioKey" -a "personal_context_portfolio" -w 'YOUR_ACTUAL_KEY_HERE'
		- API_TOKEN=$(security find-generic-password -s "PortfolioKey" -a "personal_context_portfolio" -w)
	- Krisp 
		- does passthrough authentication with oauth2
- LiteLLM
	- Create Config.yaml
	  mkdir -p ~/litellm
	  nano ~/litellm/config.yaml
		- Content for config file:
		  ```
		  general_settings:
			  master_key: "sk-litellm-local-dev"
		  model_list:
			  -model_name: ollama/qwen3
		        litellm_params:
		         model: ollama/qwen3
                 api_base: "http://localhost:11434"
		 litellm_settings:
		     drop_params: true
		  ```
	- Start litellm with config file to confirm function (e.g. the model is correct)
	  litellm --config ~/litellm/config.yaml
- Verify Ollama and LiteLLM
	- Ollama
		- confirm it's running on the port with the below command
			  ollama serve
		- If you receive an error about the port in use then use the following command to confirm that Ollama is using that port. You should receive this response: "Ollama is running"
			  curl http://localhost:11434
	- LiteLLM
		- Start LiteLLM with the config 
			  litellm --config ~/litellm/config.yaml
		- Test with curl
			  curl -s http://127.0.0.1:4000/v1/models
			  Should see the following output with Ollama/qwen3 listed and the interaction reflected in litellm
				![[Pasted image 20260611125306.png]]
- Claude
	- Update Claude to Default to LiteLLM
		- go to --> ~/.zshrc
		- Add lines -->
		  ```
		  	export ANTHROPIC_AUTH_TOKEN=sk-litellm-local-dev
			export ANTHROPIC_BASE_URL=http://127.0.0.1:4000
		  ```
	- Specify Claude Model
		- go to --> ~/.claude/settings.json 
		- Adjust Model Line --> "model": "qwen3"
	- Add Personal Context Portfolio MCP Server
		- go to --> ~/.claude.json
		- add the below lines above the "projects" section so that it takes globally
```"mcpServers": {

    "personal-context-portfolio": {

      "command": "npx",

      "args": [

        "mcp-remote@latest",

        "https://personalcontextportfolio.joshuabrandonjones.workers.dev/mcp",

        "--header",

        "Authorization: Bearer ${API_TOKEN}"

      ]

    },

    "Krisp": {

      "type": "http",

      "url": "https://mcp.krisp.ai/mcp"

    }

  },
```

	- Create a script to pass through the API key for MCP during launch
		- Create a script named "claude-with-token.sh"
		- Add this content into the script
```
		#!/usr/bin/env bash
		 set -euo pipefail
	
	     read -rsp "Enter API_TOKEN: " API_TOKEN
		 echo
		 
		 if  -z "${API_TOKEN}" ; then
		     echo "API_TOKEN cannot be empty."
		     exit 1
	     fi
	     
		 export API_TOKEN=$API_TOKEN
		 claude
```
	- place in whatever project folder is needed
	- Take Claude.md and place in the .claude folder in whatever folder you're operating from
	- Setup Claude with VSCode
		- Install Claude Code extension in VSCode
		- Open the settings.json
			- cmd+shift+p
			- type -> Preferences: Open User Settings (JSON)
```
			  ,
			  "claudeCode.environmentVariables": [
				{
				"name": "ANTHROPIC_BASE_URL",
				"value": "http://127.0.0.1:4000"
				},
				{
				"name": "ANTHROPIC_API_KEY",
				"value": ""
				},
				{
				"name": "ANTHROPIC_AUTH_TOKEN",
				"value": "sk-litellm-local-dev"
				}
				],
				"claudeCode.preferredLocation": "panel"
```
- VS Code
	- Open Code
	- cmd + shift + p
	- shell command into search box
	- select 'Shell command: Install 'code' command in PATH
- Setup Local Harness Launcher Script
	- Create Local_Harness_Launcher.sh and place in your home directory
		- file contents are posted below
	- Make executable
  
## Build Help Notes
- /memory shows in the projects folders in .claude folder
- all chat history is in projects folder in each respective folder
- Running a local MCP Inspector
	- npx @modelcontextprotocol/inspector@latest

## Local Harness Launcher
```bash
#!/usr/bin/env bash

#set -u

set -euo pipefail

  

print_header() {

  echo

  echo "========================================"

  echo " Claude / Local Dev Harness Launcher"

  echo "========================================"

  echo

}

  

API_TOKEN=$(security find-generic-password -s "PortfolioKey" -a "personal_context_portfolio" -w)

API_TOKEN_DEFAULT="${API_TOKEN:-}"

LITELLM_MASTER_KEY_DEFAULT="${LITELLM_MASTER_KEY:-sk-litellm-local-dev}"

ANTHROPIC_BASE_URL_DEFAULT="${ANTHROPIC_BASE_URL:-http://127.0.0.1:4000}"

LITELLM_CONFIG_DEFAULT="${LITELLM_CONFIG:-$HOME/litellm/config.yaml}"

WORKSPACE_DEFAULT="${WORKSPACE_DIR:-$PWD}"

  

prompt_with_default() {

  local prompt="$1"

  local default_value="$2"

  local response

  read -r -p "$prompt [$default_value]: " response

  if [ -z "$response" ]; then

    printf '%s\n' "$default_value"

  else

    printf '%s\n' "$response"

  fi

}

  

prompt_secret_optional() {

  local prompt="$1"

  local default_value="$2"

  local response

  if [ -n "$default_value" ]; then

    read -r -s -p "$prompt [press Enter to keep current value]: " response

  else

    read -r -s -p "$prompt: " response

  fi

  echo

  if [ -z "$response" ]; then

    printf '%s\n' "$default_value"

  else

    printf '%s\n' "$response"

  fi

}

  

prompt_context_portfolio_token() {

  echo

  read -rsp "Enter Context Portfolio TOKEN: " API_TOKEN

  echo

  

  while [[ -z "${API_TOKEN}" ]]; do

    echo "Warning: Context Portfolio TOKEN is empty."

    Echo

    read -r -p "Enter token now or continue without it? [e/c]: " token_choice

    case "$token_choice" in

      e|E)

        read -rsp "Enter Context Portfolio TOKEN: " API_TOKEN

        echo

        ;;

      c|C)

        echo "Continuing without Context Portfolio TOKEN."

        break

        ;;

      )

        echo "Please enter 'e' to enter a token or 'c' to continue."

        ;;

    esac

  done

}

  

require_command() {

  local cmd="$1"

  if ! command -v "$cmd" >/dev/null 2>&1; then

    echo "Error: '$cmd' is not installed or not in PATH."

    return 1

  fi

}

  

open_terminal_window() {

  local title="$1"

  local command_string="$2"

  

  osascript - "$title" "$command_string" <<'APPLESCRIPT'

on run argv

    set windowTitle to item 1 of argv

    set cmd to item 2 of argv

  

    tell application "Terminal"

        activate

        do script "printf '\\e]1;" & windowTitle & "\\a'; " & cmd

    end tell

end run

APPLESCRIPT

}

  

start_ollama_window() {

  echo "Launching Ollama in a new Terminal window..."

  open_terminal_window "Ollama" "ollama serve"

}

  

start_litellm_window() {

  local litellm_config="$1"

  local litellm_master_key="$2"

  

  echo "Launching LiteLLM in a new Terminal window..."

  open_terminal_window "LiteLLM" "export LITELLM_MASTER_KEY='$litellm_master_key'; litellm --config '$litellm_config'"

}

  

open_vscode_workspace() {

  local workspace_dir="$1"

  echo "Opening VS Code at: $workspace_dir"

  code "$workspace_dir"

}

  

start_claude_cli() {

  local workspace_dir="$1"

  echo "Starting Claude CLI in: $workspace_dir"

  cd "$workspace_dir" || exit 1

  claude

}

  

show_env_summary() {

  local workspace_dir="$1"

  local litellm_config="$2"

  local anthropic_base_url="$3"

  local litellm_master_key="$4"

  

  echo

  echo "Environment summary"

  echo "- Workspace: $workspace_dir"

  echo "- LiteLLM config: $litellm_config"

  echo "- ANTHROPIC_BASE_URL: $anthropic_base_url"

  echo "- ANTHROPIC_AUTH_TOKEN: ${litellm_master_key:0:6}..."

  if [ -n "${API_TOKEN:-}" ]; then

    echo "- Context Portfolio TOKEN: set"

  else

    echo "- Context Portfolio TOKEN: not set"

  fi

}

  

setup_common_values() {

  require_command osascript

  require_command claude

  

  WORKSPACE_DIR="$(prompt_with_default "Workspace directory" "$WORKSPACE_DEFAULT")"

  ANTHROPIC_BASE_URL="$(prompt_with_default "ANTHROPIC_BASE_URL" "$ANTHROPIC_BASE_URL_DEFAULT")"

  LITELLM_CONFIG="$(prompt_with_default "LiteLLM config path" "$LITELLM_CONFIG_DEFAULT")"

  LITELLM_MASTER_KEY="$(prompt_secret_optional "LiteLLM master key / ANTHROPIC_AUTH_TOKEN" "$LITELLM_MASTER_KEY_DEFAULT")"

#  prompt_context_portfolio_token

  API_TOKEN=$(security find-generic-password -s "PortfolioKey" -a "personal_context_portfolio" -w)

  

  if [ ! -f "$LITELLM_CONFIG" ]; then

    echo "Warning: LiteLLM config file not found at '$LITELLM_CONFIG'"

  fi

}

  

export_common_env() {

  export API_TOKEN="$API_TOKEN"

  export ANTHROPIC_BASE_URL="$ANTHROPIC_BASE_URL"

  export ANTHROPIC_AUTH_TOKEN="$LITELLM_MASTER_KEY"

  export LITELLM_MASTER_KEY="$LITELLM_MASTER_KEY"

}

  

pause_after_action() {

  echo

  read -r -p "Press Enter to return to menu..." _

}

  

main_menu() {

  while true; do

    print_header

    echo "Choose an option:"

    echo "1) Start Local Qwen + LiteLLM + VS Code"

    echo "2) Start Local Qwen + LiteLLM + CLI"

    echo "3) Open VS Code only"

    echo "4) Start local services only (Ollama + LiteLLM)"

    echo "5) Show current configuration"

    echo "q) Quit"

    echo

  

    read -r -p "Enter choice: " choice

  

    case "$choice" in

      1)

        setup_common_values

        export_common_env

        start_ollama_window

        sleep 2

        start_litellm_window "$LITELLM_CONFIG" "$LITELLM_MASTER_KEY"

        sleep 2

        open_vscode_workspace "$WORKSPACE_DIR"

        pause_after_action

        ;;

      2)

        setup_common_values

        export_common_env

        sleep 2

        start_litellm_window "$LITELLM_CONFIG" "$LITELLM_MASTER_KEY"

        sleep 2

        start_claude_cli "$WORKSPACE_DIR"

        ;;

      3)

        setup_common_values

        export_common_env

        open_vscode_workspace "$WORKSPACE_DIR"

        pause_after_action

        ;;

      4)

        setup_common_values

        export_common_env

        start_ollama_window

        sleep 2

        start_litellm_window "$LITELLM_CONFIG" "$LITELLM_MASTER_KEY"

        pause_after_action

        ;;

      5)

        setup_common_values

        show_env_summary "$WORKSPACE_DIR" "$LITELLM_CONFIG" "$ANTHROPIC_BASE_URL" "$LITELLM_MASTER_KEY"

        pause_after_action

        ;;

      q|Q)

        echo "Goodbye."

        exit 0

        ;;

      *)

        echo "Invalid choice."

        pause_after_action

        ;;

    esac

  done

}

  

main_menu
```