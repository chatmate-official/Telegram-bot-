import React, { useState, useRef, useEffect } from 'react';
import { TelegramMessage, InlineButton, BotConfig } from '../types';
import {
  Send,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Bot,
  User,
  CheckCheck,
  Terminal,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  config: BotConfig;
  onSelectCommand?: (cmd: string) => void;
}

export const TelegramSimulator: React.FC<Props> = ({ config }) => {
  const [messages, setMessages] = useState<TelegramMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: `👋 <b>Welcome to ${config.appName}, Alex!</b>\n\n✨ <b>${config.appName}</b> is your ultimate smart messaging app built for speed, privacy, and rich community conversations.\n\n💳 <b>Razorpay Payment Enabled:</b> You can now upgrade your account or make payments directly through official Razorpay (UPI, GPay, PhonePe, Paytm, Cards).\n\n📌 <b>Available Commands:</b>\n• /start - Restart bot and show this welcome menu\n• /pay - Open Razorpay payment portal\n• /about - Learn more about ${config.appName}\n• /app - Get the direct app download link\n• /help - Display the help center\n\n👇 <i>Tap an option below to get started:</i>`,
      timestamp: '12:00 PM',
      keyboard: [
        [
          { text: '💖 About ChatMate', callbackData: 'about_chatmate' },
          { text: '📲 Download App', url: config.appDownloadUrl },
        ],
        [
          { text: '💳 Pay with Razorpay', callbackData: 'pay_menu' },
        ],
        [
          { text: 'ℹ️ Help', callbackData: 'help_menu' },
        ],
      ],
      meta: {
        handlerType: 'CommandHandler',
        commandOrQuery: '/start',
        processingTimeMs: 34,
      },
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<{
    type: string;
    detail: string;
    codeSnippet: string;
  }>({
    type: 'CommandHandler("start")',
    detail: 'Executed /start. Sent welcome menu with Razorpay payment button.',
    codeSnippet: 'InlineKeyboardButton("💳 Pay with Razorpay", callback_data="pay_menu")',
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getMainKeyboard = (): InlineButton[][] => [
    [
      { text: '💖 About ChatMate', callbackData: 'about_chatmate' },
      { text: '📲 Download App', url: config.appDownloadUrl },
    ],
    [
      { text: '💳 Pay with Razorpay', callbackData: 'pay_menu' },
    ],
    [
      { text: 'ℹ️ Help', callbackData: 'help_menu' },
    ],
  ];

  const getPaymentPlansKeyboard = (): InlineButton[][] => [
    [
      { text: '🌟 1 Month VIP - ₹99', callbackData: 'buy_plan_99' },
    ],
    [
      { text: '💎 1 Year VIP - ₹499', callbackData: 'buy_plan_499' },
    ],
    [
      { text: '🔙 Back to Main Menu', callbackData: 'main_menu' },
    ]
  ];

  const handleCommandOrText = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMsg: TelegramMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: currentTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const lower = text.toLowerCase();

    setTimeout(() => {
      setIsTyping(false);
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (lower === '/start') {
        setLastEvent({
          type: 'CommandHandler("start")',
          detail: 'Sent welcome card with Razorpay Payment, Download App, and About buttons.',
          codeSnippet: `async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):\n    await update.message.reply_text(welcome_text, reply_markup=get_main_keyboard(), parse_mode=ParseMode.HTML)`,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            text: `👋 <b>Welcome to ${config.appName}!</b>\n\n✨ <b>${config.appName}</b> is your ultimate smart messaging app built for speed, privacy, and rich community conversations.\n\n💳 <b>Razorpay Payment Enabled:</b> You can now upgrade your account or make payments directly through official Razorpay (UPI, GPay, PhonePe, Paytm, Cards).\n\n📌 <b>Available Commands:</b>\n• /start - Restart bot and show this welcome menu\n• /pay - Open Razorpay payment portal\n• /about - Learn more about ${config.appName}\n• /app - Get the direct app download link\n• /help - Display the help center\n\n👇 <i>Tap an option below to get started:</i>`,
            timestamp: replyTime,
            keyboard: getMainKeyboard(),
            meta: {
              handlerType: 'CommandHandler',
              commandOrQuery: '/start',
              processingTimeMs: 32,
            },
          },
        ]);
      } else if (lower === '/pay') {
        setLastEvent({
          type: 'CommandHandler("pay")',
          detail: 'Matched pay_command. Opened Razorpay VIP subscription portal.',
          codeSnippet: `async def pay_command(update: Update, context: ContextTypes.DEFAULT_TYPE):\n    await update.message.reply_text(pay_intro, reply_markup=get_payment_plans_keyboard(), parse_mode=ParseMode.HTML)`,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            text: `💳 <b>${config.appName} Razorpay Payment Portal</b>\n\nUpgrade to <b>${config.appName} VIP</b> to unlock exclusive benefits:\n• ⚡ Unlimited High-Speed Messaging\n• 🤖 Priority AI Companion Access\n• 🚫 100% Ad-Free Experience\n• 💎 Exclusive VIP Profile Badge\n\n🔒 <i>Payments are secured 100% by Razorpay (UPI, GPay, PhonePe, Cards, NetBanking).</i>\n\nSelect your preferred plan below:`,
            timestamp: replyTime,
            keyboard: getPaymentPlansKeyboard(),
            meta: {
              handlerType: 'CommandHandler',
              commandOrQuery: '/pay',
              processingTimeMs: 28,
            },
          },
        ]);
      } else if (lower === '/about') {
        setLastEvent({
          type: 'CommandHandler("about")',
          detail: 'Matched about_command. Displayed app specs and features.',
          codeSnippet: `async def about_command(update: Update, context: ContextTypes.DEFAULT_TYPE):\n    await update.message.reply_text(about_text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode=ParseMode.HTML)`,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            text: `💖 <b>About ${config.appName}</b>\n\n${config.appName} is a next-generation social communication app engineered for speed, privacy, and rich conversations.\n\n🌟 <b>Key Features:</b>\n• ⚡ <b>Lightning Fast:</b> Instant messaging with low latency\n• 🔒 <b>Privacy First:</b> End-to-end encrypted messaging\n• 🤖 <b>Smart Assistant:</b> AI-driven chat enhancements\n• 🎨 <b>Custom Themes:</b> Clean dark and light modes\n• 🌐 <b>Cross-Platform:</b> Available on mobile and web\n\nReady to try ${config.appName}? Tap the button below to download the app! 👇`,
            timestamp: replyTime,
            keyboard: [
              [
                { text: '📲 Download App', url: config.appDownloadUrl },
                { text: '💳 Pay with Razorpay', callbackData: 'pay_menu' },
              ],
              [
                { text: 'ℹ️ Help', callbackData: 'help_menu' },
              ]
            ],
            meta: {
              handlerType: 'CommandHandler',
              commandOrQuery: '/about',
              processingTimeMs: 38,
            },
          },
        ]);
      } else if (lower === '/app') {
        setLastEvent({
          type: 'CommandHandler("app")',
          detail: 'Matched app_command. Sent direct link to official download URL.',
          codeSnippet: `async def app_command(update: Update, context: ContextTypes.DEFAULT_TYPE):\n    await update.message.reply_text(app_text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode=ParseMode.HTML)`,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            text: `📲 <b>Download ${config.appName} App</b>\n\nGet the latest version of ${config.appName} for Android with new updates and security features!\n\n🔗 <b>Direct Link:</b> <a href="${config.appDownloadUrl}">${config.appDownloadUrl}</a>\n\nTap the button below to start your download now:`,
            timestamp: replyTime,
            keyboard: [
              [
                { text: `🚀 Download ${config.appName} APK`, url: config.appDownloadUrl },
              ],
              [
                { text: '💖 About ChatMate', callbackData: 'about_chatmate' },
                { text: '💳 Razorpay Payment', callbackData: 'pay_menu' },
              ],
            ],
            meta: {
              handlerType: 'CommandHandler',
              commandOrQuery: '/app',
              processingTimeMs: 30,
            },
          },
        ]);
      } else if (lower === '/help') {
        setLastEvent({
          type: 'CommandHandler("help")',
          detail: 'Matched help_command. Sent command reference guide.',
          codeSnippet: `async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):\n    await update.message.reply_text(help_text, reply_markup=get_main_keyboard(), parse_mode=ParseMode.HTML)`,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            text: `ℹ️ <b>${config.appName} Help Center</b>\n\nHere are all the ways you can use this bot:\n\n• /start - Launch the bot and view the welcome menu\n• /pay - Open Razorpay payment portal\n• /about - Read about ${config.appName} features and capabilities\n• /app - Receive the official application download link\n• /help - View this help center\n\n💡 <i>Tip: You can also tap the interactive buttons on any message below!</i>`,
            timestamp: replyTime,
            keyboard: getMainKeyboard(),
            meta: {
              handlerType: 'CommandHandler',
              commandOrQuery: '/help',
              processingTimeMs: 31,
            },
          },
        ]);
      } else {
        setLastEvent({
          type: 'MessageHandler(filters.TEXT & ~filters.COMMAND)',
          detail: `User sent unhandled text "${text}". Friendly fallback prompt triggered.`,
          codeSnippet: `async def unknown_message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):\n    await update.message.reply_text("🤖 I'm here to help...", reply_markup=get_main_keyboard())`,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            text: `🤖 I'm here to help you with <b>${config.appName}</b>!\n\nPlease use the buttons below or type /help or /pay to see all available options.`,
            timestamp: replyTime,
            keyboard: getMainKeyboard(),
            meta: {
              handlerType: 'MessageHandler',
              processingTimeMs: 25,
            },
          },
        ]);
      }
    }, 380);
  };

  const handleButtonClick = (button: InlineButton, messageId: string) => {
    if (button.url) {
      showToast(`🌐 Opening link: ${button.url}`);
      window.open(button.url, '_blank', 'noopener,noreferrer');
      setLastEvent({
        type: 'InlineKeyboardButton(url=...)',
        detail: `Opened external checkout/download link: ${button.url}`,
        codeSnippet: `InlineKeyboardButton("${button.text}", url="${button.url}")`,
      });
      return;
    }

    if (button.callbackData) {
      const data = button.callbackData;

      if (data === 'pay_menu') {
        setLastEvent({
          type: 'CallbackQueryHandler(data="pay_menu")',
          detail: 'User tapped "💳 Pay with Razorpay". Displaying VIP subscription tiers.',
          codeSnippet: `if query.data == "pay_menu":\n    await query.edit_message_text(pay_intro, reply_markup=get_payment_plans_keyboard(), parse_mode=ParseMode.HTML)`,
        });
        showToast('💳 Opened Razorpay plans portal');

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                text: `💳 <b>${config.appName} Razorpay Payment Portal</b>\n\nChoose a VIP Subscription plan below to upgrade your ${config.appName} experience:\n\n🌟 <b>1 Month VIP:</b> ₹99 (Ad-free, High-speed AI)\n💎 <b>1 Year VIP:</b> ₹499 (Best Value! Save 58%)\n\n🔒 <i>100% Secure Checkout via Razorpay (UPI / GPay / PhonePe / Paytm / Cards / NetBanking).</i>`,
                keyboard: getPaymentPlansKeyboard(),
              };
            }
            return msg;
          })
        );
      } else if (data === 'buy_plan_99' || data === 'buy_plan_499') {
        const amount = data === 'buy_plan_99' ? 99 : 499;
        const planName = amount === 99 ? '1-Month VIP' : '1-Year VIP';
        const simulatedRzpUrl = `https://rzp.io/l/chatmate-vip-${amount}`;

        setLastEvent({
          type: 'create_razorpay_payment_link()',
          detail: `Generated live Razorpay Payment Link for ${planName} (₹${amount}) with Key ID rzp_live_TlLpKTsB7MoXPp`,
          codeSnippet: `link = razorpay_client.payment_link.create({\n    "amount": ${amount * 100},\n    "currency": "INR",\n    "description": "${config.appName} ${planName}"\n})`,
        });
        showToast(`⚡ Razorpay Link Generated: ₹${amount}`);

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                text: `🎉 <b>Ready to complete your payment!</b>\n\n📦 <b>Plan:</b> ${planName}\n💰 <b>Amount:</b> ₹${amount}\n🔒 <b>Gateway:</b> Razorpay Live API\n\nTap the button below to pay securely via <b>Razorpay</b> (UPI, GPay, PhonePe, Cards, NetBanking):`,
                keyboard: [
                  [
                    { text: `🚀 Pay ₹${amount} via Razorpay (UPI / Cards)`, url: simulatedRzpUrl },
                  ],
                  [
                    { text: '🔙 Back to Plans', callbackData: 'pay_menu' },
                    { text: '🏠 Main Menu', callbackData: 'main_menu' },
                  ]
                ],
              };
            }
            return msg;
          })
        );
      } else if (data === 'about_chatmate') {
        setLastEvent({
          type: 'CallbackQueryHandler(data="about_chatmate")',
          detail: 'User tapped "💖 About ChatMate". Message in-place edited via query.edit_message_text().',
          codeSnippet: `if query.data == "about_chatmate":\n    await query.edit_message_text(about_text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode=ParseMode.HTML)`,
        });
        showToast('⚡ Answered callback query: "about_chatmate"');

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                text: `💖 <b>About ${config.appName}</b>\n\n${config.appName} is designed to make your daily conversations smoother, faster, and smarter!\n\n✨ <b>Highlights:</b>\n• End-to-end security & user privacy\n• Smart message translation & AI companion\n• High-definition voice & video quality\n• Low battery & lightweight data consumption\n\n👇 <i>Ready to join? Download or upgrade below:</i>`,
                keyboard: [
                  [
                    { text: '📲 Download App', url: config.appDownloadUrl },
                    { text: '💳 Pay with Razorpay', callbackData: 'pay_menu' },
                  ],
                  [
                    { text: '🔙 Back to Main Menu', callbackData: 'main_menu' },
                  ],
                ],
              };
            }
            return msg;
          })
        );
      } else if (data === 'help_menu') {
        setLastEvent({
          type: 'CallbackQueryHandler(data="help_menu")',
          detail: 'User tapped "ℹ️ Help". Displayed Help Center with app guidance.',
          codeSnippet: `elif query.data == "help_menu":\n    await query.edit_message_text(help_text, reply_markup=InlineKeyboardMarkup(keyboard), parse_mode=ParseMode.HTML)`,
        });
        showToast('⚡ Answered callback query: "help_menu"');

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                text: `ℹ️ <b>${config.appName} Help Center</b>\n\nWelcome to the help section! Need guidance on how to use ${config.appName}?\n\n• <b>Download App:</b> Tap '📲 Download App' or use /app to download the APK.\n• <b>Razorpay Payment:</b> Tap '💳 Pay with Razorpay' or use /pay to upgrade.\n• <b>Features:</b> Tap '💖 About ChatMate' or use /about to see feature details.\n• <b>Commands:</b> Use /start to refresh the menu anytime.\n\nTap below to choose an action:`,
                keyboard: [
                  [
                    { text: '📲 Download App', url: config.appDownloadUrl },
                    { text: '💳 Pay with Razorpay', callbackData: 'pay_menu' },
                  ],
                  [
                    { text: '🔙 Back to Main Menu', callbackData: 'main_menu' },
                  ],
                ],
              };
            }
            return msg;
          })
        );
      } else if (data === 'main_menu') {
        setLastEvent({
          type: 'CallbackQueryHandler(data="main_menu")',
          detail: 'Navigated back to root menu.',
          codeSnippet: `elif query.data == "main_menu":\n    await query.edit_message_text(welcome_text, reply_markup=get_main_keyboard())`,
        });
        showToast('⚡ Main menu restored');

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                text: `👋 <b>${config.appName} Main Menu</b>\n\nWelcome back! What would you like to explore today?\n\n• /pay - Razorpay payment portal\n• /about - Learn more about ${config.appName}\n• /app - Get the direct app download link\n• /help - Display the help guide`,
                keyboard: getMainKeyboard(),
              };
            }
            return msg;
          })
        );
      }
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'bot',
        text: `👋 <b>Welcome to ${config.appName}, Alex!</b>\n\n✨ <b>${config.appName}</b> is your ultimate smart messaging app built for speed, privacy, and rich community conversations.\n\n💳 <b>Razorpay Payment Enabled:</b> You can now upgrade your account or make payments directly through official Razorpay (UPI, GPay, PhonePe, Paytm, Cards).\n\n📌 <b>Available Commands:</b>\n• /start - Restart bot and show this welcome menu\n• /pay - Open Razorpay payment portal\n• /about - Learn more about ${config.appName}\n• /app - Get the direct app download link\n• /help - Display the help center\n\n👇 <i>Tap an option below to get started:</i>`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        keyboard: getMainKeyboard(),
        meta: {
          handlerType: 'CommandHandler',
          commandOrQuery: '/start',
          processingTimeMs: 35,
        },
      },
    ]);
    showToast('🔄 Simulator reset to fresh /start session');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-sky-500/90 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg backdrop-blur-sm border border-sky-400/30 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Telegram Client Simulator View */}
      <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[740px]">
        {/* Telegram Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-inner">
                CM
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100 text-sm tracking-tight">{config.appName} Bot</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                  Razorpay Live
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>VIP & Payments Enabled</span>
                <span>·</span>
                <span className="text-sky-400 font-mono text-[11px]">@ChatMateAppBot</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="Reset conversation"
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Telegram Chat Message History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/70">
          <div className="text-center my-2">
            <span className="text-[11px] text-slate-400 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800">
              Today
            </span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-br-sm'
                    : 'bg-slate-800/95 text-slate-100 rounded-bl-sm border border-slate-700/60'
                }`}
              >
                <div
                  className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />

                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                    msg.sender === 'user' ? 'text-sky-200' : 'text-slate-400'
                  }`}
                >
                  <span className="tabular-nums">{msg.timestamp}</span>
                  {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Inline Keyboards */}
              {msg.keyboard && msg.keyboard.length > 0 && (
                <div className="mt-2 space-y-1.5 w-full max-w-[85%]">
                  {msg.keyboard.map((row, rIdx) => (
                    <div key={rIdx} className="grid grid-flow-col auto-cols-fr gap-1.5">
                      {row.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          onClick={() => handleButtonClick(btn, msg.id)}
                          className={`border text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-sm whitespace-nowrap cursor-pointer ${
                            btn.text.includes('Pay') || btn.text.includes('₹')
                              ? 'bg-emerald-950/80 hover:bg-emerald-900/60 text-emerald-200 border-emerald-700/70'
                              : 'bg-slate-800/90 hover:bg-sky-900/40 text-slate-200 hover:text-sky-200 border-slate-700/80 hover:border-sky-500/50'
                          }`}
                        >
                          <span>{btn.text}</span>
                          {btn.url && <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
              <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>{config.appName} Bot is typing...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Command Pills */}
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs text-slate-400 scrollbar-none">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 shrink-0">Commands:</span>
          {['/start', '/pay', '/about', '/app', '/help'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleCommandOrText(cmd)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 hover:text-sky-300 text-slate-300 rounded border border-slate-700/60 transition-colors font-mono text-[11px] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Telegram Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommandOrText(input);
          }}
          className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type /start, /pay, /about, /app, /help..."
            className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-sky-500 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Simulator Event & Telemetry Inspector */}
      <div className="lg:col-span-5 space-y-4">
        {/* Real-Time Python Event Telemetry Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <h3 className="font-semibold text-slate-100 text-sm">Bot Engine Event Inspector</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              Razorpay API Active
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">TRIGGERED HANDLER:</span>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs text-sky-300">
                {lastEvent.type}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">EXECUTION DETAILS:</span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                {lastEvent.detail}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">UNDERLYING PYTHON CODE:</span>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
                {lastEvent.codeSnippet}
              </div>
            </div>
          </div>
        </div>

        {/* Razorpay Gateway Status Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Razorpay Payment Gateway Config</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Razorpay Key ID</span>
              <span className="font-mono text-sky-300 font-medium">rzp_live_TlLpKTsB7...</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Payment Modes</span>
              <span className="font-medium text-emerald-300">UPI, Cards, NetBanking</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">1 Month VIP</span>
              <span className="font-semibold text-slate-200">₹99</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[11px]">1 Year VIP</span>
              <span className="font-semibold text-slate-200">₹499 (Save 58%)</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <span className="text-xs font-semibold text-slate-300 block mb-2">Active Buttons on /start:</span>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><b>💖 About ChatMate</b> - Features & specs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><b>📲 Download App</b> - Official link (<code className="text-sky-300">{config.appDownloadUrl}</code>)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><b>💳 Pay with Razorpay</b> - Instant UPI & Card checkout links</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><b>ℹ️ Help</b> - Help & commands center</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
