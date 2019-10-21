#!/bin/bash

ENV=$1
SCRIPT_NAME=$2
[[ $ENV = 'production' ]] && SHORT_ENV="prod" || SHORT_ENV="dev"

if [ $(( SCRIPT_NAME )) -eq "ITKPIautopost" ]; then
    INTERVAL=3
    if [ $(( ENV )) -eq "production" ]; then
        WEEK=$(/bin/date +%v)
    else
        WEEK=$(/bin/date +%V)
    fi
    REPORT_CHANNEL=$3
    if [ $(( $WEEK % $INTERVAL )) -ne 0 ]; then
        exit 0
    fi
fi

GET_CONFIG_COMMAND="node -e "\""const config = require('./ecosystem.config.js').apps[0].env_${ENV};\
console.log(config.MONGO_URL, config.BOT_TOKEN, config.TELEGRAPH_ACCESS_TOKEN)"\"""
CONFIG=$(eval $GET_CONFIG_COMMAND)
CONFIG_ARRAY=($CONFIG)
MONGO_URL=${CONFIG_ARRAY[0]}
BOT_TOKEN=${CONFIG_ARRAY[1]}
TELEGRAPH_ACCESS_TOKEN=${CONFIG_ARRAY[2]}

CD_COMMAND="cd /home/fowi/node/jedi-bot/${SHORT_ENV}/source"
$CD_COMMAND
NODE_COMMAND="REPORT_CHANNEL=${REPORT_CHANNEL} TELEGRAPH_ACCESS_TOKEN=${TELEGRAPH_ACCESS_TOKEN} BOT_TOKEN=${BOT_TOKEN} MONGO_URL=${MONGO_URL} \
/home/fowi/.nvm/versions/node/v9.8.0/bin/node /home/fowi/node/jedi-bot/${SHORT_ENV}/source/scripts/${SCRIPT_NAME}"
$NODE_COMMAND
