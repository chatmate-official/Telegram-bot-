import JSZip from 'jszip';
import { BotConfig } from '../types';

export function generateBotPy(config: BotConfig): string {
  return `#!/usr/bin/env python3
"""
ChatMate Telegram Bot
=====================
A feature-packed, beginner-friendly Telegram Bot for the ${config.appName} application.
Built using python-telegram-bot (v20+) with async/await architecture.

Requirements:
    pip install python-telegram-bot python-dotenv

Configuration:
    Only ONE environment variable is required:
    - ${config.envVarName} (obtained from @BotFather)

No ADMIN_TELEGRAM_ID or admin setup required.
"""

import os
import sys
import logging
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.constants import ParseMode
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    CallbackQueryHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

# Load environment variables from .env file if present
load_dotenv()

# Configure logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger("ChatMateBot")

# Constants
APP_DOWNLOAD_URL = "${config.appDownloadUrl}"

# Helper function to generate main inline keyboard
def get_main_keyboard() -> InlineKeyboardMarkup:
    """
    Creates the main inline keyboard with:
    - 💖 About ChatMate
    - 📲 Download App (direct link to ${config.appDownloadUrl})
    - ℹ️ Help
    """
    keyboard = [
        [
            InlineKeyboardButton("💖 About ChatMate", callback_data="about_chatmate"),
            InlineKeyboardButton("📲 Download App", url=APP_DOWNLOAD_URL),
        ],
        [
            InlineKeyboardButton("ℹ️ Help", callback_data="help_menu"),
        ],
    ]
    return InlineKeyboardMarkup(keyboard)


# Command Handlers
async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Handles /start command.
    Sends a warm welcome message with functional inline action buttons.
    """
    user = update.effective_user
    user_name = user.first_name if user else "Friend"

    welcome_text = (
        f"👋 <b>Welcome to ${config.appName}, {user_name}!</b>\\n\\n"
        "✨ <b>${config.appName}</b> is your smart messaging app built for speed, "
        "privacy, and connecting you effortlessly with friends and communities.\\n\\n"
        "📌 <b>Available Commands:</b>\\n"
        "• /start - Restart bot and show this welcome menu\\n"
        "• /about - Learn more about ${config.appName}\\n"
        "• /app - Get the direct app download link\\n"
        "• /help - Display the help center\\n\\n"
        "👇 <i>Tap an option below to get started:</i>"
    )

    if update.message:
        await update.message.reply_text(
            text=welcome_text,
            reply_markup=get_main_keyboard(),
            parse_mode=ParseMode.HTML,
            disable_web_page_preview=True,
        )


async def about_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Handles /about command.
    Shares background, key features, and highlights of ChatMate.
    """
    about_text = (
        "💖 <b>About ${config.appName}</b>\\n\\n"
        "${config.appName} is a next-generation social communication app engineered for speed, "
        "privacy, and rich conversations.\\n\\n"
        "🌟 <b>Key Features:</b>\\n"
        "• ⚡ <b>Lightning Fast:</b> Instant messaging with low latency\\n"
        "• 🔒 <b>Privacy First:</b> End-to-end encrypted messaging\\n"
        "• 🤖 <b>Smart Assistant:</b> AI-driven chat enhancements\\n"
        "• 🎨 <b>Custom Themes:</b> Clean dark and light modes\\n"
        "• 🌐 <b>Cross-Platform:</b> Available on mobile and web\\n\\n"
        "Ready to try ${config.appName}? Tap the button below to download the app! 👇"
    )

    keyboard = [
        [
            InlineKeyboardButton("📲 Download App", url=APP_DOWNLOAD_URL),
            InlineKeyboardButton("ℹ️ Help", callback_data="help_menu"),
        ]
    ]

    if update.message:
        await update.message.reply_text(
            text=about_text,
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode=ParseMode.HTML,
            disable_web_page_preview=True,
        )


async def app_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Handles /app command.
    Provides the official application download link.
    """
    app_text = (
        "📲 <b>Download ${config.appName} App</b>\\n\\n"
        "Get the latest version of ${config.appName} for Android with new updates and security features!\\n\\n"
        f"🔗 <b>Direct Link:</b> <a href=\\"{APP_DOWNLOAD_URL}\\">{APP_DOWNLOAD_URL}</a>\\n\\n"
        "Tap the button below to start your download now:"
    )

    keyboard = [
        [
            InlineKeyboardButton("🚀 Download ${config.appName} APK", url=APP_DOWNLOAD_URL),
        ],
        [
            InlineKeyboardButton("💖 About ChatMate", callback_data="about_chatmate"),
            InlineKeyboardButton("ℹ️ Help", callback_data="help_menu"),
        ]
    ]

    if update.message:
        await update.message.reply_text(
            text=app_text,
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode=ParseMode.HTML,
            disable_web_page_preview=False,
        )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Handles /help command.
    Lists all available commands and troubleshooting tips.
    """
    help_text = (
        "ℹ️ <b>${config.appName} Help Center</b>\\n\\n"
        "Here are all the ways you can use this bot:\\n\\n"
        "• /start - Launch the bot and view the welcome menu\\n"
        "• /about - Read about ${config.appName} features and capabilities\\n"
        "• /app - Receive the official application download link\\n"
        "• /help - View this help center\\n\\n"
        "💡 <i>Tip: You can also tap the interactive buttons on any message below!</i>"
    )

    if update.message:
        await update.message.reply_text(
            text=help_text,
            reply_markup=get_main_keyboard(),
            parse_mode=ParseMode.HTML,
        )


# Callback Query Handler for Inline Buttons
async def button_callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Handles inline button clicks for About, Help, and Navigation.
    """
    query = update.callback_query
    if not query:
        return

    # Always answer callback query to clear button loading state
    await query.answer()

    data = query.data

    if data == "about_chatmate":
        about_text = (
            "💖 <b>About ${config.appName}</b>\\n\\n"
            "${config.appName} is designed to make your daily conversations smoother, faster, and smarter!\\n\\n"
            "✨ <b>Highlights:</b>\\n"
            "• End-to-end security & user privacy\\n"
            "• Smart message translation & AI companion\\n"
            "• High-definition voice & video quality\\n"
            "• Low battery & lightweight data consumption\\n\\n"
            "👇 <i>Ready to join? Download now:</i>"
        )
        keyboard = [
            [
                InlineKeyboardButton("📲 Download App", url=APP_DOWNLOAD_URL),
                InlineKeyboardButton("ℹ️ Help", callback_data="help_menu"),
            ],
            [
                InlineKeyboardButton("🔙 Back to Main Menu", callback_data="main_menu"),
            ]
        ]
        await query.edit_message_text(
            text=about_text,
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode=ParseMode.HTML,
        )

    elif data == "help_menu":
        help_text = (
            "ℹ️ <b>${config.appName} Help Center</b>\\n\\n"
            "Welcome to the help section! Need guidance on how to use ${config.appName}?\\n\\n"
            "• <b>Download App:</b> Tap '📲 Download App' or use /app to download the APK.\\n"
            "• <b>Features:</b> Tap '💖 About ChatMate' or use /about to see feature details.\\n"
            "• <b>Commands:</b> Use /start to refresh the menu anytime.\\n\\n"
            "Tap below to download or return to the main menu:"
        )
        keyboard = [
            [
                InlineKeyboardButton("📲 Download App", url=APP_DOWNLOAD_URL),
                InlineKeyboardButton("💖 About ChatMate", callback_data="about_chatmate"),
            ],
            [
                InlineKeyboardButton("🔙 Back to Main Menu", callback_data="main_menu"),
            ]
        ]
        await query.edit_message_text(
            text=help_text,
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode=ParseMode.HTML,
        )

    elif data == "main_menu":
        welcome_text = (
            "👋 <b>${config.appName} Main Menu</b>\\n\\n"
            "Welcome back! What would you like to explore today?\\n\\n"
            "• /about - Learn more about ${config.appName}\\n"
            "• /app - Get the direct app download link\\n"
            "• /help - Display the help guide"
        )
        await query.edit_message_text(
            text=welcome_text,
            reply_markup=get_main_keyboard(),
            parse_mode=ParseMode.HTML,
        )


async def unknown_message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Polite fallback when the user sends text that isn't a recognized command.
    """
    if update.message:
        await update.message.reply_text(
            "🤖 I'm here to help you with ${config.appName}!\\n"
            "Please use the buttons below or type /help to see all available commands.",
            reply_markup=get_main_keyboard(),
        )


async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Logs errors caused by updates."""
    logger.error("Exception while handling an update:", exc_info=context.error)


def main() -> None:
    """
    Initializes and starts the Telegram bot.
    Only ${config.envVarName} is required.
    """
    token = os.getenv("${config.envVarName}")

    if not token or token.strip() == "" or token == "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        logger.critical(
            "\\n" + "=" * 60 + "\\n"
            "❌ ERROR: ${config.envVarName} environment variable is not set!\\n\\n"
            "How to fix:\\n"
            "1. On Linux/macOS/Termux:\\n"
            "   export ${config.envVarName}=\\"your_bot_token_from_botfather\\"\\n"
            "   python bot.py\\n\\n"
            "2. Or create a .env file with:\\n"
            "   ${config.envVarName}=your_bot_token_from_botfather\\n"
            "=" * 60 + "\\n"
        )
        sys.exit(1)

    logger.info("Initializing ${config.appName} Telegram Bot (No Admin ID required)...")

    # Build application with token
    application = ApplicationBuilder().token(token).build()

    # Register command handlers (public, no admin restrictions)
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("about", about_command))
    application.add_handler(CommandHandler("app", app_command))
    application.add_handler(CommandHandler("help", help_command))

    # Register callback query handler for inline button clicks
    application.add_handler(CallbackQueryHandler(button_callback_handler))

    # Register fallback handler for general text
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, unknown_message_handler))

    # Register global error handler
    application.add_error_handler(error_handler)

    logger.info("${config.appName} Bot is starting polling... Press Ctrl+C to stop.")
    application.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
`;
}

export function generateRequirementsTxt(): string {
  return `python-telegram-bot>=20.8
python-dotenv>=1.0.0
`;
}

export function generateEnvExample(config: BotConfig): string {
  return `# Telegram Bot API Token obtained from @BotFather on Telegram
# Only this single variable is required! No ADMIN_TELEGRAM_ID needed.
${config.envVarName}="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
`;
}

export function generateProcfile(): string {
  return `worker: python bot.py
`;
}

export function generateGitignore(): string {
  return `.env
__pycache__/
*.pyc
venv/
.venv/
*.log
`;
}

export function generateReadme(config: BotConfig): string {
  return `# 🤖 ${config.appName} Telegram Bot (No Admin ID Required)

A clean, beginner-friendly Telegram Bot built with Python (\`python-telegram-bot\` v20+) for the **${config.appName}** app.

## ✨ Features
- 💖 **About ChatMate Button**: Highlights app capabilities, speed, and privacy.
- 📲 **Download App Button**: Direct link to the official application (\`${config.appDownloadUrl}\`).
- ℹ️ **Help Button**: Dedicated interactive guide and command manual.
- ⚡ **Commands**: \`/start\`, \`/about\`, \`/app\`, \`/help\`.
- 🔐 **Simple & Secure**: Only \`${config.envVarName}\` is required. No admin IDs, no complex setup.

---

## 🚀 Quick Start in 3 Steps

1. Install dependencies:
   \`\`\`bash
   pip install python-telegram-bot python-dotenv
   \`\`\`
2. Set your bot token:
   \`\`\`bash
   export ${config.envVarName}="your_bot_token_from_botfather"
   \`\`\`
3. Run the bot:
   \`\`\`bash
   python bot.py
   \`\`\`

---

## 📱 Android Phone Setup (Using Termux)

Run this bot directly from your Android smartphone 24/7 without a PC:

1. **Install Termux** from F-Droid:
   https://f-droid.org/packages/com.termux/

2. **Open Termux and run:**
   \`\`\`bash
   pkg update && pkg upgrade -y
   pkg install -y python git
   pip install python-telegram-bot python-dotenv
   \`\`\`

3. **Set your Bot Token:**
   \`\`\`bash
   export ${config.envVarName}="your_bot_token_from_botfather"
   \`\`\`

4. **Start your Bot:**
   \`\`\`bash
   python bot.py
   \`\`\`

5. **Keep it alive in background (24/7):**
   \`\`\`bash
   termux-wake-lock
   nohup python bot.py > bot.log 2>&1 &
   \`\`\`
`;
}

export async function downloadProjectZip(config: BotConfig) {
  const zip = new JSZip();

  zip.file('bot.py', generateBotPy(config));
  zip.file('requirements.txt', generateRequirementsTxt());
  zip.file('.env.example', generateEnvExample(config));
  zip.file('.gitignore', generateGitignore());
  zip.file('Procfile', generateProcfile());
  zip.file('README.md', generateReadme(config));

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'chatmate-telegram-bot.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
