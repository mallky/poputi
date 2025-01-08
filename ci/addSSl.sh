#!/bin/bash

# Конфигурация
SERVER_USER="mallky"
SERVER_IP="89.111.154.130"
SSL_PATH="/var/www/html/mallky.ru/server/ssl"

ssh $SERVER_USER@$SERVER_IP "mkdir -p $SSL_PATH" || \
    error_exit "Не удалось создать директории на сервере"
ssh $SERVER_USER@$SERVER_IP "export SUDO_ASKPASS=~/askpass.sh && sudo -A cp /etc/letsencrypt/live/mallky.ru-0001/privkey.pem $SSL_PATH && sudo -A cp /etc/letsencrypt/live/mallky.ru-0001/fullchain.pem $SSL_PATH && sudo -A chown mallky:mallky $SSL_PATH/privkey.pem && sudo -A chown mallky:mallky $SSL_PATH/fullchain.pem && sudo -A chmod 600 $SSL_PATH/privkey.pem && sudo -A chmod 600 $SSL_PATH/fullchain.pem" || \
    error_exit "Не удалось создать директории на сервере1"