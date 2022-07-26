const moment = require('moment');
const ms = require('ms');
const Discord = require('discord.js');
require("moment-duration-format");
const db = require('quick.db');

module.exports = {
    name: "jail",
    aliases: ["ceza"],
    run: async(client, message, args) => {
        let embed = new Discord.MessageEmbed().setColor('#5865F2').setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true })).setTimestamp().setThumbnail(message.author.avatarURL);
        if (!client.config.jailMembers.some(id => message.member.roles.cache.has(id))&& (!message.member.hasPermission("ADMINISTRATOR"))) {
            return message.channel.send(embed.setDescription('Komutu kullanan kullanıcıda yetki bulunmamakta!')).then(x => x.delete({ timeout: 5000 }))
        }  
        let channel = client.guilds.cache.get(client.config.guildID).channels.cache.get(client.config.jailLog)
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        moment.locale('tr')
        if (!member) return message.channel.send(embed.setDescription("Kullanıcı etiketlenmedi veya bulunamadı!")).then(x => x.delete({ timeout: 5000 }))
        if (member.roles.highest.position >= message.member.roles.highest.position) {
            return message.channel.send(embed.setDescription("Belirttiğin kullanıcı seninle aynı yetkide veya senden üstün!")).then(x => x.delete({ timeout: 5000 }))
        }
        let time = args[1]
        if(!time) return message.channel.send(embed.setDescription(`Lütfen ne kadar jailde kalıcak yazınız.\n\nÖrnek: \`${client.config.prefix}jail @kullanıcı 1h <sebep>\``)).then(x => x.delete({ timeout: 5000 }))
        let reason = args.slice(2).join(' ');
        if (!reason || reason.split('.').join('').length < 5) return message.channel.send(embed.setDescription("Lütfen düzgün bir şekilde sebep belirtin.")).then(x => x.delete({ timeout: 5000 }))
        let jailzaman = ms(`${time}`)
        let ölç = db.get(`olçmebaşlat_${message.author.id}`) || [];
        if (ölç.filter(data => (Date.now() - data.time) < 60000).length >= 10) {
            message.delete();
            message.member.roles.set(client.config.jailRoles)
            let jaildekiler = db.get(`jaildekiler_${message.author.id}`) || [];
            return jaildekiler.forEach(x => {
                message.guild.members.cache.get(x.id).roles.set(x.roller.map(s => s.id));
            })
        }
        db.push(`${member.id}_sicil`, `${message.author} tarafından **${reason}**  sebebiyle **${moment().format('LLL')}** tarihinde **${time}** süresince **jaile atıldı**.`)
        member.roles.set(client.config.jailRoles)
        message.channel.send(embed.setDescription(`${member} Adlı Kullanıcı **${reason}** Sebebi ile **${time}** süresince Jaile Atıldı.`)).then(x => x.delete({ timeout: 5000 }))
        db.add(`${message.author.id}_jail`, 1)
        db.set(`xsally_${member.id}`, member.roles.cache.map(s => s))
        db.push(`jaildekiler_${message.author.id}`, { id: member.id, roller: member.roles.cache.map(s => s) })
        db.push(`olçmebaşlat_${message.author.id}`, { time: Date.now() });
        channel.send(embed.setTitle('Kullanıcı Hapishaneye Atıldı').setDescription(`Yetkili: ${message.author} - \`${message.author.id}\` \n Jaile Atılan: ${member} - \`${member.id}\` \n Sebep: ${reason} \n Süre: ${time} \n Tarih: **${moment().format('LLL')}**`))
        if (time) setTimeout(() => {
            member.roles.set(db.get(`xsally_${member.id}`).map(s => s.id))
            channel.send(embed.setTitle('Kullanıcı Tahliye Oldu').setDescription(`${member} Adlı Kullanıcının Tahliye Oldu!`))
        }, jailzaman)
    }
}
