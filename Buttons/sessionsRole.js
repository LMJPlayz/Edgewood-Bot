const roleId = "1094784246452863047";
const cooldowns = new Map();

const COOLDOWN_MS = 5000;

module.exports = {
  customID: "sessionsRole:button",
  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "This button can only be used inside a server.",
        ephemeral: true,
      });
    }

    if (!roleId || roleId === "1094784246452863047") {
      return interaction.reply({
        content: "Sessions role is not configured yet.",
        ephemeral: true,
      });
    }

    const userId = interaction.user.id;
    const now = Date.now();

    const expiresAt = cooldowns.get(userId);
    if (expiresAt && now < expiresAt) {
      const relative = `<t:${Math.floor(expiresAt / 1000)}:R>`;
      return interaction.reply({
        content: `You are on **cooldown**, please try again ${relative}.`,
        ephemeral: true,
      });
    }

    cooldowns.set(userId, now + COOLDOWN_MS);

    const role = await interaction.guild.roles.fetch(roleId).catch(() => null);
    if (!role) {
      return interaction.reply({
        content: "Configured sessions role was not found.",
        ephemeral: true,
      });
    }

    const member = interaction.member;
    const hasRole = member.roles.cache.has(roleId);

    try {
      if (hasRole) {
        await member.roles.remove(role);
        return interaction.reply({
          content: `<@${userId}>, you will no longer be notified for sessions.`,
          ephemeral: true,
        });
      }

      await member.roles.add(role);
      return interaction.reply({
        content: `<@${userId}>, you will now be notified for sessions.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("[sessionsRole] failed to update role:", error);
      return interaction.reply({
        content: "I could not update your sessions role right now.",
        ephemeral: true,
      });
    }
  },
};
