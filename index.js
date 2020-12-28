const TelegramBot = require('node-telegram-bot-api');
const token = 'YOU_TOKEN';
const bot = new TelegramBot(token, { polling: true });

const key = require('./key')
const schema = require('./schema');
var port = process.env.PORT || 5500;
const mongoose = require('mongoose');
const admin = "YOU_CHAT_ID"; // "740188832";

module.exports = bot

const express = require("express")
const app = express()
app.use(express.static('public'));
app.get("/", (req, res) => {
    res.send("Hi!. :)))")
})

//mongodb connect 
mongoose.connect('mongodb+srv://admin:12222@cluster0.g6p9p.mongodb.net/gitmax?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    }).then(() => console.log('Database Connected'))
    .catch(err => console.log(err));

// on clobec query 

bot.on("callback_query", async(msg) => {

    // console.log(msg)
    let data = msg.data;
    let chatId = msg.from.id
    let id = data.split("#");
    // console.log(id[1])
    const res = await schema.book.findById(id[1]);
    // console.log(res)
    if (!res) {
        bot.sendMessage(
            chatId,
            `*Not file *`, {
                parse_mode: "Markdown",
            })
    }

    bot.sendDocument(chatId, res.file[id[0]].id, {
        caption: `*Nomi :* ${res.name}\n*Mualif*: ${res.autor}`,
        parse_mode: "Markdown"
    })

})

// on message telegram 
bot.on('message', async(msg) => {

    const chatId = msg.chat.id;
    const tx = msg.text;
    const userName = msg.chat.username;
    const photo = msg.photo;

    // foydalanuvchi qismi  start bosganda  
    if (tx == "/start") {
        const doc = new schema.bookUser({
            chat_id: chatId,
            event: 0,
        });
        await doc.save().then(async() => { console.log(1) }).catch(async() => { console.log(0) });
        // start xabari 
        if (admin == chatId)
            await bot.sendMessage(
                chatId,
                `Assalom aleykum.  *Book search xush kelibsiz* Kitobingizning mualifi va nomini kirting qaysdir qismini .`, {
                    parse_mode: "Markdown",
                    reply_markup: key.admin
                }
            );
        else
            await bot.sendMessage(
                chatId,
                `Assalom aleykum.  *Book search xush kelibsiz* Kitobingizning mualifi va nomini kirting qaysdir qismini .`, {
                    parse_mode: "Markdown"
                }
            );
        return;
    }

    const res = await schema.bookUser.findOne({ "chat_id": chatId });
    if (tx == 'Tugatish' && chatId == admin) {

        const doc = new schema.book({
            name: res.name,
            autor: res.autor,
            key: res.key,
            file: res.file
        });

        res.event = 0;
        res.name = ""
        res.autor = ""
        res.file = []
        res.key = ""
        res.save();

        await doc.save().then(async() => { console.log(1) }).catch(async() => { console.log(0) });
        bot.sendMessage(chatId, 'Kitob +++  ', {
            parse_mode: "Markdown",
            reply_markup: key.admin
        });
        return;
    }


    if (tx == "Kitob qo'shish" && chatId == admin) {
        res.event = 1;
        res.save();
        bot.sendMessage(chatId, 'Kitob nomni kirting ! . \n*Masalan* : Shaytanat  ', {
            parse_mode: "Markdown"
        });
        return;
    }

    if (res.event == 1 && chatId == admin) {
        res.name = tx;
        res.event = 2;
        res.save();
        bot.sendMessage(chatId, 'Kitob Mualifni kirting ! .\n*Masalan* : Tohir malik  ', {
            parse_mode: "Markdown"
        });
        return;
    }

    if (res.event == 2 && chatId == admin) {
        res.autor = tx;
        res.event = 3;
        res.save();
        bot.sendMessage(chatId, 'Kitob uchun kalit kirting ! . \n*Masalan* : Tohir malik shaytanat zor asar shaytanat 2 shaytanat 3 shaytanat 5  ', {
            parse_mode: "Markdown"
        });
        return;
    }

    if (res.event == 3 && chatId == admin) {
        res.key = tx;
        res.event = 4;
        res.save();
        bot.sendMessage(chatId, 'Kitob uchun fayil yuboring  ! . ', {
            parse_mode: "Markdown",
            reply_markup: key.adminYes,
        });
        return;
    }

    if (res.event == 4 && chatId == admin) {
        // console.log(msg.document.file_name)
        if (msg.document) res.file.push({ "id": msg.document.file_id, "type": msg.document.mime_type, "size": msg.document.file_size });
        res.save();
        bot.sendMessage(chatId, 'Kitob uchun fayil yuboring  ! . ', {
            parse_mode: "Markdown",
            reply_markup: key.adminYes,
        });
        return;
    }

    // console.log(msg)
    if (tx && !msg.reply_markup) {
        const res = await schema.book.find({ "key": { $regex: '.*' + tx + '.*' } })
            // console.log(res)
        if (res.length == 0) {
            bot.sendMessage(chatId, '❗️ Afsuski bunaqa *' + tx + '* manba mavjud emas !.', {
                parse_mode: "Markdown"
            });
        } else
            bot.sendMessage(chatId, '*Kalit*: ' + tx + '\n*Jami *: ' + res.length + ' ta malumot topildi .', {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: "Kitobni Ko'rish",
                            switch_inline_query_current_chat: tx
                        }],
                        [{
                            text: "Kitobni Jo'natish",
                            switch_inline_query: tx
                        }]
                    ]
                }
            });
    }

});

// kitob qidrsa 
bot.on('inline_query', async(msg) => {
    const res = await schema.book.find({ "key": { $regex: '.*' + msg.query + '.*' } })
    let natija = [];
    // console.log(msg.query)
    for (let key in res) {
        // console.log(res[key])
        arr = {
            type: 'article',
            id: res[key]._id,
            title: '📖' + res[key].name,
            description: "✍️" + res[key].autor,
            message_text: `*Nomi: *${res[key].name}\n*Maulif*:${res[key].autor}\n`,
            reply_markup: {
                inline_keyboard: []
            },
            parse_mode: "markdown"
        }

        let file = res[key].file
        for (let key2 in file) {
            arr['reply_markup']['inline_keyboard'].push(
                [{
                    text: file[key2].type.split("/")[1] + " (" + file[key2].size + "B)",
                    callback_data: key2 + "#" + res[key]._id
                }])
        }

        natija.push(arr)
    }
    // console.log(natija)
    bot.answerInlineQuery(msg.id, natija, {
        cache_time: 0,
        switch_pm_parameter: "search",
        switch_pm_text: msg.query
    });
});

// error kesa 
bot.on("polling_error", (err) => console.log("xato"));

// port yoqildi 
app.listen(port, () => {
    console.log("hi start ..")
});