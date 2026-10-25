# 🤖 ChatMate Telegram Bot (No Admin ID Required)

A production-ready Telegram Bot built with Python (`python-telegram-bot` v20+) designed for the **ChatMate** app ecosystem.

## 🚀 Features
- 💖 **About ChatMate Button**: Highlights app capabilities, speed, and privacy.
- 📲 **Download App Button**: Direct link to the official application (`https://tinyurl.com/Chat-mate-app`).
- ℹ️ **Help Button**: Dedicated interactive guide and command manual.
- ⚡ **Commands**: `/start`, `/about`, `/app`, `/help`.
- 🔐 **Zero Admin Setup**: Only `TELEGRAM_BOT_TOKEN` is required. No `ADMIN_TELEGRAM_ID` checks or dependencies.

---

## 📱 Quick Setup on Android Phone (via Termux)

Run the bot directly from your Android phone without needing a computer:

1. **Install Termux** from F-Droid (avoid Google Play Store as it is outdated):
   [Download Termux from F-Droid](https://f-droid.org/packages/com.termux/)

2. **Open Termux and install Python:**
   ```bash
   pkg update && pkg upgrade -y
   pkg install -y python git
   ```

3. **Install python-telegram-bot:**
   ```bash
   pip install python-telegram-bot python-dotenv
   ```

4. **Set your Bot Token (only required variable):**
   ```bash
   export TELEGRAM_BOT_TOKEN="your_token_from_botfather"
   ```

5. **Run the Bot:**
   ```bash
   python bot.py
   ```

6. **Keep it running 24/7 in background:**
   ```bash
   termux-wake-lock
   nohup python bot.py > bot.log 2>&1 &
   ```

---

## ☁️ Free 24/7 Cloud Hosting Options

### Option 1: Render.com (Recommended Free Tier)
1. Fork or push this repository to GitHub.
2. Sign in to [Render.com](https://render.com).
3. Click **New +** → **Background Worker** (or Web Service).
4. Connect your GitHub repository.
5. Set:
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python bot.py`
6. In **Environment Variables**, add:
   - Key: `TELEGRAM_BOT_TOKEN`
   - Value: `your_token_from_botfather`
7. Click **Deploy**. Your bot will run 24/7 for free!
