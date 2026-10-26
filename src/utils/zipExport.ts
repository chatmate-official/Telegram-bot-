import JSZip from 'jszip';
import { BotConfig } from '../types';

export function generateBotPy(config: BotConfig): string {
  return `#!/usr/bin/env python3
"""
ChatMate Telegram Bot - Paid Access Paywall (₹300)
=================================================
Workflow:
1. User sends /start.
2. Bot immediately requires ₹300 payment to unlock the ChatMate App.
3. Bot generates a dynamic Razorpay Payment Link (₹300) supporting UPI, GPay, PhonePe, Cards.
4. User clicks 'Pay ₹300' and completes the transaction.
5. User clicks '✅ Check / Verify Payment'.
6. Once payment is verified, bot UNLOCKS and provides the official App Download link:
   ${config.appDownloadUrl}

Requirements:
    pip install python-telegram-bot python-dotenv razorpay
"""

import os
import sys
import logging
import threading
import time
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

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger("ChatMateBot")

# Constants & Configuration
APP_DOWNLOAD_URL = os.getenv("APP_DOWNLOAD_URL", "${config.appDownloadUrl}")
ACCESS_FEE_INR = 300  # Exact ₹300 required access fee

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_live_TlLpKTsB7MoXPp")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "70oNNW8Uj5ncuuEco3W1PHzn")

# In-memory storage for active payment links & unlocked users
user_payment_links: dict[int, str] = {}    # user_id -> payment_link_id
user_payment_urls: dict[int, str] = {}     # user_id -> short_url
paid_users: set[int] = set()               # user_ids who successfully paid ₹300

# Initialize Razorpay Client
razorpay_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    try:
        razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        logger.info("Razorpay Client initialized with Live API credentials.")
    except Exception as e:
        logger.warning(f"Could not initialize Razorpay Client: {e}")


# ---------------------------------------------------------------------------
# Lightweight HTTP Health Server (Satisfies Render Web Service Port Scan)
# ---------------------------------------------------------------------------
class HealthCheckHandler(BaseHTTPRequestHandler):
    """Answers Render's port probe so the service stays Live 24/7."""
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"${config.appName} Paywall Bot (300 INR) is active and running 24/7!")

    def log_message(self, format, *args):
        return


def start_health_server() -> None:
    """Runs web server in a background thread."""
    try:
        port = int(os.getenv("PORT", 10000))
        server = HTTPServer(("0.0.0.0", port), HealthCheckHandler)
        logger.info(f"Render health check port server started on 0.0.0.0:{port}")
        server.serve_forever()
    except Exception as e:
        logger.warning(f"Health server failed to bind port: {e}")


# ---------------------------------------------------------------------------
# Razorpay Payment Link Generator & Verifier
# ---------------------------------------------------------------------------
def get_or_create_payment_link(user_id: int, user_name: str) -> tuple[str | None, str | None]:
    """
    Creates or retrieves an existing ₹300 Razorpay Payment Link for the user.
    """
    if user_id in user_payment_urls and user_id in user_payment_links:
        return user_payment_urls[user_id], user_payment_links[user_id]

    if not razorpay_client:
        simulated_url = f"https://rzp.io/l/chatmate-300-access"
        return simulated_url, "sim_link_300"

    try:
        amount_paise = ACCESS_FEE_INR * 100
        ref_id = f"chatmate_uid_{user_id}_{int(time.time())}"

        payment_data = {
            "amount": amount_paise,
            "currency": "INR",
            "accept_partial": False,
            "description": f"${config.appName} VIP App Access Pass - ₹{ACCESS_FEE_INR}",
            "customer": {
                "name": user_name or f"User_{user_id}",
            },
            "notify": {
                "sms": False,
                "email": False
            },
            "reminder_enable": True,
            "notes": {
                "app": "${config.appName}",
                "purpose": "App_Download_Unlock",
                "telegram_user_id": str(user_id)
            },
            "reference_id": ref_id
        }

        link_response = razorpay_client.payment_link.create(payment_data)
        link_id = link_response.get("id")
        short_url = link_response.get("short_url")

        if link_id and short_url:
            user_payment_links[user_id] = link_id
            user_payment_urls[user_id] = short_url
            logger.info(f"Created ₹300 Payment Link for user {user_id}: {short_url}")
            return short_url, link_id

    except Exception as e:
        logger.error(f"Error creating Razorpay payment link: {e}")

    return None, None


def check_razorpay_payment_status(user_id: int) -> bool:
    """
    Checks with Razorpay API whether the user's payment link has been paid.
    """
    if user_id in paid_users:
        return True

    link_id = user_payment_links.get(user_id)
    if not link_id or not razorpay_client:
        return False

    try:
        link_status = razorpay_client.payment_link.fetch(link_id)
        status = link_status.get("status")
        logger.info(f"Checking link {link_id} for user {user_id}. Status: {status}")

        if status == "paid":
            paid_users.add(user_id)
            return True
    except Exception as e:
        logger.error(f"Error verifying payment with Razorpay: {e}")

    return False


# ---------------------------------------------------------------------------
# Keyboards
# ---------------------------------------------------------------------------
def get_payment_required_keyboard(payment_url: str) -> InlineKeyboardMarkup:
    """
    Keyboard shown when access is locked. Requires ₹300 payment.
    """
    keyboard = [
        [
            InlineKeyboardButton(f"💳 Pay ₹{ACCESS_FEE_INR} via Razorpay (UPI / GPay / Cards)", url=payment_url),
        ],
        [
            InlineKeyboardButton("✅ I Have Paid — Unlock App Link", callback_data="verify_payment"),
        ],
        [
            InlineKeyboardButton("💖 About ${config.appName}", callback_data="about_chatmate"),
            InlineKeyboardButton("ℹ️ Help / Support", callback_data="help_menu"),
        ]
    ]
    return InlineKeyboardMarkup(keyboard)


def get_unlocked_app_keyboard() -> InlineKeyboardMarkup:
    """
    Keyboard shown ONLY after user pays ₹300. Download link is granted!
    """
    keyboard = [
        [
            InlineKeyboardButton("🚀 📲 Download ${config.appName} APK Now", url=APP_DOWNLOAD_URL),
        ],
        [
            InlineKeyboardButton("💖 About ${config.appName}", callback_data="about_chatmate"),
            InlineKeyboardButton("ℹ️ Help Center", callback_data="help_menu"),
        ]
    ]
    return InlineKeyboardMarkup(keyboard)


# ---------------------------------------------------------------------------
# Handlers
# ---------------------------------------------------------------------------
async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Handles /start command.
    Checks if user has already paid ₹300:
    - If paid -> Gives direct app download link.
    - If not paid -> Immediately presents the ₹300 paywall to proceed.
    """
    user = update.effective_user
    if not user:
        return

    user_name = user.first_name or "Friend"
    user_id = user.id

    # Check if already paid
    if user_id in paid_users:
        unlocked_text = (
            f"🎉 <b>Welcome back, {user_name}!</b>\\n\\n"
            "✅ <b>Your ${config.appName} VIP Access is ACTIVE!</b>\\n"
            "You have already paid the ₹300 activation fee.\\n\\n"
            "👇 <i>Tap the button below to download the latest ${config.appName} App:</i>"
        )
        if update.message:
            await update.message.reply_text(
                text=unlocked_text,
                reply_markup=get_unlocked_app_keyboard(),
                parse_mode=ParseMode.HTML,
            )
        return

    # User has NOT paid -> Generate ₹300 payment link
    payment_url, _ = get_or_create_payment_link(user_id, user_name)
    if not payment_url:
        payment_url = f"https://rzp.io/l/chatmate-300-access"

    paywall_text = (
        f"👋 <b>Welcome to ${config.appName}, {user_name}!</b>\\n\\n"
        "🔒 <b>${config.appName} Private VIP Access</b>\\n"
        f"To download the official <b>${config.appName} Application</b>, an activation fee of <b>₹{ACCESS_FEE_INR}</b> is required.\\n\\n"
        f"✨ <b>What you unlock after ₹{ACCESS_FEE_INR} payment:</b>\\n"
        "• 📲 <b>Direct APK Download Link</b> (Full Unrestricted Access)\\n"
        "• ⚡ High-speed lag-free private messaging\\n"
        "• 🤖 Smart AI Companion & voice filters\\n"
        "• 💎 Lifetime VIP Membership & zero advertisements\\n\\n"
        "💳 <i>Secure payment handled 100% by Razorpay (Google Pay, PhonePe, Paytm, UPI, Cards, NetBanking).</i>\\n\\n"
        "👇 <b>Step 1:</b> Tap the button below to Pay ₹300\\n"
        "👇 <b>Step 2:</b> After paying, tap <b>'I Have Paid — Unlock App Link'</b>:"
    )

    if update.message:
        await update.message.reply_text(
            text=paywall_text,
            reply_markup=get_payment_required_keyboard(payment_url),
            parse_mode=ParseMode.HTML,
        )


async def button_callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Handles inline button clicks (Verify Payment, About, Help, etc.)
    """
    query = update.callback_query
    if not query:
        return

    await query.answer()
    data = query.data
    user = update.effective_user
    if not user:
        return

    user_name = user.first_name or "Friend"
    user_id = user.id

    if data == "verify_payment":
        is_paid = check_razorpay_payment_status(user_id)

        if is_paid:
            success_text = (
                f"🎉 <b>PAYMENT VERIFIED SUCCESSFULLY!</b>\\n\\n"
                f"Thank you, <b>{user_name}</b>! Your ₹{ACCESS_FEE_INR} payment has been received and confirmed.\\n\\n"
                f"🔓 <b>Your ${config.appName} App Download is now UNLOCKED!</b>\\n\\n"
                f"🔗 <b>Download Link:</b> <a href=\\"{APP_DOWNLOAD_URL}\\">{APP_DOWNLOAD_URL}</a>\\n\\n"
                "👇 Tap below to start your APK download:"
            )
            await query.edit_message_text(
                text=success_text,
                reply_markup=get_unlocked_app_keyboard(),
                parse_mode=ParseMode.HTML,
            )
        else:
            payment_url, _ = get_or_create_payment_link(user_id, user_name)
            if not payment_url:
                payment_url = f"https://rzp.io/l/chatmate-300-access"

            pending_text = (
                f"⏳ <b>Payment Not Detected Yet</b>\\n\\n"
                f"Hi {user_name}, we have not yet received confirmation of your <b>₹{ACCESS_FEE_INR}</b> payment.\\n\\n"
                "<b>How to complete:</b>\\n"
                "1. Tap <b>'Pay ₹300 via Razorpay'</b> below.\\n"
                "2. Pay using GPay, PhonePe, Paytm, UPI, or Card.\\n"
                "3. Return here and tap <b>'I Have Paid — Unlock App Link'</b>.\\n\\n"
                "<i>(If you just completed payment, please wait 5-10 seconds for the bank confirmation and tap verify again.)</i>"
            )
            await query.edit_message_text(
                text=pending_text,
                reply_markup=get_payment_required_keyboard(payment_url),
                parse_mode=ParseMode.HTML,
            )

    elif data == "about_chatmate":
        about_text = (
            "💖 <b>About ${config.appName}</b>\\n\\n"
            "${config.appName} is a next-generation social communication app engineered for speed, "
            "privacy, and rich conversations.\\n\\n"
            "🌟 <b>Key Features:</b>\\n"
            "• ⚡ <b>Lightning Fast:</b> Instant messaging with low latency\\n"
            "• 🔒 <b>Privacy First:</b> End-to-end encrypted messaging\\n"
            "• 🤖 <b>Smart Assistant:</b> AI-driven chat enhancements\\n"
            "• 🎨 <b>Custom Themes:</b> Clean dark and light modes\\n\\n"
            f"💰 <b>Access Fee:</b> One-time ₹{ACCESS_FEE_INR} payment.\\n\\n"
            "Tap below to return to payment & unlock the app:"
        )
        payment_url, _ = get_or_create_payment_link(user_id, user_name)
        if not payment_url:
            payment_url = f"https://rzp.io/l/chatmate-300-access"

        await query.edit_message_text(
            text=about_text,
            reply_markup=get_payment_required_keyboard(payment_url),
            parse_mode=ParseMode.HTML,
        )

    elif data == "help_menu":
        help_text = (
            "ℹ️ <b>${config.appName} Help & Payment Support</b>\\n\\n"
            f"• <b>Why pay ₹{ACCESS_FEE_INR}?</b> ${config.appName} provides private, ad-free high-speed servers with AI companion features.\\n"
            "• <b>Payment Methods:</b> All UPI apps (Google Pay, PhonePe, Paytm), BHIM, Credit/Debit Cards, NetBanking.\\n"
            "• <b>After Payment:</b> The app download link unlocks automatically instantly.\\n\\n"
            "Need help or payment issue? Contact admin or proceed to pay below:"
        )
        payment_url, _ = get_or_create_payment_link(user_id, user_name)
        if not payment_url:
            payment_url = f"https://rzp.io/l/chatmate-300-access"

        await query.edit_message_text(
            text=help_text,
            reply_markup=get_payment_required_keyboard(payment_url),
            parse_mode=ParseMode.HTML,
        )


async def app_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Handles /app command.
    Checks if user has paid ₹300. If yes, gives link. If not, requires payment.
    """
    user = update.effective_user
    if not user:
        return

    user_name = user.first_name or "Friend"
    user_id = user.id

    if user_id in paid_users:
        await update.message.reply_text(
            f"📲 <b>Download ${config.appName} APK:</b>\\n<a href=\\"{APP_DOWNLOAD_URL}\\">{APP_DOWNLOAD_URL}</a>",
            reply_markup=get_unlocked_app_keyboard(),
            parse_mode=ParseMode.HTML,
        )
    else:
        payment_url, _ = get_or_create_payment_link(user_id, user_name)
        if not payment_url:
            payment_url = f"https://rzp.io/l/chatmate-300-access"

        await update.message.reply_text(
            f"🔒 <b>${config.appName} App Download is Locked</b>\\n\\n"
            f"To get the download link, please complete the one-time activation payment of <b>₹{ACCESS_FEE_INR}</b> below:",
            reply_markup=get_payment_required_keyboard(payment_url),
            parse_mode=ParseMode.HTML,
        )


async def unknown_message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Fallback handler."""
    user = update.effective_user
    if not user or not update.message:
        return

    user_name = user.first_name or "Friend"
    user_id = user.id

    if user_id in paid_users:
        await update.message.reply_text(
            "✅ Your account is active! Tap below to download ${config.appName}:",
            reply_markup=get_unlocked_app_keyboard(),
        )
    else:
        payment_url, _ = get_or_create_payment_link(user_id, user_name)
        if not payment_url:
            payment_url = f"https://rzp.io/l/chatmate-300-access"

        await update.message.reply_text(
            f"🔒 Please complete your <b>₹{ACCESS_FEE_INR} payment</b> to unlock the ${config.appName} application link:",
            reply_markup=get_payment_required_keyboard(payment_url),
            parse_mode=ParseMode.HTML,
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

    logger.info("Initializing ${config.appName} Paywall Bot (₹300 Access Fee)...")

    application = ApplicationBuilder().token(token).build()

    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("app", app_command))

    application.add_handler(CallbackQueryHandler(button_callback_handler))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, unknown_message_handler))
    application.add_error_handler(error_handler)

    logger.info("${config.appName} Paywall Bot is starting polling... Press Ctrl+C to stop.")
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
RAZORPAY_KEY_SECRET="70oNNW8Uj5ncuuEco3W1PHzn"
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
  return `# 🤖 ${config.appName} Telegram Bot (₹300 Paywall + Razorpay + Render 24/7)

A complete paywall bot:
1. User presses /start.
2. Bot demands ₹300 payment via Razorpay.
3. Once ₹300 is paid and verified, the official ChatMate App download link is UNLOCKED!
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
