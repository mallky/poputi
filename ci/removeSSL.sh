#!/bin/bash

# Конфигурация
SERVER_USER="mallky"
SERVER_IP="89.111.154.130"
SSL_PATH="/var/www/html/mallky.ru/server/ssl"

ssh $SERVER_USER@$SERVER_IP "export SUDO_ASKPASS=~/askpass.sh && sudo -A rm -rf $SSL_PATH" || \
    error_exit "Не удалось создать директории на сервере1"