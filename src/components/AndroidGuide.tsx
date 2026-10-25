import React, { useState } from 'react';
import { BotConfig } from '../types';
import {
  Smartphone,
  Copy,
  Check,
  Terminal,
  AlertCircle,
  ExternalLink,
  BatteryCharging,
  Power,
  Play,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

interface Props {
  config: BotConfig;
}

export const AndroidGuide: React.FC<Props> = ({ config }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [simulatedCmd, setSimulatedCmd] = useState('');
  const [simLog, setSimLog] = useState<string[]>([
    'Welcome to Termux (Android Linux Environment)!',
    'Type or tap any quick command below to test your terminal commands.',
  ]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      step: 1,
      title: 'Install Termux on Your Android Smartphone',
      badge: 'Prerequisite',
      description:
        'Termux provides a full Linux terminal environment on Android without requiring root. Note: Always install Termux from F-Droid, because the version on Google Play Store is outdated and no longer receives package updates.',
      commands: [],
      link: {
        text: 'Download Termux on F-Droid (Free & Open Source)',
        url: 'https://f-droid.org/packages/com.termux/',
      },
      tip: 'After downloading the F-Droid APK, open it and tap Install for Termux.',
    },
    {
      step: 2,
      title: 'Update Package Repositories and Install Python',
      badge: 'Terminal Setup',
      description: 'Open the Termux app on your phone, then copy and paste this command to install Python and Git:',
      commands: [
        'pkg update && pkg upgrade -y',
        'pkg install -y python git nano',
      ],
      tip: 'If prompted with [Y/n], press Enter to accept defaults.',
    },
    {
      step: 3,
      title: 'Install python-telegram-bot & python-dotenv',
      badge: 'Dependencies',
      description: 'Install the official modern Python Telegram Bot library (v20+) and environment variable loader:',
      commands: [
        'pip install python-telegram-bot python-dotenv',
      ],
      tip: 'This handles async/await, Telegram API requests, and inline buttons.',
    },
    {
      step: 4,
      title: 'Create the Bot Directory and Code File',
      badge: 'Code Setup',
      description:
        'Create a dedicated folder for ChatMate bot and generate your `bot.py` file:',
      commands: [
        'mkdir -p chatmate-bot && cd chatmate-bot',
        'nano bot.py',
      ],
      tip: 'In Termux, paste the bot.py code from the "Source Code" tab, then press Ctrl+O then Enter to save, and Ctrl+X to exit.',
    },
    {
      step: 5,
      title: 'Set Your Telegram Bot Token Securely',
      badge: 'Security (Requirement 7)',
      description:
        'Never hardcode your bot token! Export it directly in your terminal environment or put it in a `.env` file:',
      commands: [
        `export ${config.envVarName}="YOUR_ACTUAL_BOT_TOKEN_FROM_BOTFATHER"`,
      ],
      tip: 'Replace the quoted text with the token you received from @BotFather on Telegram.',
    },
    {
      step: 6,
      title: 'Launch and Test Your ChatMate Bot',
      badge: 'Execution',
      description: 'Start the bot! It will immediately connect to Telegram and start polling for messages:',
      commands: [
        'python bot.py',
      ],
      tip: 'Now open Telegram, search for your bot, send /start, and try tapping 💖 About ChatMate and 📲 Download App!',
    },
    {
      step: 7,
      title: 'Keep It Running 24/7 in the Background (No Screen On Needed)',
      badge: '24/7 Persistence',
      description:
        'By default, Android aggressively sleeps background apps to save battery. Follow these two commands to keep your bot running even when the screen is locked:',
      commands: [
        'termux-wake-lock',
        'nohup python bot.py > bot.log 2>&1 &',
      ],
      tip: 'Run "termux-wake-lock" so Android doesn\'t kill the CPU. "nohup ... &" lets the bot run continuously even if you close the Termux window!',
    },
  ];

  const runSimulatedCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    const newLogs = [...simLog, `$ ${trimmed}`];

    if (trimmed.includes('python bot.py')) {
      newLogs.push('INFO: ChatMateBot: Initializing ChatMate Telegram Bot...');
      newLogs.push('INFO: ChatMateBot: ChatMate Bot is starting polling... Press Ctrl+C to stop.');
      newLogs.push('✅ Bot is now online and receiving updates from Telegram!');
    } else if (trimmed.includes('pip install')) {
      newLogs.push('Collecting python-telegram-bot>=20.8');
      newLogs.push('Collecting python-dotenv>=1.0.0');
      newLogs.push('Successfully installed python-telegram-bot-21.1.1 python-dotenv-1.0.1');
    } else if (trimmed.includes('pkg update') || trimmed.includes('pkg install')) {
      newLogs.push('Reading package lists... Done');
      newLogs.push('Setting up python (3.11+)... Done');
      newLogs.push('Setting up git, nano... Done');
    } else if (trimmed.includes('termux-wake-lock')) {
      newLogs.push('Acquiring wake lock... Screen-off sleep prevented for background bot operations.');
    } else if (trimmed.includes('export')) {
      newLogs.push(`Environment variable ${config.envVarName} exported to current shell session.`);
    } else {
      newLogs.push(`Command executed successfully.`);
    }

    setSimLog(newLogs);
    setSimulatedCmd('');
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded border border-sky-800/60">
              Android Deployment Guide
            </span>
            <span className="text-xs text-slate-400">Zero Cost · No PC Required</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Host ChatMate Telegram Bot Directly on Your Android Phone
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Follow this simple beginner guide to turn any spare or daily Android smartphone into a dedicated 24/7 Telegram bot server using Termux.
          </p>
        </div>

        <a
          href="https://f-droid.org/packages/com.termux/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2 shrink-0 shadow-md"
        >
          <Smartphone className="w-4 h-4" />
          <span>Get Termux on F-Droid</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>

      {/* Step by Step Timeline */}
      <div className="space-y-4">
        {steps.map((item, idx) => (
          <div
            key={item.step}
            className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-sky-950 border border-sky-700/60 text-sky-400 flex items-center justify-center text-xs font-bold font-mono">
                  0{item.step}
                </span>
                <h3 className="font-semibold text-slate-100 text-sm">{item.title}</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 self-start sm:self-auto">
                {item.badge}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">{item.description}</p>

            {item.link && (
              <a
                href={item.link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 hover:underline mb-3"
              >
                <span>{item.link.text}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {item.commands.length > 0 && (
              <div className="space-y-2 mb-3">
                {item.commands.map((cmd, cIdx) => {
                  const globalIdx = idx * 10 + cIdx;
                  return (
                    <div
                      key={cIdx}
                      className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between gap-3 font-mono text-xs text-sky-300"
                    >
                      <div className="overflow-x-auto select-all">
                        <span className="text-slate-600 mr-2 select-none">$</span>
                        {cmd}
                      </div>
                      <button
                        onClick={() => copyToClipboard(cmd, globalIdx)}
                        className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors flex items-center gap-1 shrink-0"
                        title="Copy command"
                      >
                        {copiedIndex === globalIdx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {item.tip && (
              <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{item.tip}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Battery Optimization & Background Persistence Card */}
      <div className="bg-slate-900 border border-amber-900/40 rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <BatteryCharging className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-slate-100 text-sm">
            Critical Android Setting: Disable Battery Optimization
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Android OEMs (Samsung, Xiaomi, OnePlus, Huawei, etc.) will freeze background apps after a few minutes of inactivity. To ensure your bot runs 24/7:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">1. Battery Optimization</span>
            <span className="text-slate-400 text-[11px]">
              Go to Android Settings → Apps → Termux → Battery → Select <b>"Unrestricted"</b> or "Don't Optimize".
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">2. Termux Wake Lock</span>
            <span className="text-slate-400 text-[11px]">
              Execute <code className="text-sky-300">termux-wake-lock</code> in the terminal to prevent the CPU from going into deep sleep.
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">3. Background Daemon</span>
            <span className="text-slate-400 text-[11px]">
              Launch using <code className="text-sky-300">nohup python bot.py &</code> so it continues running if the Termux app is swiped away.
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Termux Practice Terminal */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-slate-200 text-xs sm:text-sm">
              Termux Command Test-Bed & Sandbox
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Android Shell Practice</span>
        </div>

        <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs space-y-1.5 h-48 overflow-y-auto">
          {simLog.map((log, lIdx) => (
            <div key={lIdx} className="leading-relaxed">
              {log}
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={simulatedCmd}
            onChange={(e) => setSimulatedCmd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSimulatedCommand(simulatedCmd);
            }}
            placeholder="Try typing: python bot.py or termux-wake-lock..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono placeholder-slate-600 focus:outline-none"
          />
          <button
            onClick={() => runSimulatedCommand(simulatedCmd)}
            className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-mono transition-colors"
          >
            Run
          </button>
        </div>
      </div>
    </div>
  );
};
