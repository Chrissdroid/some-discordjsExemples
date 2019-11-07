// Discord.js integration
const Discord = require('discord.js');
const client = new Discord.Client();

// Here you put your things
const config = {
    // Bot token, be carefull and keed it private !
    token: "YOUR BOT TOKEN HERE",

    // If you want a Discord channel for yourself for keep the logs set it on true and fill logGuild and logChannel !
    discordLog: false,
    logGuild: "ID OF THE GUILD WHERE YOU WANT LOGS",
    logChannel: "ID OF THE GUILD CHANNEL WHERE YOU HAVE THE LOGS"
};

/** Class representing a log instance. */
class logInstance {
    /**
     * Create a new log instance.
     * @param {Object} options - Defaut param of the log instance.
     * @param {number} options.defaultColor - Defaut color used in the embed
     * @param {string} options.defaultShow - Defaut showing param of the log.
     */
    constructor({ defaultColor: color, defaultShow: show } = {
        color: null,
        show: 'all'
    }) {
        this.default.color = color;
        this.default.show = show;
    }

    /**
     * Send message to console
     * @param {string} title - Title of the logObject
     * @param {string} msg - Message of the logObject
     */
    console(title, msg) {
        console.log(`[${new Date().toLocaleString("en-US")}] => "${title}": "${msg}"\n`);
    }

    /**
     * Create a new log in the guild.
     * @param {(string|Object)} messageObj - Log content, can be a string or a Discord's RichEmbed fields format
     * @param {string} title - Title of the new log
     * @param {Object} options - Options of the log.
     * @param {string} options.target - userID of a potential targeted user
     * @param {number} options.color - Color used in the embed
     * @param {string} options.show - userID of a potential targeted user
     */
    new(messageObj, title = "Log", { target: target, color: color, show: show } = {
        target: null,
        color: null,
        show: null
    }) {
        if (typeof messageObj === 'undefined') throw new Error("Log object undefined");
        let mode = typeof messageObj === "string" ? true : false;
        if (!mode && messageObj.fields === 'undefined' || messageObj.message === 'undefined') throw new Error(`Invalid object format.`);

        const logembed = new Discord.RichEmbed()
            .setTitle(title)
            .setFooter(client.user.tag, client.user.avatarURL)
            .setTimestamp(new Date());

        if (color) logembed.setColor(color);
        else if (this.default.color) logembed.setColor(this.default.color);

        if (target) {
            const targetedUser = client.users.get(target);
            if (!targetedUser) throw new Error(`Target ID invalid or not reachable (${target}) !`);
            logembed.setAuthor(targetedUser.tag, targetedUser.avatarURL);
        }

        switch (typeof messageObj) {
            case 'string':
                logembed.setDescription(messageObj);
                break;

            case 'object':
                logembed.setDescription(messageObj.message);

                while (i in messageObj.fields) {
                    logembed.addField(i.name, i.value, i.inline);
                }
                break;

            default:
                throw new Error(`Invalid object type "${typeof messageObj}" provided.`);
        }

        if (!show) show = this.default.show;
        switch (show) {

            case 'all':
                if (config.discordLog) {
                    client
                        .guilds.get(config.logGuild)
                        .channels.get(logChannel)
                        .send({ embed: logembed });
                }
            /* falls through */
            case 'consoleOnly':
                let ctt = obj;
                if (!mode) ctt = JSON.stringify(messageObj);
                this.console(title, ctt);
                break;

            default:
                throw new Error(`Unreconized value options.show "${show}" provided.`);

        }
    }
}

// Create a new log instance and set your params as you want or let it empty !
client.log = new logInstance({ defaultShow: 'consoleOnly' });

// Use exemple
client.on('ready', () => {
    client.log.new(`${client.user.tag} is ready to work !`, 'Booting complete', { color: 7382272, show: 'all' });
});

// Login in !
client.login(config.token);