const { Configuration, OpenAIApi } = require("openai");
const config = require('../config.json');

let currentApiKeyIndex = 0;

async function generateResponse(messageContent) {
    const apiKey = config.openaiApiKeys[currentApiKeyIndex];
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "assistant", content: "You are a helpful assistant." },
                { role: "user", content: messageContent }
            ],
        });

        const reply = completion.data.choices[0].message.content.trim();
        return reply;
    } catch (error) {
        if (error.response && error.response.status === 429) {
            const errorMessage = 'Превышен лимит скорости этого API ключа, повторите попытку позднее, или можете попытаться сейчас повторить запрос.';
            const consoleMessage = `Ошибка 429: Превышен лимит скорости. Дата: ${new Date().toISOString()}`;
            console.log(consoleMessage);
            return errorMessage;
        } else {
            const errorMessage = `Произошла ошибка при генерации ответа. Пожалуйста, попробуйте ещё раз или обратитесь к администратору.`;
            console.error(`${new Date().toISOString()} Не удалось сгенерировать ответ на :`, error);
            return errorMessage;
        }
    } finally {
        currentApiKeyIndex = (currentApiKeyIndex + 1) % config.openaiApiKeys.length;
    }
}

module.exports = { generateResponse };
