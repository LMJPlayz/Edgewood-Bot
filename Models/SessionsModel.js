const fs = require("fs");
const path = require("path");

const storePath = path.join(__dirname, "sessions-store.json");

function readStore() {
  try {
    if (!fs.existsSync(storePath)) return null;
    const raw = fs.readFileSync(storePath, "utf8");
    if (!raw.trim()) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.channelId || !parsed.messageId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStore(value) {
  if (!value) {
    fs.writeFileSync(storePath, "{}", "utf8");
    return;
  }

  const payload = {
    channelId: String(value.channelId),
    messageId: String(value.messageId),
  };
  fs.writeFileSync(storePath, JSON.stringify(payload, null, 2), "utf8");
}

module.exports = {
  async findOne() {
    return readStore();
  },

  async deleteMany() {
    writeStore(null);
  },

  async set(data) {
    writeStore(data);
    return readStore();
  },
};
