import React, { useState } from 'react';
import { BotConfig } from '../types';
import {
  ShieldCheck,
  Key,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Menu,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  config: BotConfig;
}

export const BotFatherGuide: React.FC<Props> = ({ config }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const telegramCommandsList = `start - Start bot and activate ChatMate
app - Get ChatMate app download link`;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded border border-indigo-800/60">
              BotFather & Security
            </span>
            <span className="text-xs text-slate-400">Telegram Bot Setup</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Create Your Bot & Configure the Telegram Menu
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Follow this official checklist to generate your bot token with Telegram's @BotFather, register your command menu buttons, and safeguard your token.
          </p>
        </div>

        <a
          href="https://t.me/BotFather"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2 shrink-0 shadow-md"
        >
          <Key className="w-4 h-4" />
          <span>Open @BotFather</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Getting Token */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
            <span className="w-6 h-6 rounded-full bg-sky-950 border border-sky-700 text-sky-400 flex items-center justify-center text-xs font-mono">
              01
            </span>
            <span>How to Get Your Bot API Token</span>
          </div>

          <ol className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-sky-400 font-mono font-bold">1.</span>
              <span>Open Telegram and search for <b>@BotFather</b> (verify the blue checkmark).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-400 font-mono font-bold">2.</span>
              <span>Send the message <code className="text-sky-300 font-mono bg-slate-950 px-1 py-0.5 rounded">/newbot</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-400 font-mono font-bold">3.</span>
              <span>Choose a display name (e.g. <b>ChatMate Official Bot</b>).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-400 font-mono font-bold">4.</span>
              <span>Choose a username ending in <code className="text-sky-300 font-mono">bot</code> (e.g. <b>ChatMateAppBot</b>).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sky-400 font-mono font-bold">5.</span>
              <span>
                BotFather will send your API Token in the format:<br />
                <code className="text-amber-300 font-mono bg-slate-950 px-2 py-1 rounded block mt-1 border border-slate-800 select-all">
                  1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ
                </code>
              </span>
            </li>
          </ol>
        </div>

        {/* Step 2: Register Commands Menu */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
              <span className="w-6 h-6 rounded-full bg-sky-950 border border-sky-700 text-sky-400 flex items-center justify-center text-xs font-mono">
                02
              </span>
              <span>Register the Command Menu (/setcommands)</span>
            </div>
            <button
              onClick={() => copyText(telegramCommandsList, 'cmds')}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'cmds' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied List</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Command List</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Registering commands ensures Telegram displays a convenient command popup menu when users type <code className="text-sky-300">/</code> in your bot:
          </p>

          <ol className="space-y-2 text-xs text-slate-300">
            <li>1. Send <code className="text-sky-300 font-mono bg-slate-950 px-1 py-0.5 rounded">/setcommands</code> to @BotFather.</li>
            <li>2. Select your newly created bot.</li>
            <li>3. Paste the following exact snippet and send:</li>
          </ol>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-sky-300 whitespace-pre leading-relaxed select-all">
            {telegramCommandsList}
          </div>
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-slate-100 text-sm">
            Security & Token Safety Checklist (Zero Hardcoding)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <Lock className="w-4 h-4" />
              <span>1. Environment Variables Only</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              The bot reads <code className="text-amber-300">{config.envVarName}</code> via <code className="text-sky-300">os.getenv()</code>. If the variable is missing, it exits safely with actionable instructions rather than crashing silently.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>2. No Admin Credentials Required</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              The bot operates cleanly without storing or verifying any <code className="text-slate-300">ADMIN_TELEGRAM_ID</code>. All commands and buttons are accessible to all users.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>3. Token Revocation If Leaked</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              If you ever suspect someone saw your token, message <code className="text-sky-300">/revoke</code> to @BotFather. This immediately issues a fresh token and voids the old one.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
