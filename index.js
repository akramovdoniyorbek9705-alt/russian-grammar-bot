const { Telegraf } = require('telegraf');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, HeadingLevel, WidthType, AlignmentType, TextRun } = require('docx');
const fs = require('fs');
const http = require('http');

// Render.com o'chib qolmasligi uchun HTTP server portini tinglash
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running successfully!');
}).listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

const BOT_TOKEN = process.env.BOT_TOKEN || '8970534182:AAEETTAz1zYvYV5EtRMJ0HX_wkQTrjVRkjg';
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    `Salom, ${ctx.from.first_name}! 👋\n\n` +
    `Rus tili akademik botiga xush kelibsiz!\n\n` +
    `Menga istalgan ruscha so'zni yuboring (fe'l, ot yoki sifat), men uning to'liq akademik jadvali va 10 ta namuna gapini Word (.docx) formatida tayyorlab beraman.`
  );
});

bot.on('text', async (ctx) => {
  const word = ctx.message.text.trim();
  const lower = word.toLowerCase();
  const filePath = `./${word}_grammatika.docx`;

  let wordType = "Существительное (Ot)";
  let headers = [];
  let rows = [];

  // 1. Fe'l (Glagol) tahlili - Academic capitalization & exact lower case verb format
  if (lower.endsWith('ть') || lower.endsWith('ться') || lower.endsWith('ти') || lower.endsWith('чь')) {
    wordType = "Глагол (Fe'l)";
    headers = ["", "Прошедшее", "Настоящее", "Будущее"];
    
    const stem = word.replace(/(ся|ть|ти|чь)$/i, '');
    const isSecondConj = lower.endsWith('ить') || lower.endsWith('еть');
    const lowerWord = word.toLowerCase();
    
    rows = [
      ["Я", `${stem}л`, isSecondConj ? `${stem}ю` : `${stem}ю`, `Буду ${lowerWord}`],
      ["Ты", `${stem}л`, isSecondConj ? `${stem}ишь` : `${stem}ешь`, `Будешь ${lowerWord}`],
      ["Он", `${stem}л`, isSecondConj ? `${stem}ит` : `${stem}ет`, `Будет ${lowerWord}`],
      ["Она", `${stem}ла`, isSecondConj ? `${stem}ит` : `${stem}ет`, `Будет ${lowerWord}`],
      ["Мы", `${stem}ли`, isSecondConj ? `${stem}им` : `${stem}ем`, `Будем ${lowerWord}`],
      ["Вы", `${stem}ли`, isSecondConj ? `${stem}ите` : `${stem}ете`, `Будете ${lowerWord}`],
      ["Они", `${stem}ли`, isSecondConj ? `${stem}ят` : `${stem}ют`, `Будут ${lowerWord}`]
    ];
  } 
  // 2. Sifat (Prilagatelnoye) tahlili
  else if (lower.endsWith('ый') || lower.endsWith('ий') || lower.endsWith('ой') || lower.endsWith('ая') || lower.endsWith('яя') || lower.endsWith('ое') || lower.endsWith('ее')) {
    wordType = "Прилагательное (Sifat)";
    headers = ["Падеж (Kelshik)", "Мужской род", "Женский род", "Средний род", "Множественное число"];
    
    const base = word.slice(0, -2);
    const isSoft = lower.endsWith('ий') || lower.endsWith('яя') || lower.endsWith('ее');
    
    rows = [
      ["Именительный", `${word}`, `${base}${isSoft ? 'яя' : 'ая'}`, `${base}${isSoft ? 'ее' : 'ое'}`, `${base}${isSoft ? 'ие' : 'ые'}`],
      ["Родительный", `${base}${isSoft ? 'его' : 'ого'}`, `${base}${isSoft ? 'ей' : 'ой'}`, `${base}${isSoft ? 'его' : 'ого'}`, `${base}${isSoft ? 'их' : 'ых'}`],
      ["Дательный", `${base}${isSoft ? 'ему' : 'ому'}`, `${base}${isSoft ? 'ей' : 'ой'}`, `${base}${isSoft ? 'ему' : 'ому'}`, `${base}${isSoft ? 'им' : 'ым'}`],
      ["Винительный", `Как Ив. или Род.`, `${base}${isSoft ? 'юю' : 'ую'}`, `${base}${isSoft ? 'ее' : 'ое'}`, `Как Ив. или Род.`],
      ["Творительный", `${base}${isSoft ? 'им' : 'ым'}`, `${base}${isSoft ? 'ей' : 'ой'}`, `${base}${isSoft ? 'им' : 'ым'}`, `${base}${isSoft ? 'ими' : 'ыми'}`],
      ["Предложный", `о ${base}${isSoft ? 'ем' : 'ом'}`, `о ${base}${isSoft ? 'ей' : 'ой'}`, `о ${base}${isSoft ? 'ем' : 'ом'}`, `о ${base}${isSoft ? 'их' : 'ых'}`]
    ];
  }
  // 3. Ot (Существительное) tahlili
  else {
    wordType = "Существительное (Ot)";
    headers = ["Падеж (Kelshik)", "Единственное число (Birlik)", "Множественное число (Ko'plik)"];
    rows = [
      ["Именительный", `${word}`, `${word}ы / ${word}и`],
      ["Родительный", `нет ${word}а / ${word}и`, `нет ${word}ов / ${word}ей`],
      ["Дательный", `к ${word}у / ${word}е`, `к ${word}ам / ${word}ям`],
      ["Винительный", `вижу ${word}`, `вижу ${word}ы / ${word}и`],
      ["Творительный", `доволен ${word}ом / ${word}ой`, `доволен ${word}ами / ${word}ями`],
      ["Предложный", `думаю о ${word}е`, `думаю о ${word}ах / ${word}ях`]
    ];
  }

  // 10 ta akademik namuna gaplar
  const sentences = [
    `1. В тексте четко выделяется форма слова "${word}".`,
    `2. Мы подробно разобрали правило применения слова "${word}".`,
    `3. Каждый студент должен грамотно использовать слово "${word}" в речи.`,
    `4. Преподаватель задал вопрос, связанный со значением слова "${word}".`,
    `5. В академическом упражнении требуется изменить форму слова "${word}".`,
    `6. Правильное употребление слова "${word}" повышает уровень владения языком.`,
    `7. Я записал примеры и варианты согласования со словом "${word}".`,
    `8. На практическом занятии мы обсудили особенности слова "${word}".`,
    `9. В словаре дается подробная грамматическая справка о слове "${word}".`,
    `10. Домашнее задание включает в себя полный морфологический разбор слова "${word}".`
  ];

  try {
    const waitingMsg = await ctx.reply(`⏳ "${word}" uchun akademik Word hujjati tayyorlanmoqda...`);

    const tableRows = [
      new TableRow({
        children: headers.map(h => new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })]
        }))
      }),
      ...rows.map(rowArr => new TableRow({
        children: rowArr.map(val => new TableCell({ children: [new Paragraph(val)] }))
      }))
    ];

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: `${word}`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows
          }),
          new Paragraph({ text: "", spacing: { after: 400 } }),
          new Paragraph({ text: "Примеры предложений (10 академических примеров):", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
          ...sentences.map(s => new Paragraph(s))
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);

    await ctx.replyWithDocument({ source: filePath, filename: `${word}_grammatika.docx` });
    
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, waitingMsg.message_id);
    } catch (e) {
      console.log("Xabarni o'chirishda xato:", e.message);
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(error);
    ctx.reply("❌ Xatolik yuz berdi. Qaytadan urinib ko'ring.");
  }
});

bot.launch();
console.log("Bot muvaffaqiyatli ishga tushdi!");

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));