const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('./config.json');
const davinci = require('./mods/davinci');
const axios = require('axios');
const maxCharacterLimit = 8700;
const allowedFileExtensions = ['log', 'txt', 'json', 'properties', 'yml'];
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

let waitingForContinuation = new Map(); // Коллекция для отслеживания запроса на продолжение
let remainingResponses = new Map(); // Коллекция с оставшимися ответами

client.once('ready', () => {
    console.log(`Bot has started as ${client.user.tag}.`);
    client.user.setActivity(config.status);
});


client.on('messageCreate', async (message) => {

    if (message.author.bot) return;

    if (message.channel.id === config.channelId) {
        try {
            let input = message.content;
            let fileDescription = '';
            const userMention = `<@${message.author.id}>`;
            const userQuestion = input.slice(0, 200);

            if (message.attachments.size > 0) {
                const attachment = message.attachments.first();
                const fileExtension = attachment.name.split('.').pop().toLowerCase();

                if (allowedFileExtensions.includes(fileExtension)) {
                    const attachmentBuffer = await axios.get(attachment.url, { responseType: 'arraybuffer' });
                    const attachmentContent = attachmentBuffer.data.toString();

                    fileDescription = `📎 **К сообщению gpt также прикреплен файл.**\n\n`;
                    input += '\n\n' + attachmentContent;
                }
            }

            const reactionEmoji = message.guild.emojis.cache.find(
                (emoji) => emoji.name === config.yourReactionEmoji
            );

            if (reactionEmoji) {
                await message.react(reactionEmoji);
            }
            message.channel.sendTyping();
            const typingInterval = setInterval(() => {
                message.channel.sendTyping();
            }, 7000);

            const response = await davinci.generateResponse(input);

            clearInterval(typingInterval);

            const maxMessageLength = 4096;
            const embedDescriptionLength = `**❔ Вопрос от ${userMention}:**\n\n${userQuestion}\n\n${fileDescription}**💡 Ответ:**\n\n`.length;
            const maxResponseLength = maxMessageLength - embedDescriptionLength;

            if (response.length <= maxResponseLength) {
                const embed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('🟢 BM gpt 🟢')
                    .setDescription(`**❔ Вопрос от ${userMention}:**\n\n${userQuestion}\n\n${fileDescription}**💡 Ответ:**\n${response}\n`)
                    .setFooter({ text: 'Сделано с любовью' });

                const replyMessage = await message.reply({ embeds: [embed] });

            } else {
                let remainingResponse = response;
                while (remainingResponse.length > 0) {
                    let currentResponse = remainingResponse.slice(0, maxResponseLength);
                    remainingResponse = remainingResponse.slice(maxResponseLength);

                    const embed = new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle('🟢 BM gpt 🟢')
                        .setDescription(currentResponse)
                        .setFooter({ text: 'Сделано с любовью' });

                    const replyMessage = await message.reply({ embeds: [embed] });
                }
            }
        } catch (error) {
            // Обработка ошибок
            console.error('Failed to generate response:', error);
            let errorMessage;

            if (error.code === 502) {
                await message.react('❌');
                errorMessage = `Кажется, ГПТ устроило забастовку и отказалось работать. Им нужен перерыв, чтобы исправить свои ошибки. Пожалуйста, попробуйте ещё раз или подождите, пока они разберутся. \n\n Код ошибки: **502**`;
            } else if (error.code === 504) {
                await message.react('❌');
                errorMessage = `Кажется, ГПТ решило взять перерыв и отдохнуть. Они сказали, что ответ от них затерялся где-то в космосе. Попробуйте ещё раз или отложите свой вопрос на некоторое время. \n\n Код ошибки: **504**`;
            } else if (error.code === 404) {
                await message.react('❌');
                errorMessage = `Ой, я заблудился и не могу найти нужную информацию. Может быть, я нажал не ту кнопку или потерял свои киберочки? Давайте попробуем снова или дайте мне подсказку, чтобы я смог вам помочь. \n\n Код ошибки: **404**`;
            } else if (error.code === 400) {
                await message.react('❌');
                errorMessage = `Ох, я сломал немного свою кибернетическую математику и не могу обработать ваш запрос. Может быть, вы можете сформулировать его иначе или дать мне другой вопрос, чтобы я смог найти правильное решение? \n\nКод ошибки: **400**`;
            } else if (error.code === 503) {
                await message.react('❌');
                errorMessage = `ГПТ отправился в космическое путешествие, и их сервера временно недоступны. Они отправили мне сообщение с просьбой передать, что они скучают по вашим вопросам и обещают вернуться как можно скорее. Попробуйте еще раз через некоторое время. \n\nКод ошибки: **503**`;
            } else {
                errorMessage = `GPT вернул непонятную ошибку, поэтому я не знаю что сюда написать. В общем, пробуй ещё раз. Может сработает.`;

                await message.react('❌');
            }

            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Ошибка')
                .setDescription(errorMessage)
                .setFooter({ text: 'Сделано с любовью' });

            await message.reply({ embeds: [errorEmbed] });
        }
    }

});

client.login(config.token);
