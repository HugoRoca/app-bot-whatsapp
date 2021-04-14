const { Client, MessageMedia } = require("whatsapp-web.js");
const qrCode = require("qrcode-terminal");
const fs = require("fs");
const ora = require("ora");
const chalk = require("chalk");

const SESSION_FILE_PATH = "./session.json";

let client;
let sessionData;

const withSession = () => {
  const spinner = ora(
    `Loading ${chalk.yellow("Validate session with whatsApp...")}`
  );
  sessionData = require(SESSION_FILE_PATH);
  spinner.start();

  client = new Client({
    session: sessionData,
  });

  client.on("ready", () => {
    console.log("Client ready");
    spinner.stop();
    listenMessage()
  });

  client.on("auth_failure", () => {
    spinner.stop();
    console.log("** error authenticate **")
  })

  client.initialize()
};

/**
 * This session generate qrCode
 */
const withOutSession = () => {
  console.log("Session not started");
  client = new Client();

  client.on("qr", (qr) => {
    qrCode.generate(qr, { small: true });
  });

  client.on("authenticated", (session) => {
    sessionData = session;
    console.log(session)
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
      if (err) {
        console.log(err);
      }
    });
  });

  client.initialize();
};

/**
 * Function for listen messages
 */
const listenMessage = () => {
  client.on('message', (msg) => {
    const { from, to, body } = msg
    let message = ''

    switch (body) {
      case 'quiero_info':
        message = 'What do you want information about? NODE, PHP o ANGULAR?'
        break;
      case 'adios':
        message = 'See you later! Remember'
        break
      case 'hello':
        sendMedia(from, 'course.png')
        break;
      default:
        break;
    }
    console.log(`${chalk.yellow(body)}`)
    if (message !== '') sendMessage(from, message)
  })
}

const sendMedia = (to, file) => {
  const mediaFile = MessageMedia.fromFilePath(`./media-send/${file}`)
  client.sendMessage(to, mediaFile)
}

/**
 * send message
 */
const sendMessage = (to, message) => {
  client.sendMessage(to, message)
}

/** */
fs.existsSync(SESSION_FILE_PATH) ? withSession() : withOutSession();
