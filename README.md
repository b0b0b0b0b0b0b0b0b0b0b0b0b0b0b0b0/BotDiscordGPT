# Чат GPT в DISCORD на node js

Это обычный бот на node.js
Для работы вам понадобится установить OpenAIApi, axios. 

Вам остаётся только скачать и запусть основной файл: **app.js**


## Установка: 
- Скачивайте архив.
- Открываете папку с проектом в терминале.
- В зависимости от пакетного менеджера устанавливаете зависимости. (`npm install`). Это установит все необходимые зависимости из файла https://github.com/b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0/BotDiscordGPT/blob/main/package.json
- После установки необходимых зависимостей читайте инфомарцию ниже.

## Настройка: 
Для настройки у вас есть три файла:
1) app.js (https://github.com/b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0/BotDiscordGPT/blob/main/app.js) в нём находятся все сообщения отображаемые ботом.
2) config.json (https://github.com/b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0/BotDiscordGPT/blob/main/config.json) конфигурационный файл, где вы настраиваете токены, префиксы и статус бота и gpt.
3) davinci.js (https://github.com/b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0/BotDiscordGPT/blob/main/mods/davinci.js) это модуль самого gpt, в котором вы нажете добавить дополнительные параметры, к обращению на gpt.

### Перед запуском главное настройте файл config.json.

Так же нужно понимать, что для запуска вы должны создать бота, и пригласить его на сервер. https://discord.com/developers/applications/

