#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start backend
cd "$SCRIPT_DIR/backend"
npm run dev &

# Start frontend
cd "$SCRIPT_DIR/frontend"
npm run dev &

# Wait so script keeps running
wait