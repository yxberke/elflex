const ms = require('ms');
const db = require('quick.db');
const Discord = require('discord.js');
module.exports = {
    name: "unmute",
    run: async(client, message, args) => {
        if (!client.config.jailMembers.some(id => message.member.roles.cache.has(id))&& (!message.member.hasPermission("ADMINISTRATOR"))) {
            return message.channel.send(embed.setDescription("Bu Komut İçin Yetkin Bulunmuyor."))
        }
        let embed = new Discord.MessageEmbed()
		.setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true }))
		.setTimestamp()
    .setColor('#5865F2')
		.setThumbnail(message.author.avatarURL)
		.setFooter('Developed by The Lord¿');
		
        let member = message.mentions.members.first();
        if (!member) return message.channel.send(embed.setDescription("Kullanıcı bulunamadı veya etiketlenmedi!"))
        if (!db.get(`${message.author.id}_chatmute`)) return message.channel.send(embed.setDescription("Bu Kullanıcı Muteli Değil!"))
        member.roles.remove(client.config.muteRoles, client.config.voicemuteRoles) 
        message.channel.send(embed.setDescription(`${member} adlı kullanıcının mutesi kaldırıldı.`))
        message.guild.channels.cache.get(client.config.muteLog).send(embed.setDescription(`${message.author} adlı yetkili tarafından ${member} adlı kullanıcının mutesi kaldırıldı!`))
    }
}
