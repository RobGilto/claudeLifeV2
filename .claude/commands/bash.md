# /bash - Execute Bash Commands

## Purpose
Execute arbitrary bash commands through the run-command.sh script wrapper.

## Usage
```
/bash [command with arguments]
```

## Examples
```
/bash "ls -la"
/bash "git status"
/bash "npm run build"
/bash "find . -name '*.js' | head -10"
```

## Implementation

Execute the provided command using the run-command.sh script:

```bash
./scripts/run-command.sh "[user_command]"
```

## Notes
- Commands with spaces or special characters should be quoted
- The script will echo the command being executed and wrap output with separators
- Use this for quick command execution when you need bash functionality
- For complex multi-step operations, consider using the Bash tool directly

## Security
- Be cautious with user input
- Validate commands before execution
- Avoid executing commands that could be destructive without user confirmation