#!/bin/bash
cd /home/agent-lead/onepost-ai
curl -s "https://onepostai-hbl56q463-aureahaventechs-projects.vercel.app" | head -100 | grep -c "indigo\|purple"
echo "---"
curl -s "https://onepostai-hbl56q463-aureahaventechs-projects.vercel.app" | head -100 | grep -c "gold\|#c9a84c\|card-luxury"
echo "---"
git log --oneline -1
