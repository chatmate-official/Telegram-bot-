#!/usr/bin/env python3
"""
ChatMate Telegram Bot (Render 24/7 + Razorpay Payment Integration)
==================================================================
A feature-packed Telegram Bot for ChatMate.
Includes:
- Embedded HTTP health-check server for Render 24/7 uptime.
- Real-time Razorpay Payment Link generation (UPI, Cards, NetBanking).
- Inline action buttons: About, Download App, Pay with Razorpay, Help.
- Commands: /start, /pay, /about, /app, /help.

Requirements:
    pip install python-telegram-bot python-dotenv razorpay
"""

import os
import sys
import logging
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from dotenv import load_dotenv

import razorpay
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

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger("ChatMateBot")

# Constants & Configuration
APP_DOWNLOAD_URL = os.getenv("APP_DOWNLOAD_URL", "https://tinyurl.com/Chat-mate-app")
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_live_TlLpKTsB7MoXPp")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

# Initialize Razorpay Client if credentials are provided
razorpay_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    try:
        razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        logger.info("Razorpay Client successfully initialized with Live API credentials.")
    except Exception as e:
        logger.warning(f"Could not initialize Razorpay Client: {e}")


# ---------------------------------------------------------------------------
# Lightweight HTTP Health Server (Satisfies Render Web Service Port Scan)
# ---------------------------------------------------------------------------
class HealthCheckHandler(BaseHTTPRequestHandler):
    """Answers Render's port probe so the web service stays Live 24/7."""
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"ChatMate Bot + Razorpay is active and running 24/7!")

    def log_message(self, format, *args):
        return


def start_health_server() -> None:
    """Runs web server in a daemon background thread."""
    try:
        port = int(os.getenv("PORT", 10000))
        server = HTTPServer(("0.0.0.0", port), HealthCheckHandler)
        logger.info(f"Render health check port server started on 0.0.0.0:{port}")
        server.serve_forever()
    except Exception as e:
        logger.warning(f"Health server failed to bind port: {e}")


# ---------------------------------------------------------------------------
# Razorpay Dynamic Payment Link Generator
# ---------------------------------------------------------------------------
def create_razorpay_payment_link(amount_in_rupees: int, plan_name: str, user_name: str) -> str | None:
    """
    Creates a dynamic payment link using Razorpay API.
    Supports UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking.
    """
    if not razorpay_client:
        return None

    try:
        # Amount in paise (e.g. ₹99 = 9900 paise)
        amount_paise = amount_in_rupees * 100
        payment_data = {
            "amount": amount_paise,
            "currency": "INR",
            "accept_partial": False,
            "description": f"ChatMate {plan_name} - {user_name}",
            "customer": {
                "name": user_name,
            },
            "notify": {
                "sms": False,
                "email": False
            },
            "reminder_enable": True,
            "notes": {
                "app": "ChatMate",
                "plan": plan_name,
                "user": user_name
            }
        }
        link_response = razorpay_client.payment_link.create(payment_data)
        payment_url = link_response.get("short_url")
        logger.info(f"Generated Razorpay link: {payment_url} for {user_name} ({plan_name})")
        return payment_url
    except Exception as e:
        logger.error(f"Failed to create Razorpay payment link: {e}")
        return None


# ---------------------------------------------------------------------------
# Keyboards
# ---------------------------------------------------------------------------
def get_main_keyboard() -> InlineKeyboardMarkup:
    """
    Main inline keyboard with:
    - 💖 About ChatMate
    - 📲 Download App
    - 💳 Pay with Razorpay
    - ℹ️ Help
    """
    keyboard = [
        [
            InlineKeyboardButton("💖 About ChatMate", callback_data="about_chatmate"),
            InlineKeyboardButton("📲 Download App", url=APP_DOWNLOAD_URL),
        ],
        [
            InlineKeyboardButton("💳 Pay with Razorpay", callback_data="pay_menu"),
        ],
        [
            InlineKeyboardButton("ℹ️ Help", callback_data="help_menu"),
        ],
    ]
    return InlineKeyboardMarkup(keyboard)


def get_payment_plans_keyboard() -> InlineKeyboardMarkup:
    """Keyboard offering subscription tiers."""
    keyboard = [
        [
            InlineKeyboardButton("🌟 1 Month VIP - ₹99", callback_data="buy_plan_99"),
        ],
        [
            InlineKeyboardButton("💎 1 Year VIP - ₹499", callback_data="buy_plan_499"),
        ],
        [
            InlineKeyboardButton("🔙 Back to Main Menu", callback_data="main_menu"),
        ]
    ]
    return InlineKeyboardMarkup(keyboard)


# ---------------------------------------------------------------------------
# Command Handlers
# ---------------------------------------------------------------------------
async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles /start: Welcomes user with functional action buttons."""
    user = update.effective_user
    user_name = user.first_name if user else "Friend"

    welcome_text = (
        f"👋 <b>Welcome to ChatMate, {user_name}!</b>\n\n"
        "✨ <b>ChatMate</b> is your ultimate smart messaging app built for speed, "
        "privacy, and rich community conversations.\n\n"
        "💳 <b>Razorpay Payment Enabled:</b> You can now upgrade your account or make payments directly through official Razorpay (UPI, GPay, PhonePe, Paytm, Cards).\n\n"
        "📌 <b>Available Commands:</b>\n"
        "• /start - Restart bot and show this welcome menu\n"
        "• /pay - Open Razorpay payment portal\n"
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


async def pay_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles /pay command."""
    pay_intro = (
        "💳 <b>ChatMate Razorpay Payment Portal</b>\n\n"
        "Upgrade to <b>ChatMate VIP</b> to unlock exclusive benefits:\n"
        "• ⚡ Unlimited High-Speed Messaging\n"
        "• 🤖 Priority AI Companion Access\n"
        "• 🚫 100% Ad-Free Experience\n"
        "• 💎 Exclusive VIP Profile Badge\n\n"
        "🔒 <i>Payments are secured 100% by Razorpay (UPI, GPay, PhonePe, Cards, NetBanking).</i>\n\n"
        "Select your preferred plan below:"
    )

    if update.message:
        await update.message.reply_text(
            text=pay_intro,
            reply_markup=get_payment_plans_keyboard(),
            parse_mode=ParseMode.HTML,
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
            InlineKeyboardButton("💳 Pay with Razorpay", callback_data="pay_menu"),
        ],
        [
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
            InlineKeyboardButton("💳 Razorpay Payment", callback_data="pay_menu"),
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
        "• /pay - Open the Razorpay payment portal\n"
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


# ---------------------------------------------------------------------------
# Callback Query Handler
# ---------------------------------------------------------------------------
async def button_callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles inline button clicks for About, Pay, Plans, Help, and Navigation."""
    query = update.callback_query
    if not query:
        return

    await query.answer()
    data = query.data
    user = update.effective_user
    user_name = user.first_name if user else "User"

    if data == "pay_menu":
        pay_intro = (
            "💳 <b>ChatMate Razorpay Payment Portal</b>\n\n"
            "Choose a VIP Subscription plan below to upgrade your ChatMate experience:\n\n"
            "🌟 <b>1 Month VIP:</b> ₹99 (Ad-free, High-speed AI)\n"
            "💎 <b>1 Year VIP:</b> ₹499 (Best Value! Save 58%)\n\n"
            "🔒 <i>100% Secure Checkout via Razorpay (UPI / GPay / PhonePe / Paytm / Cards / NetBanking).</i>"
        )
        await query.edit_message_text(
            text=pay_intro,
            reply_markup=get_payment_plans_keyboard(),
            parse_mode=ParseMode.HTML,
        )

    elif data in ("buy_plan_99", "buy_plan_499"):
        amount = 99 if data == "buy_plan_99" else 499
        plan_name = "1-Month VIP" if amount == 99 else "1-Year VIP"

        # Generate Razorpay Payment Link
        payment_url = create_razorpay_payment_link(amount, plan_name, user_name)

        if payment_url:
            text = (
                f"🎉 <b>Ready to complete your payment!</b>\n\n"
                f"📦 <b>Plan:</b> {plan_name}\n"
                f"💰 <b>Amount:</b> ₹{amount}\n"
                f"👤 <b>Customer:</b> {user_name}\n\n"
                "Tap the button below to pay securely via <b>Razorpay</b> (UPI, GPay, PhonePe, Cards, NetBanking):"
            )
            keyboard = [
                [
                    InlineKeyboardButton(f"🚀 Pay ₹{amount} via Razorpay", url=payment_url),
                ],
                [
                    InlineKeyboardButton("🔙 Back to Plans", callback_data="pay_menu"),
                    InlineKeyboardButton("🏠 Main Menu", callback_data="main_menu"),
                ]
            ]
        else:
            # Fallback if Razorpay API secret is not set yet in environment
            text = (
                f"💳 <b>Razorpay Payment: {plan_name} (₹{amount})</b>\n\n"
                f"Razorpay Key ID: <code>{RAZORPAY_KEY_ID}</code>\n\n"
                "⚠️ <i>Please ensure RAZORPAY_KEY_SECRET is added to your environment variables on Render to enable instant dynamic link generation.</i>\n\n"
                "Tap below to return to the plans menu:"
            )
            keyboard = [
                [
                    InlineKeyboardButton("🔙 Back to Plans", callback_data="pay_menu"),
                    InlineKeyboardButton("🏠 Main Menu", callback_data="main_menu"),
                ]
            ]

        await query.edit_message_text(
            text=text,
            reply_markup=InlineKeyboardMarkup(keyboard),
            parse_mode=ParseMode.HTML,
        )

    elif data == "about_chatmate":
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
                InlineKeyboardButton("💳 Pay with Razorpay", callback_data="pay_menu"),
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
            "• <b>Razorpay Payment:</b> Tap '💳 Pay with Razorpay' or use /pay to upgrade.\n"
            "• <b>Features:</b> Tap '💖 About ChatMate' or use /about to see feature details.\n"
            "• <b>Commands:</b> Use /start to refresh the menu anytime.\n\n"
            "Tap below to choose an action:"
        )
        keyboard = [
            [
                InlineKeyboardButton("📲 Download App", url=APP_DOWNLOAD_URL),
                InlineKeyboardButton("💳 Pay with Razorpay", callback_data="pay_menu"),
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
            "• /pay - Razorpay payment portal\n"
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
            "Please use the buttons below or type /help or /pay to see all available options.",
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

    logger.info("Initializing ChatMate Telegram Bot with Razorpay integration...")

    # 2. Build and run Telegram application
    application = ApplicationBuilder().token(token).build()

    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("pay", pay_command))
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
