const moment = require('moment');
const ms = require('ms');
const Discord = require('discord.js');
require("moment-duration-format");
const db = require('quick.db');

module.exports = {
    name: "mute",
    aliases: ["mute", "vmute", "sesmute", "chatmute"],
    run: async(client, message, args) => {
        let embed = new Discord.MessageEmbed().setColor('#5865F2').setAuthor(message.member.displayName, message.author.avatarURL({ dynamic: true })).setTimestamp();
        if (!client.config.muteMembers.some(id => message.member.roles.cache.has(id))&& (!message.member.hasPermission("ADMINISTRATOR"))) {
            return message.channel.send(embed.setDescription('Komutu kullanan kullanıcıda yetki bulunmamakta!')).then(x => x.delete({ timeout: 5000 }))
        }
        let channel = client.guilds.cache.get(client.config.guildID).channels.cache.get(client.config.muteLog)
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return message.channel.send(embed.setDescription("Kullanıcı etiketlenmedi veya bulunamadı!")).then(x => x.delete({ timeout: 5000 }))
        let embed2 = new Discord.MessageEmbed().setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true })).setThumbnail(member.user.avatarURL({ dynamic: true })).setTimestamp().setFooter(`${message.author.tag} yetkilisi tarafından mutelendi`);
        moment.locale('tr')
        if (member.roles.highest.position >= message.member.roles.highest.position) {
            return message.channel.send(embed.setDescription("Belirttiğin kullanıcı seninle aynı yetkide veya senden üstün!")).then(x => x.delete({ timeout: 5000 }))
        }
        let time = args[1]
        if(!time) return message.channel.send(embed.setDescription(`Lütfen ne kadar muteli kalıcak yazınız.\n\nÖrnek: \`${client.config.prefix}mute @kullanıcı 1h <sebep>\``)).then(x => x.delete({ timeout: 5000 }))
        let reason = args.slice(2).join(' ');
        if (!reason || reason.split('.').join('').length < 5) return message.channel.send(embed.setDescription("Lütfen Düzgün Bir Şekilde Sebep Belirtin.")).then(x => x.delete({ timeout: 5000 }))
        let mutezaman = ms(`${time}`)
        const filter = (reaction, user) => {
            return ['📄', '🔇'].includes(reaction.emoji.name) && user.id == message.author.id;
        };
        await message.channel.send(embed.setDescription(`${member}, adlı kullanıcıyı yazı kanallarında susturmak için '📄' emojisine seste sustrmak için '🔇'emojisine basınız!`)).then(async msg => {
            await msg.react("📄")
            await msg.react("🔇")
            msg.awaitReactions(filter, {
                max: 1,
                time: 15000,
                errors: ['time']
            }).then(async(collected) => {
                await msg.reactions.removeAll()
                const reaction = collected.first();
                if (reaction.emoji.name == "📄") {
                    db.push(`${member.id}_sicil`, `${message.author} tarafından **${reason}** sebebiyle **${moment().format('LLL')}** tarihinde **${time}** süresince **__yazı__ kanallarında susturuldu**.`)
                    db.add(`${message.author.id}_chatmute`, 1)
                    member.roles.add(client.config.muteRoles)
                    return msg.edit(embed.setDescription(`${member} adlı kullanıcı **yazı** kanallarında **${reason}** sebebiyle **${time}** süresince susturuldu`)).then(() => {
                        channel.send(embed2.setTitle('Kullanıcı Susturuldu').setDescription(`Yetkili: ${message.author} - \`${message.author.id}\` \n Susturulan: ${member} - \`${member.id}\` \n Sebep: ${reason} \n Süre: ${time} \n Tip: Text Kanalları \n Tarih: **${moment().format('LLL')}**`))
                        if (time) setTimeout(() => {
                            member.roles.remove(client.config.muteRoles)
                            channel.send(embed2.setTitle('Kullanıcı Susturması Açıldı').setDescription(`${member} Adlı Kullanıcının text mutesi açıldı!`))
                        }, mutezaman)
                    })
                } else if (reaction.emoji.name == "🔇") {
                    db.push(`${member.id}_sicil`, `${message.author} tarafından **${reason}**  sebebiyle **${moment().format('LLL')}** tarihinde **${time}** süresince **__ses__ kanallarında susturuldu**. `)
                    db.add(`${message.author.id}_sesmute`, 1)
                    member.roles.add(client.config.voicemuteRoles)
                    member.voice.kick();
                    return msg.edit(embed.setDescription(`${member} adlı kullanıcı **ses** kanallarında **${reason}** sebebiyle **${time}** süresince susturuldu`)).then(() => {
                        channel.send(embed2.setTitle('Kullanıcı Susturuldu').setDescription(`Yetkili: ${message.author} - \`${message.author.id}\` \n Susturulan: ${member} - \`${member.id}\` \n Sebep: ${reason} \n Süre: ${time} \n Tip: Ses Kanalları \n Tarih: **${moment().format('LLL')}**`))
                        if (time) setTimeout(() => {
                            member.roles.remove(client.config.voicemuteRoles)
                            channel.send(embed2.setTitle('Kullanıcı Susturması Açıldı').setDescription(`${member} Adlı Kullanıcının ses mutesi açıldı!`))
                        }, mutezaman)
                    })
                }
            })
        })
    }
}
