import JSZip from 'jszip';
import { BotConfig } from '../types';

export function generateBotPy(config: BotConfig): string {
  return `#!/usr/bin/env python3
"""
ChatMate Telegram Bot (Render 24/7 + Razorpay Payment Integration)
==================================================================
A feature-packed Telegram Bot for ${config.appName}.
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
APP_DOWNLOAD_URL = os.getenv("APP_DOWNLOAD_URL", "${config.appDownloadUrl}")
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
        self.wfile.write(b"${config.appName} Bot + Razorpay is active and running 24/7!")

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
        amount_paise = amount_in_rupees * 100
        payment_data = {
            "amount": amount_paise,
            "currency": "INR",
            "accept_partial": False,
            "description": f"${config.appName} {plan_name} - {user_name}",
            "customer": {
                "name": user_name,
            },
            "notify": {
                "sms": False,
                "email": False
            },
            "reminder_enable": True,
            "notes": {
                "app": "${config.appName}",
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
        f"👋 <b>Welcome to ${config.appName}, {user_name}!</b>\\n\\n"
        "✨ <b>${config.appName}</b> is your ultimate smart messaging app built for speed, "
        "privacy, and rich community conversations.\\n\\n"
        "💳 <b>Razorpay Payment Enabled:</b> You can now upgrade your account or make payments directly through official Razorpay (UPI, GPay, PhonePe, Paytm, Cards).\\n\\n"
        "📌 <b>Available Commands:</b>\\n"
        "• /start - Restart bot and show this welcome menu\\n"
        "• /pay - Open Razorpay payment portal\\n"
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


async def pay_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles /pay command."""
    pay_intro = (
        "💳 <b>${config.appName} Razorpay Payment Portal</b>\\n\\n"
        "Upgrade to <b>${config.appName} VIP</b> to unlock exclusive benefits:\\n"
        "• ⚡ Unlimited High-Speed Messaging\\n"
        "• 🤖 Priority AI Companion Access\\n"
        "• 🚫 100% Ad-Free Experience\\n"
        "• 💎 Exclusive VIP Profile Badge\\n\\n"
        "🔒 <i>Payments are secured 100% by Razorpay (UPI, GPay, PhonePe, Cards, NetBanking).</i>\\n\\n"
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
        "ℹ️ <b>${config.appName} Help Center</b>\\n\\n"
        "Here are all the ways you can use this bot:\\n\\n"
        "• /start - Launch the bot and view the welcome menu\\n"
        "• /pay - Open the Razorpay payment portal\\n"
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
            "💳 <b>${config.appName} Razorpay Payment Portal</b>\\n\\n"
            "Choose a VIP Subscription plan below to upgrade your ${config.appName} experience:\\n\\n"
            "🌟 <b>1 Month VIP:</b> ₹99 (Ad-free, High-speed AI)\\n"
            "💎 <b>1 Year VIP:</b> ₹499 (Best Value! Save 58%)\\n\\n"
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

        payment_url = create_razorpay_payment_link(amount, plan_name, user_name)

        if payment_url:
            text = (
                f"🎉 <b>Ready to complete your payment!</b>\\n\\n"
                f"📦 <b>Plan:</b> {plan_name}\\n"
                f"💰 <b>Amount:</b> ₹{amount}\\n"
                f"👤 <b>Customer:</b> {user_name}\\n\\n"
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
            text = (
                f"💳 <b>Razorpay Payment: {plan_name} (₹{amount})</b>\\n\\n"
                f"Razorpay Key ID: <code>{RAZORPAY_KEY_ID}</code>\\n\\n"
                "⚠️ <i>Please ensure RAZORPAY_KEY_SECRET is added to your environment variables on Render to enable instant dynamic link generation.</i>\\n\\n"
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
            "ℹ️ <b>${config.appName} Help Center</b>\\n\\n"
            "Welcome to the help section! Need guidance on how to use ${config.appName}?\\n\\n"
            "• <b>Download App:</b> Tap '📲 Download App' or use /app to download the APK.\\n"
            "• <b>Razorpay Payment:</b> Tap '💳 Pay with Razorpay' or use /pay to upgrade.\\n"
            "• <b>Features:</b> Tap '💖 About ChatMate' or use /about to see feature details.\\n"
            "• <b>Commands:</b> Use /start to refresh the menu anytime.\\n\\n"
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
            "👋 <b>${config.appName} Main Menu</b>\\n\\n"
            "Welcome back! What would you like to explore today?\\n\\n"
            "• /pay - Razorpay payment portal\\n"
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
    """Polite fallback for unhandled text."""
    if update.message:
        await update.message.reply_text(
            "🤖 I'm here to help you with ${config.appName}!\\n"
            "Please use the buttons below or type /help or /pay to see all available options.",
            reply_markup=get_main_keyboard(),
        )


async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Logs unexpected exceptions."""
    logger.error("Exception while handling update:", exc_info=context.error)


def main() -> None:
    """Starts the HTTP health check server and Telegram Bot polling."""
    token = os.getenv("${config.envVarName}")

    if not token or token.strip() == "":
        logger.critical("❌ ERROR: ${config.envVarName} is not set in environment!")
        sys.exit(1)

    port_thread = threading.Thread(target=start_health_server, daemon=True)
    port_thread.start()

    logger.info("Initializing ${config.appName} Telegram Bot with Razorpay integration...")

    application = ApplicationBuilder().token(token).build()

    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("pay", pay_command))
    application.add_handler(CommandHandler("about", about_command))
    application.add_handler(CommandHandler("app", app_command))
    application.add_handler(CommandHandler("help", help_command))

    application.add_handler(CallbackQueryHandler(button_callback_handler))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, unknown_message_handler))
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
razorpay>=1.4.1
`;
}

export function generateEnvExample(config: BotConfig): string {
  return `# Telegram Bot API Token obtained from @BotFather on Telegram
${config.envVarName}="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"

# Razorpay Live API Credentials
RAZORPAY_KEY_ID="rzp_live_TlLpKTsB7MoXPp"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret_here"
`;
}

export function generateProcfile(): string {
  return `web: python bot.py
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
  return `# 🤖 ${config.appName} Telegram Bot (Razorpay + Render 24/7)

A complete, beginner-friendly Telegram Bot built with Python (\`python-telegram-bot\` v20+) and **Razorpay Live Payments**.

## ✨ Features
- 💳 **Razorpay Live Payment Option**: Dynamic payment link generation supporting UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking.
- 💖 **About ChatMate Button**: Features and app highlights.
- 📲 **Download App Button**: Direct link to the app (\`${config.appDownloadUrl}\`).
- ℹ️ **Help Button**: Dedicated interactive guide and command manual.
- ⚡ **Commands**: \`/start\`, \`/pay\`, \`/about\`, \`/app\`, \`/help\`.
- 🌐 **Render Port-Scan Immune**: Embedded HTTP server ensures 24/7 uptime on Render Web Services.

---

## 🔑 Render Environment Variables Setup

In your Render Dashboard (**Settings &rarr; Environment Variables**), add:
- \`TELEGRAM_BOT_TOKEN\` = \`your_botfather_token\`
- \`RAZORPAY_KEY_ID\` = \`rzp_live_TlLpKTsB7MoXPp\`
- \`RAZORPAY_KEY_SECRET\` = \`your_razorpay_key_secret\`
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
