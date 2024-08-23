#!/bin/bash 

#PRODUCTION  chmod +x ./deploy.sh
git reset --hard
git checkout master
git pull origin master

docker compose up -d