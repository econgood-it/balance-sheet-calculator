#!/usr/bin/env bash
npm install
npm run build
rsync -a dist ecg00-bcalc@ecg00.hostsharing.net:
rsync -a node_modules ecg00-bcalc@ecg00.hostsharing.net:
ssh ecg00-bcalc@ecg00.hostsharing.net 'bash bin/node-svc.sh restart'
