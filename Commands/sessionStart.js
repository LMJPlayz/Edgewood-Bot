const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require("discord.js");
  
  const channelId = "1101845501734821988"; // channel id
  const headerImageUrl = "https://image2url.com/r2/default/images/1771382669654-22f7774d-f65f-45f8-90b5-820bfd168fbf.png";
  const footerImageUrl = "https://image2url.com/r2/default/images/1771382741713-1d449ef2-5033-4450-bfd8-8c21e862276a.png";
  const quickJoinUrl = "https://policeroleplay.community/join/YNLIJ"; // full url including https://
  
  module.exports = {
    roles: ["1102282210536607856"], // role ids that can use this
    data: new SlashCommandBuilder()
      .setName("session-startup")
      .setDescription("Host a session start up."),
    async execute(interaction, client) {
      const embed1 = new EmbedBuilder().setColor("#fa8740");
      if (headerImageUrl !== "https://image2url.com/r2/default/images/1771382669654-22f7774d-f65f-45f8-90b5-820bfd168fbf.png") embed1.setImage(headerImageUrl);
  
      const serverName = "Edgewood Borough Roleplay |Strict|VC Optional "; // server name
      const serverOwner = "Booskiboo1227"; // server owner
      const joinCode = "YNLIJ"; // join code
      const embed2 = new EmbedBuilder()
        .setColor("#fa8740")
        .setTitle("**Session Startup**")
        .setDescription(
          "> A server start-up has been initiated! Please ensure you have read and understood our regulations prior to joining.\n\n" +
            "**Game Information**\n" +
            "> **Server Name**: " + serverName + "\n" +
            "> **Server Owner**: " + serverOwner + "\n" +
            "> **Join Code**: " + joinCode + "\n\n"
        );
      if (footerImageUrl !== "https://image2url.com/r2/default/images/1771382741713-1d449ef2-5033-4450-bfd8-8c21e862276a.png") embed2.setImage(footerImageUrl);
  
      const components = [];
      if (quickJoinUrl !== "https://policeroleplay.community/join/YNLIJ") {
        const startLinkButton = new ButtonBuilder()
          .setLabel("Quick Join")
          .setURL(quickJoinUrl)
          .setStyle(ButtonStyle.Link);
        components.push(new ActionRowBuilder().addComponents(startLinkButton));
      }

      if (!client.voteMap) client.voteMap = new Map();
      
      const activePollId = client.activePollId;
      const voters = activePollId ? client.voteMap.get(activePollId) : null;
      let votersList;
      if (!voters || voters.size === 0) {
        votersList = "**No voters!**";
      } else {
        const votersArray = [...voters.keys()];
        votersList = votersArray.length
          ? votersArray.map((id) => `<@${id}>`).join(", ")
          : "**No voters!**";
      }
  
      const roleId = "1094784246452863047"; // role id to ping
      const channel = await interaction.guild.channels.fetch(channelId);
      await channel.send({
        content: `<@&${roleId}>\n-# ${votersList}`,
        embeds: [embed1, embed2],
        components,
      });
  
      await interaction.reply({
        content:
          "**Successfully** hosted a session start up.",
        ephemeral: true,
      });
    },
  };
  
