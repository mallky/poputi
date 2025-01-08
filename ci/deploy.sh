#!/bin/bash

# Конфигурация
SERVER_USER="mallky"
SERVER_IP="89.111.154.130"
WS_PORT="8080"
HTTP_PORT="8081"
FRONTEND_PATH="/var/www/html/mallky.ru"
BACKEND_PATH="/var/www/html/mallky.ru/server"
LOCAL_FRONTEND_PATH="./frontend/dist"
LOCAL_BACKEND_PATH="./backend"
SSL_PATH="/var/www/html/mallky.ru/server/ssl"

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Функция для вывода ошибок
error_exit() {
    echo -e "${RED}❌ Ошибка: $1${NC}" >&2
    exit 1
}

echo "🚀 Начинаем деплой..."

# Сборка фронтенда и бэкенда
echo "📦 Сборка фронтенда и бэкенда..."
npm run build

# Удаление директории с ssl
ssh $SERVER_USER@$SERVER_IP "export SUDO_ASKPASS=~/askpass.sh && sudo -A rm -rf $SSL_PATH" || \
    error_exit "Не удалось удалить директории на сервере"

# Проверка наличия директорий с билдами
if [ ! -d "$LOCAL_FRONTEND_PATH" ]; then
    error_exit "Директория с фронтендом не найдена. Сначала выполните сборку фронтенда"
fi

if [ ! -d "$LOCAL_BACKEND_PATH" ]; then
    error_exit "Директория с бэкендом не найдена. Сначала выполните сборку бэкенда"
fi

# Создание необходимых директорий на сервере
echo "📁 Создаем директории на сервере..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $FRONTEND_PATH $BACKEND_PATH" || \
    error_exit "Не удалось создать директории на сервере"

# Загрузка фронтенда
echo -e "${YELLOW}📦 Копируем файлы фронтенда...${NC}"
rsync -avz --delete $LOCAL_FRONTEND_PATH/ $SERVER_USER@$SERVER_IP:$FRONTEND_PATH || \
    error_exit "Ошибка при копировании файлов фронтенда"

# Создание временного файла исключений на основе .gitignore
echo -e "${YELLOW}📝 Подготовка файла исключений для rsync...${NC}"
RSYNC_IGNORE=".rsync-ignore-temp"
cat $LOCAL_BACKEND_PATH/.gitignore > $RSYNC_IGNORE
echo "node_modules/" >> $RSYNC_IGNORE
echo "dist/" >> $RSYNC_IGNORE
echo ".env" >> $RSYNC_IGNORE

# Загрузка бэкенда с использованием файла исключений
echo -e "${YELLOW}📦 Копируем файлы бэкенда...${NC}"
rsync -avz --delete --exclude-from=$RSYNC_IGNORE $LOCAL_BACKEND_PATH/ $SERVER_USER@$SERVER_IP:$BACKEND_PATH || \
    error_exit "Ошибка при копировании файлов бэкенда"

# Удаление временного файла
rm $RSYNC_IGNORE

# Добавление директории с ssl
ssh $SERVER_USER@$SERVER_IP "mkdir -p $SSL_PATH" || \
    error_exit "Не удалось создать директории на сервере"
ssh $SERVER_USER@$SERVER_IP "export SUDO_ASKPASS=~/askpass.sh && sudo -A cp /etc/letsencrypt/live/mallky.ru-0001/privkey.pem $SSL_PATH && sudo -A cp /etc/letsencrypt/live/mallky.ru-0001/fullchain.pem $SSL_PATH && sudo -A chown mallky:mallky $SSL_PATH/privkey.pem && sudo -A chown mallky:mallky $SSL_PATH/fullchain.pem && sudo -A chmod 600 $SSL_PATH/privkey.pem && sudo -A chmod 600 $SSL_PATH/fullchain.pem" || \
    error_exit "Не удалось создать директории на сервере"

# Установка зависимостей и перезапуск бэкенда на сервере
echo "🔄 Перезапускаем бэкенд..."

ssh $SERVER_USER@$SERVER_IP "export SUDO_ASKPASS=~/askpass.sh && echo sudo -A lsof -i:$WS_PORT -t && echo sudo -A lsof -i:$HTTP_PORT -t " || \
    error_exit "Ошибка при перезапуске бэкенда"

ssh $SERVER_USER@$SERVER_IP "cd $BACKEND_PATH && npm i && npm run build && node dist/server.js" || \
    error_exit "Ошибка при перезапуске бэкенда"

echo -e "${GREEN}✅ Деплой успешно завершен!${NC}"