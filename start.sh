#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# PID file to track running processes
PID_FILE="$SCRIPT_DIR/.start_pids"

# Cleanup function to kill all child processes
cleanup() {
    echo ""
    echo "Shutting down services..."
    if [ -f "$PID_FILE" ]; then
        while read -r pid; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null
                wait "$pid" 2>/dev/null
            fi
        done < "$PID_FILE"
        rm -f "$PID_FILE"
    fi
    # Kill any remaining node/vite processes spawned by this script
    pkill -P $$ 2>/dev/null
    exit 0
}

# Trap signals to ensure cleanup
trap cleanup SIGINT SIGTERM EXIT

# Check if already running
if [ -f "$PID_FILE" ]; then
    echo "Warning: Previous instance may still be running. Cleaning up..."
    cleanup
fi

# Create empty PID file
touch "$PID_FILE"

# Start backend
echo "Starting backend..."
cd "$SCRIPT_DIR/backend"
npm run dev > "$SCRIPT_DIR/.backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID >> "$PID_FILE"
echo "Backend started (PID: $BACKEND_PID)"

# Start frontend
echo "Starting frontend..."
cd "$SCRIPT_DIR/frontend"
npm run dev > "$SCRIPT_DIR/.frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID >> "$PID_FILE"
echo "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "Both services are running. Logs:"
echo "  Backend:  tail -f $SCRIPT_DIR/.backend.log"
echo "  Frontend: tail -f $SCRIPT_DIR/.frontend.log"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Monitor processes and exit if both die
while true; do
    sleep 2
    if ! kill -0 "$BACKEND_PID" 2>/dev/null && ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
        echo "Both processes have stopped. Exiting..."
        break
    fi
done

cleanup