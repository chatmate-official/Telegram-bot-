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
  Lock,
  Unlock,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  config: BotConfig;
  onSelectCommand?: (cmd: string) => void;
}

export const TelegramSimulator: React.FC<Props> = ({ config }) => {
  const [hasPaid, setHasPaid] = useState(false);
  const [messages, setMessages] = useState<TelegramMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: `👋 <b>Welcome to ${config.appName}, Alex!</b>\n\n🔒 <b>ChatMate Private VIP Access Pass</b>\nTo download the official <b>${config.appName} Application</b>, a one-time activation fee of <b>₹300</b> is required.\n\n✨ <b>What you unlock after ₹300 payment:</b>\n• 📲 <b>Direct APK Download Link</b> (Full Unrestricted Access)\n• ⚡ High-speed lag-free private messaging\n• 🤖 Smart AI Companion & voice filters\n• 💎 Lifetime VIP Membership & zero advertisements\n\n💳 <i>Secure payment handled 100% by Razorpay (Google Pay, PhonePe, Paytm, UPI, Cards, NetBanking).</i>\n\n👇 <b>Step 1:</b> Tap the button below to Pay ₹300\n👇 <b>Step 2:</b> After paying, tap <b>'I Have Paid — Unlock App Link'</b>:`,
      timestamp: '12:00 PM',
      keyboard: [
        [
          { text: '💳 Pay ₹300 via Razorpay (UPI / GPay / Cards)', url: 'https://rzp.io/l/chatmate-300-access' },
        ],
        [
          { text: '✅ I Have Paid — Unlock App Link', callbackData: 'verify_payment' },
        ],
        [
          { text: '💖 About ChatMate', callbackData: 'about_chatmate' },
          { text: 'ℹ️ Help / Support', callbackData: 'help_menu' },
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
    type: 'CommandHandler("/start")',
    detail: 'Presented mandatory ₹300 Razorpay paywall. App download link remains locked until payment is verified.',
    codeSnippet: 'InlineKeyboardButton("💳 Pay ₹300 via Razorpay", url=payment_url)',
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

  const getLockedKeyboard = (): InlineButton[][] => [
    [
      { text: '💳 Pay ₹300 via Razorpay (UPI / GPay / Cards)', url: 'https://rzp.io/l/chatmate-300-access' },
    ],
    [
      { text: '✅ I Have Paid — Unlock App Link', callbackData: 'verify_payment' },
    ],
    [
      { text: '💖 About ChatMate', callbackData: 'about_chatmate' },
      { text: 'ℹ️ Help / Support', callbackData: 'help_menu' },
    ],
  ];

  const getUnlockedKeyboard = (): InlineButton[][] => [
    [
      { text: '🚀 📲 Download ChatMate APK Now', url: config.appDownloadUrl },
    ],
    [
      { text: '💖 About ChatMate', callbackData: 'about_chatmate' },
      { text: 'ℹ️ Help Center', callbackData: 'help_menu' },
    ],
  ];

  const handleCommandOrText = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
        if (hasPaid) {
          setLastEvent({
            type: 'CommandHandler("/start") [PAID USER]',
            detail: 'User has verified ₹300 payment. Granting instant access to official ChatMate download APK.',
            codeSnippet: `if user_id in paid_users:\n    await update.message.reply_text(unlocked_text, reply_markup=get_unlocked_app_keyboard())`,
          });
          setMessages((prev) => [
            ...prev,
            {
              id: `b-${Date.now()}`,
              sender: 'bot',
              text: `🎉 <b>Welcome back!</b>\n\n✅ <b>Your ChatMate VIP Access is ACTIVE!</b>\nYou have already completed the ₹300 payment.\n\n👇 <i>Tap below to download the latest ChatMate App APK:</i>`,
              timestamp: replyTime,
              keyboard: getUnlockedKeyboard(),
            },
          ]);
        } else {
          setLastEvent({
            type: 'CommandHandler("/start") [PAYWALL ACTIVE]',
            detail: 'Enforcing ₹300 Razorpay payment. App link is protected until payment verification.',
            codeSnippet: `payment_url, _ = get_or_create_payment_link(user_id, user_name)\nawait update.message.reply_text(paywall_text, reply_markup=get_payment_required_keyboard(payment_url))`,
          });
          setMessages((prev) => [
            ...prev,
            {
              id: `b-${Date.now()}`,
              sender: 'bot',
              text: `👋 <b>Welcome to ${config.appName}!</b>\n\n🔒 <b>ChatMate Private VIP Access Pass</b>\nTo download the official <b>${config.appName} Application</b>, a one-time activation fee of <b>₹300</b> is required.\n\n✨ <b>What you unlock after ₹300 payment:</b>\n• 📲 <b>Direct APK Download Link</b> (Full Unrestricted Access)\n• ⚡ High-speed lag-free private messaging\n• 🤖 Smart AI Companion & voice filters\n• 💎 Lifetime VIP Membership & zero advertisements\n\n💳 <i>Secure payment handled 100% by Razorpay (Google Pay, PhonePe, Paytm, UPI, Cards, NetBanking).</i>\n\n👇 <b>Step 1:</b> Tap the button below to Pay ₹300\n👇 <b>Step 2:</b> After paying, tap <b>'I Have Paid — Unlock App Link'</b>:`,
              timestamp: replyTime,
              keyboard: getLockedKeyboard(),
            },
          ]);
        }
      } else if (lower === '/app') {
        if (hasPaid) {
          setMessages((prev) => [
            ...prev,
            {
              id: `b-${Date.now()}`,
              sender: 'bot',
              text: `📲 <b>Download ChatMate APK:</b>\n<a href="${config.appDownloadUrl}">${config.appDownloadUrl}</a>`,
              timestamp: replyTime,
              keyboard: getUnlockedKeyboard(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `b-${Date.now()}`,
              sender: 'bot',
              text: `🔒 <b>ChatMate App Download is Locked</b>\n\nPlease complete the one-time activation payment of <b>₹300</b> to unlock your download link:`,
              timestamp: replyTime,
              keyboard: getLockedKeyboard(),
            },
          ]);
        }
      } else {
        if (hasPaid) {
          setMessages((prev) => [
            ...prev,
            {
              id: `b-${Date.now()}`,
              sender: 'bot',
              text: `✅ Your ChatMate account is active! Tap below to download the application:`,
              timestamp: replyTime,
              keyboard: getUnlockedKeyboard(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `b-${Date.now()}`,
              sender: 'bot',
              text: `🔒 Please complete your <b>₹300 payment</b> via Razorpay to unlock the ChatMate application link:`,
              timestamp: replyTime,
              keyboard: getLockedKeyboard(),
            },
          ]);
        }
      }
    }, 380);
  };

  const handleButtonClick = (button: InlineButton, messageId: string) => {
    if (button.url) {
      if (button.url === config.appDownloadUrl) {
        showToast(`📲 Opening ChatMate App Download: ${button.url}`);
      } else {
        showToast(`💳 Opening Razorpay ₹300 Checkout`);
        // If user tapped pay link in simulator, offer instant simulation unlock!
        setTimeout(() => {
          showToast(`💡 Simulated ₹300 payment completed! Tap 'I Have Paid' to unlock.`);
        }, 1200);
      }
      window.open(button.url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (button.callbackData) {
      const data = button.callbackData;

      if (data === 'verify_payment') {
        // Toggle/simulate successful payment
        setHasPaid(true);
        setLastEvent({
          type: 'razorpay_client.payment_link.fetch() -> "paid"',
          detail: 'Razorpay API returned status: "paid" (₹300 received). App download link UNLOCKED!',
          codeSnippet: `if status == "paid":\n    paid_users.add(user_id)\n    await query.edit_message_text(success_text, reply_markup=get_unlocked_app_keyboard())`,
        });
        showToast('🎉 ₹300 Payment Confirmed! App Download Unlocked!');

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                text: `🎉 <b>PAYMENT VERIFIED SUCCESSFULLY!</b>\n\nThank you, <b>Alex</b>! Your <b>₹300</b> payment has been received and verified via Razorpay.\n\n🔓 <b>Your ChatMate App Download is now UNLOCKED!</b>\n\n🔗 <b>Official APK:</b> <a href="${config.appDownloadUrl}">${config.appDownloadUrl}</a>\n\n👇 Tap below to start your APK download:`,
                keyboard: getUnlockedKeyboard(),
              };
            }
            return msg;
          })
        );
      } else if (data === 'about_chatmate') {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                text: `💖 <b>About ChatMate</b>\n\nChatMate is a next-generation social communication app engineered for speed, privacy, and rich conversations.\n\n🌟 <b>Key Features:</b>\n• ⚡ <b>Lightning Fast:</b> Instant messaging with zero lag\n• 🔒 <b>Privacy First:</b> End-to-end encrypted messaging\n• 🤖 <b>Smart Assistant:</b> AI-driven chat enhancements\n• 🎨 <b>Custom Themes:</b> Clean dark and light modes\n\n💰 <b>Access Fee:</b> One-time ₹300 activation payment.\n\nTap below to proceed with payment:`,
                keyboard: hasPaid ? getUnlockedKeyboard() : getLockedKeyboard(),
              };
            }
            return msg;
          })
        );
      } else if (data === 'help_menu') {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                text: `ℹ️ <b>ChatMate Help & Payment Support</b>\n\n• <b>Why pay ₹300?</b> ChatMate runs dedicated high-speed encrypted servers with VIP AI companion features.\n• <b>Payment Methods:</b> All UPI apps (Google Pay, PhonePe, Paytm), BHIM, Credit/Debit Cards, NetBanking.\n• <b>Instant Unlock:</b> As soon as your ₹300 payment is received, the app download link unlocks automatically!`,
                keyboard: hasPaid ? getUnlockedKeyboard() : getLockedKeyboard(),
              };
            }
            return msg;
          })
        );
      }
    }
  };

  const handleReset = () => {
    setHasPaid(false);
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'bot',
        text: `👋 <b>Welcome to ${config.appName}, Alex!</b>\n\n🔒 <b>ChatMate Private VIP Access Pass</b>\nTo download the official <b>${config.appName} Application</b>, a one-time activation fee of <b>₹300</b> is required.\n\n✨ <b>What you unlock after ₹300 payment:</b>\n• 📲 <b>Direct APK Download Link</b> (Full Unrestricted Access)\n• ⚡ High-speed lag-free private messaging\n• 🤖 Smart AI Companion & voice filters\n• 💎 Lifetime VIP Membership & zero advertisements\n\n💳 <i>Secure payment handled 100% by Razorpay (Google Pay, PhonePe, Paytm, UPI, Cards, NetBanking).</i>\n\n👇 <b>Step 1:</b> Tap the button below to Pay ₹300\n👇 <b>Step 2:</b> After paying, tap <b>'I Have Paid — Unlock App Link'</b>:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        keyboard: getLockedKeyboard(),
        meta: {
          handlerType: 'CommandHandler',
          commandOrQuery: '/start',
          processingTimeMs: 35,
        },
      },
    ]);
    showToast('🔄 Reset to locked ₹300 paywall state');
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
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border flex items-center gap-1 ${
                  hasPaid
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                    : 'bg-amber-950 text-amber-300 border-amber-800/60'
                }`}>
                  {hasPaid ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                  <span>{hasPaid ? 'Access Unlocked' : '₹300 Paywall Active'}</span>
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>ChatMate VIP Gatekeeper</span>
                <span>·</span>
                <span className="text-sky-400 font-mono text-[11px]">@ChatMateAppBot</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="Reset conversation and lock state"
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
                          className={`border text-xs font-medium py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-sm whitespace-nowrap cursor-pointer ${
                            btn.text.includes('Pay ₹300')
                              ? 'bg-amber-950/80 hover:bg-amber-900/70 text-amber-200 border-amber-600/70 font-semibold'
                              : btn.text.includes('Verify') || btn.text.includes('Paid')
                              ? 'bg-emerald-950/80 hover:bg-emerald-900/70 text-emerald-200 border-emerald-600/70 font-semibold'
                              : btn.text.includes('Download')
                              ? 'bg-sky-600 hover:bg-sky-500 text-white border-sky-400 font-bold shadow-lg'
                              : 'bg-slate-800/90 hover:bg-slate-700/80 text-slate-200 border-slate-700/80'
                          }`}
                        >
                          <span>{btn.text}</span>
                          {btn.url && <ExternalLink className="w-3 h-3 opacity-80 shrink-0" />}
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
              <span>{config.appName} Bot is checking...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Command Pills */}
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs text-slate-400 scrollbar-none">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 shrink-0">Commands:</span>
          {['/start', '/app'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleCommandOrText(cmd)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 hover:text-sky-300 text-slate-300 rounded border border-slate-700/60 transition-colors font-mono text-[11px] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {cmd}
            </button>
          ))}
          <button
            onClick={() => {
              setHasPaid(!hasPaid);
              showToast(hasPaid ? '🔒 Status toggled to: UNPAID' : '🔓 Status toggled to: PAID');
            }}
            className="ml-auto px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-amber-800/50 transition-colors text-[11px] cursor-pointer"
          >
            {hasPaid ? 'Simulate Unpaid' : 'Simulate Paid'}
          </button>
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
            placeholder="Type /start or a message..."
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
              <h3 className="font-semibold text-slate-100 text-sm">Paywall Engine Telemetry</h3>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
              hasPaid
                ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40'
                : 'text-amber-300 bg-amber-950/60 border-amber-800/40'
            }`}>
              {hasPaid ? 'Access Granted' : 'Locked (Fee: ₹300)'}
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

        {/* Paywall Rules Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>ChatMate ₹300 Paywall Rules</span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-semibold text-slate-200 block mb-1">1. User sends /start</span>
              <span className="text-slate-400 text-[11px]">
                Bot checks if user has paid. If not, it creates a <b>₹300 Razorpay link</b> and locks the app download.
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-semibold text-slate-200 block mb-1">2. User completes payment</span>
              <span className="text-slate-400 text-[11px]">
                User pays via GPay, PhonePe, Paytm, Cards, or UPI on Razorpay.
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-semibold text-emerald-400 block mb-1">3. App Link Unlocked</span>
              <span className="text-slate-400 text-[11px]">
                Bot verifies payment and immediately delivers the official APK link: <code className="text-sky-300">{config.appDownloadUrl}</code>.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
