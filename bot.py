#!/usr/bin/env python3
"""
ChatMate Telegram Bot (Render 24/7 Ready)
========================================
A feature-packed, beginner-friendly Telegram Bot for ChatMate.
Includes an embedded lightweight HTTP health-check server to satisfy
Render's Web Service port scanner, ensuring 100% free 24/7 uptime without timeouts.

Requirements:
    pip install python-telegram-bot python-dotenv
"""

import os
import sys
import logging
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
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

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger("ChatMateBot")

# Constants
APP_DOWNLOAD_URL = "https://tinyurl.com/Chat-mate-app"


# ---------------------------------------------------------------------------
# Lightweight HTTP Health Server (Satisfies Render Web Service Port Scan)
# ---------------------------------------------------------------------------
class HealthCheckHandler(BaseHTTPRequestHandler):
    """Answers Render's port probe so it declares the service 'Live'."""
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"ChatMate Bot is active and running 24/7 on Telegram!")

    def log_message(self, format, *args):
        # Keep logs clean by ignoring routine health checks
        return


def start_health_server() -> None:
    """Runs dummy web server in a daemon background thread."""
    try:
        port = int(os.getenv("PORT", 10000))
        server = HTTPServer(("0.0.0.0", port), HealthCheckHandler)
        logger.info(f"Render health check port server started on 0.0.0.0:{port}")
        server.serve_forever()
    except Exception as e:
        logger.warning(f"Health server failed to bind port: {e}")


# ---------------------------------------------------------------------------
# Telegram Inline Keyboard & Handlers
# ---------------------------------------------------------------------------
def get_main_keyboard() -> InlineKeyboardMarkup:
    """
    Main inline keyboard:
    - 💖 About ChatMate
    - 📲 Download App (direct link to https://tinyurl.com/Chat-mate-app)
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


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles /start: Welcomes user with functional action buttons."""
    user = update.effective_user
    user_name = user.first_name if user else "Friend"

    welcome_text = (
        f"👋 <b>Welcome to ChatMate, {user_name}!</b>\n\n"
        "✨ <b>ChatMate</b> is your smart messaging app built for speed, "
        "privacy, and connecting you effortlessly with friends and communities.\n\n"
        "📌 <b>Available Commands:</b>\n"
        "• /start - Restart bot and show this welcome menu\n"
        "• /about - Learn more about ChatMate\n"
        "• /app - Get the direct app download link\n"
        "• /help - Display the help center\n\n"
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
    """Handles /about command."""
    about_text = (
        "💖 <b>About ChatMate</b>\n\n"
        "ChatMate is a next-generation social communication app engineered for speed, "
        "privacy, and rich conversations.\n\n"
        "🌟 <b>Key Features:</b>\n"
        "• ⚡ <b>Lightning Fast:</b> Instant messaging with low latency\n"
        "• 🔒 <b>Privacy First:</b> End-to-end encrypted messaging\n"
        "• 🤖 <b>Smart Assistant:</b> AI-driven chat enhancements\n"
        "• 🎨 <b>Custom Themes:</b> Clean dark and light modes\n"
        "• 🌐 <b>Cross-Platform:</b> Available on mobile and web\n\n"
        "Ready to try ChatMate? Tap the button below to download the app! 👇"
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
    """Handles /app command."""
    app_text = (
        "📲 <b>Download ChatMate App</b>\n\n"
        "Get the latest version of ChatMate for Android with new updates and security features!\n\n"
        f"🔗 <b>Direct Link:</b> <a href=\"{APP_DOWNLOAD_URL}\">{APP_DOWNLOAD_URL}</a>\n\n"
        "Tap the button below to start your download now:"
    )

    keyboard = [
        [
            InlineKeyboardButton("🚀 Download ChatMate APK", url=APP_DOWNLOAD_URL),
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
    """Handles /help command."""
    help_text = (
        "ℹ️ <b>ChatMate Help Center</b>\n\n"
        "Here are all the ways you can use this bot:\n\n"
        "• /start - Launch the bot and view the welcome menu\n"
        "• /about - Read about ChatMate features and capabilities\n"
        "• /app - Receive the official application download link\n"
        "• /help - View this help center\n\n"
        "💡 <i>Tip: You can also tap the interactive buttons on any message below!</i>"
    )

    if update.message:
        await update.message.reply_text(
            text=help_text,
            reply_markup=get_main_keyboard(),
            parse_mode=ParseMode.HTML,
        )


async def button_callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles inline button clicks for About, Help, and Navigation."""
    query = update.callback_query
    if not query:
        return

    await query.answer()
    data = query.data

    if data == "about_chatmate":
        about_text = (
            "💖 <b>About ChatMate</b>\n\n"
            "ChatMate is designed to make your daily conversations smoother, faster, and smarter!\n\n"
            "✨ <b>Highlights:</b>\n"
            "• End-to-end security & user privacy\n"
            "• Smart message translation & AI companion\n"
            "• High-definition voice & video quality\n"
            "• Low battery & lightweight data consumption\n\n"
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
            "ℹ️ <b>ChatMate Help Center</b>\n\n"
            "Welcome to the help section! Need guidance on how to use ChatMate?\n\n"
            "• <b>Download App:</b> Tap '📲 Download App' or use /app to download the APK.\n"
            "• <b>Features:</b> Tap '💖 About ChatMate' or use /about to see feature details.\n"
            "• <b>Commands:</b> Use /start to refresh the menu anytime.\n\n"
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
            "👋 <b>ChatMate Main Menu</b>\n\n"
            "Welcome back! What would you like to explore today?\n\n"
            "• /about - Learn more about ChatMate\n"
            "• /app - Get the direct app download link\n"
            "• /help - Display the help guide"
        )
        await query.edit_message_text(
            text=welcome_text,
            reply_markup=get_main_keyboard(),
            parse_mode=ParseMode.HTML,
        )


async def unknown_message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Polite fallback for unhandled text."""
    if update.message:
        await update.message.reply_text(
            "🤖 I'm here to help you with ChatMate!\n"
            "Please use the buttons below or type /help to see all available commands.",
            reply_markup=get_main_keyboard(),
        )


async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Logs unexpected exceptions."""
    logger.error("Exception while handling update:", exc_info=context.error)


def main() -> None:
    """Starts the HTTP health check server and Telegram Bot polling."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")

    if not token or token.strip() == "":
        logger.critical("❌ ERROR: TELEGRAM_BOT_TOKEN is not set in environment!")
        sys.exit(1)

    # 1. Start embedded health-check server to satisfy Render's port scanner
    port_thread = threading.Thread(target=start_health_server, daemon=True)
    port_thread.start()

    logger.info("Initializing ChatMate Telegram Bot...")

    # 2. Build and run Telegram application
    application = ApplicationBuilder().token(token).build()

    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("about", about_command))
    application.add_handler(CommandHandler("app", app_command))
    application.add_handler(CommandHandler("help", help_command))

    application.add_handler(CallbackQueryHandler(button_callback_handler))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, unknown_message_handler))
    application.add_error_handler(error_handler)

    logger.info("ChatMate Bot is starting polling... Press Ctrl+C to stop.")
    application.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
