# .codex/setup.sh
#!/bin/bash
set -e

# Install dependencies
npm install

# Ensure Vite is executable
chmod +x node_modules/.bin/vite
