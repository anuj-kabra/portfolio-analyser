#!/bin/bash

# Start backend
cd /Users/akashshinde/Projs/portfolio-analyser/backend
npm run dev &

# Start frontend
cd /Users/akashshinde/Projs/portfolio-analyser/frontend
npm run dev &

# Wait so script keeps running
wait