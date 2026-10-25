import React, { useState } from 'react';
import { BotConfig } from '../types';
import {
  Cloud,
  Server,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface Props {
  config: BotConfig;
}

export const CloudHostingGuide: React.FC<Props> = ({ config }) => {
  const [activeProvider, setActiveProvider] = useState<'render' | 'railway' | 'pythonanywhere' | 'koyeb'>('render');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800/60">
              Free 24/7 Cloud Hosting
            </span>
            <span className="text-xs text-slate-400">Zero Server Maintenance</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Deploy ChatMate Bot for Free on Global Cloud Providers
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Deploy your Python bot to the cloud in under 5 minutes. The bot will run continuously 24 hours a day, 7 days a week, without keeping your computer or phone turned on.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Recommended</span>
            <span className="text-sm font-semibold text-sky-400">Render.com Free Tier</span>
          </div>
        </div>
      </div>

      {/* Provider Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'render', name: 'Render.com', badge: 'Top Pick · Free' },
          { id: 'railway', name: 'Railway.app', badge: 'Instant Git Deploy' },
          { id: 'koyeb', name: 'Koyeb', badge: 'Free Micro Container' },
          { id: 'pythonanywhere', name: 'PythonAnywhere', badge: 'Pure Python Cloud' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveProvider(tab.id as any)}
            className={`px-4 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeProvider === tab.id
                ? 'bg-sky-950 text-sky-300 border border-sky-800/80 shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            <Cloud className="w-4 h-4 opacity-80" />
            <span>{tab.name}</span>
            <span className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Provider Content */}
      {activeProvider === 'render' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-100 text-base">Step-by-Step Render.com Deployment</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Render provides free Web Services and native Python 3 runtime with automatic GitHub integration.
                </p>
              </div>
              <a
                href="https://dashboard.render.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <span>Open Render Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-semibold">
                  <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-700 flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Create GitHub Repository</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Download the files from the <b>Source Code</b> tab (or use the "Download All .ZIP" button), push them into a new GitHub repository (public or private).
                </p>
                <div className="font-mono text-[11px] bg-slate-900 p-2 rounded border border-slate-800 text-slate-300">
                  git init<br />
                  git add .<br />
                  git commit -m "Initial ChatMate bot setup"<br />
                  git push -u origin main
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-semibold">
                  <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-700 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Create Service on Render</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  On Render, click <b>New +</b> → <b>Web Service</b> or <b>Background Worker</b>, then link your GitHub repository.
                </p>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div><b>Runtime:</b> Python 3</div>
                  <div><b>Build Command:</b> <code className="text-sky-300">pip install -r requirements.txt</code></div>
                  <div><b>Start Command:</b> <code className="text-sky-300">python bot.py</code></div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-semibold">
                  <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-700 flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>Set Environment Variables</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Under the <b>Environment Variables</b> section on Render, add your secret Telegram token:
                </p>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-300">{config.envVarName}</span>
                  <span className="text-slate-400">your_token_from_botfather</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-semibold">
                  <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-700 flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span>Deploy & Verify Logs</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Click <b>Create Web Service</b>. Render builds the environment, installs dependencies, and executes <code className="text-sky-300">python bot.py</code>.
                </p>
                <div className="text-emerald-400 font-mono text-[11px] bg-slate-900 p-2 rounded border border-slate-800">
                  INFO: ChatMateBot: ChatMate Bot is starting polling...<br />
                  State: Healthy · Running 24/7
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeProvider === 'railway' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-100 text-base">Deploy on Railway.app</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Railway provides zero-config deployments by auto-detecting the Procfile and requirements.txt.
              </p>
            </div>
            <a
              href="https://railway.app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span>Open Railway</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-slate-100 block mb-1">1. Connect GitHub Repository</span>
              <span>Go to Railway dashboard, click "New Project" → "Deploy from GitHub repo".</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-slate-100 block mb-1">2. Auto Procfile Detection</span>
              <span>Railway reads your included <code className="text-sky-300">Procfile</code> (<code className="text-sky-300">worker: python bot.py</code>) and runs it as a background worker process.</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-slate-100 block mb-1">3. Set Environment Variable</span>
              <span>In your Railway project settings → Variables, add <code className="text-amber-300">{config.envVarName}</code>.</span>
            </div>
          </div>
        </div>
      )}

      {activeProvider === 'koyeb' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-100 text-base">Deploy on Koyeb (Free Nano Instance)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Koyeb offers high-performance cloud containers with generous free tier allowances.
              </p>
            </div>
            <a
              href="https://www.koyeb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span>Open Koyeb</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-slate-100 block mb-1">1. Create Koyeb App</span>
              <span>Select "GitHub" as the deployment source and pick your bot repository.</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-slate-100 block mb-1">2. Builder Type</span>
              <span>Select "Buildpack" (auto Python detection) or set Run command to <code className="text-sky-300">python bot.py</code>.</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-slate-100 block mb-1">3. Environment Secrets</span>
              <span>Add <code className="text-amber-300">{config.envVarName}</code> in the Environment Variables tab.</span>
            </div>
          </div>
        </div>
      )}

      {activeProvider === 'pythonanywhere' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-100 text-base">Deploy on PythonAnywhere</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Python-specific hosting platform providing a cloud bash terminal and file editor.
              </p>
            </div>
            <a
              href="https://www.pythonanywhere.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span>Open PythonAnywhere</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-slate-100 block mb-1">1. Open a Bash Console</span>
              <span>Sign up for a free Beginner account, open a Bash console in your browser, and run:</span>
              <div className="font-mono text-sky-300 bg-slate-900 p-2 rounded mt-1 border border-slate-800">
                pip3 install --user python-telegram-bot python-dotenv
              </div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-slate-100 block mb-1">2. Upload bot.py and .env</span>
              <span>Use the Files tab to upload your <code className="text-sky-300">bot.py</code> and create a <code className="text-sky-300">.env</code> file with your token.</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-slate-100 block mb-1">3. Run Always-On Task</span>
              <span>Run <code className="text-sky-300">python3 bot.py</code> or configure a Scheduled Task to monitor the process.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
