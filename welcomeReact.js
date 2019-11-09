// Discord.js integration
const Discord = require('discord.js');
const client = new Discord.Client();

// Put your things here !
const config = {
    // Bot token, be carefull and keed it private !
    token: "YOUR BOT TOKEN HERE",

    /* Setup your server !
     * 
     * You'll need a role in your server to have 0 permissions on.
     * He just need to sees the nessary channels likes the rules and informations about your server,
     * it'll be the default role when someone arrives in your server !
     * 
     * ( the bots need to haves permission to create channels, manages permission and adds roles )
     * ( Be carefull to don't forget to put the bot role above the default role ! )
     * 
     * And then let the bot does the next ! 
     */
    defaultGuildID: "YOUR GUILD ID HERE",
    defaultRole: "DEFAULT ROLE NAME HERE",
    verificationChannelName: "NAME OF THE VERIFICATION CHANNEL HERE",
    verificationMessage: "MESSAGE SENDED IN THE CHANNEL TO REACT TO HERE",
    reaction: '✅',

    // Set it on true if you want a welcoming message on react !
    welcomeMessage: false,
    welcomeContent: "Welcome, $USER$ !",
    welcomeChannel: "ID OF THE WELCOMING CHANNEL HERE"
};

// init bot
let verifMsg = null;
client.on('ready', async () => {
    const guild = client.guilds.get(config.defaultGuildID);
    if (!guild) throw new Error(`Invalid guild ID passed in config.defaultGuildID (${config.defaultGuildID}).`);

    const verifRole = guild.roles.find(role => role.name === config.defaultRole);
    if (!verifRole) throw new Error(`Invalid Role name passed in config.defaultRole (${config.defaultRole}).`);

    let verifChannel = guild.channels.find(chan => chan.name === config.verificationChannelName);
    if (typeof verifChannel === 'undefined') {
        verifChannel = await guild.createChannel(config.verificationChannelName, {
            permissionOverwrites: [{
                deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                allow: ['ADD_REACTIONS']
            }]
        }).catch(err => console.log('ERROR :\n' + err));
        await verifChannel.overwritePermissions(verifRole, {
            'VIEW_CHANNEL': true
        }).catch(err => console.log('ERROR :\n' + err));
        verifMsg = await verifChannel.send(config.verificationMessage);
        await verifMsg.react(config.reaction);
    }
    if (!verifMsg) {
        verifMsg = verifChannel.messages.find(msg => msg.content === verificationMessage);
        if (typeof verifMsg === 'undefined') {
            verifMsg = await verifChannel.send(config.verificationMessage);
        }
        await verifMsg.react(config.reaction);
    }

    console.log(`${client.user.tag} online and ready !`);
});

// add the default role on arriving
client.on('guildMemberAdd', member => {
    if (member.user.bot) return;

    const targetGuild = client.guilds.get(config.defaultGuildID);
    if (!targetGuild) throw new Error(`Invalid guild ID passed in config.defaultGuildID (${config.defaultGuildID}).`);

    const defaultRole = targetGuild.roles.find(role => role.name === config.defaultRole);
    if (!defaultRole) throw new Error(`Invalid Role name passed in config.defaultRole (${config.defaultRole}).`);

    member.addRole(defaultRole).catch(err => console.log('ERROR :\n' + err));
});

// Detect message reaction add and remove role to member
client.on('messageReactionAdd', async (messageReaction, user) => {
    if (
        !messageReaction.message.guild ||
        messageReaction.message.guild.id !== config.defaultGuildID ||
        messageReaction.message.content !== config.verificationMessage ||
        messageReaction.emoji !== config.reaction ||
        messageReaction.message.channel.name !== config.verificationChannelName
    ) return;

    const targetedGuild = client.guilds.get(config.defaultGuildID);
    if (!guild) throw new Error(`Invalid guild ID passed in config.defaultGuildID (${config.defaultGuildID}).`);

    const role = guild.roles.find(role => role.name === config.defaultRole);
    if (!role) throw new Error(`Invalid Role name passed in config.defaultRole (${config.defaultRole}).`);

    const member = targetedGuild.members.get(user.id);
    if (!member) throw new Error(`Cannot find guildmember (${user.tag}).`);

    if (!member.roles.has(role)) return;
    await member.removeRole(role).catch(err => console.log('ERROR :\n' + err));

    if (config.welcomeMessage) {
        const welcomeChan = targetedGuild.channels.get(config.welcomeChannel);
        if (!welcomeChan) throw new Error(`Invalid guildChannel ID passed in config.welcomeChannel (${config.welcomeChannel}).`);

        const toSend = config.welcomeContent.replace('$USER$', member);
        welcomeChan.send(toSend).catch(err => console.log('ERROR :\n' + err));
    }
});

// Login in !
client.login(config.token);
