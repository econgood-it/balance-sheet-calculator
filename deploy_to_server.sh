#!/usr/bin/env bash
set -e

npm update
npm install
npm audit fix
docker-compose down
docker-compose up -d
npm run test:prod
docker-compose down
npm run build
rm -r node_modules
npm install --production
rsync -a dist ecg00-bcalc@ecg00.hostsharing.net: --delete
rsync -a node_modules ecg00-bcalc@ecg00.hostsharing.net: --delete
ssh ecg00-bcalc@ecg00.hostsharing.net 'bash bin/node-svc.sh restart'
