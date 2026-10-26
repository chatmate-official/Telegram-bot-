import React, { useState } from 'react';
import { BotConfig } from './types';
import { TelegramSimulator } from './components/TelegramSimulator';
import { CodeViewer } from './components/CodeViewer';
import { AndroidGuide } from './components/AndroidGuide';
import { CloudHostingGuide } from './components/CloudHostingGuide';
import { BotFatherGuide } from './components/BotFatherGuide';
import { downloadProjectZip } from './utils/zipExport';
import {
  Download,
  Terminal,
  Smartphone,
  Cloud,
  FileCode,
  ShieldCheck,
  Send,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'simulator' | 'code' | 'android' | 'cloud' | 'botfather'
  >('simulator');

  const [botConfig, setBotConfig] = useState<BotConfig>({
    appName: 'ChatMate',
    appDownloadUrl: 'https://tinyurl.com/Chat-mate-app',
    razorpayPaymentUrl: 'https://rzp.io/l/chatmate-vip-99',
    envVarName: 'TELEGRAM_BOT_TOKEN',
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Universal Top Bar Contract: 3 Zones (Wordmark - 4-5 Nav Links - 1 Primary Action) */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Send className="w-4 h-4 -rotate-12" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-100 whitespace-nowrap">
              ChatMate Bot Studio
            </span>
          </div>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'simulator' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              Live Simulator
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'code' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              Source Code
            </button>
            <button
              onClick={() => setActiveTab('android')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'android' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              Android Setup
            </button>
            <button
              onClick={() => setActiveTab('cloud')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'cloud' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              Free Hosting
            </button>
            <button
              onClick={() => setActiveTab('botfather')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'botfather' ? 'text-sky-400 font-semibold' : ''
              }`}
            >
              BotFather & Security
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => downloadProjectZip(botConfig)}
              className="px-3.5 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.ZIP)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Scroller */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
        {[
          { id: 'simulator', label: 'Simulator' },
          { id: 'code', label: 'Source Code' },
          { id: 'android', label: 'Android Setup' },
          { id: 'cloud', label: 'Free Hosting' },
          { id: 'botfather', label: 'BotFather & Security' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-sky-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Context Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>ChatMate Ecosystem</span>
              <span aria-hidden="true">·</span>
              <span>Python Telegram Bot v20+</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-mono">No Admin ID Required</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              {activeTab === 'simulator' && 'Interactive Telegram Bot Simulator'}
              {activeTab === 'code' && 'Production Python Source Code & Package'}
              {activeTab === 'android' && 'Android Smartphone Setup via Termux'}
              {activeTab === 'cloud' && 'Free 24/7 Cloud Hosting Solutions'}
              {activeTab === 'botfather' && 'BotFather Setup & Security Standards'}
            </h1>
          </div>

          {/* Direct App Link */}
          <div className="flex items-center gap-3">
            <a
              href={botConfig.appDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 hover:border-sky-500/40 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shrink-0"
            >
              <span>Download ChatMate App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Tab Content Components */}
        {activeTab === 'simulator' && <TelegramSimulator config={botConfig} />}
        {activeTab === 'code' && <CodeViewer config={botConfig} onUpdateConfig={setBotConfig} />}
        {activeTab === 'android' && <AndroidGuide config={botConfig} />}
        {activeTab === 'cloud' && <CloudHostingGuide config={botConfig} />}
        {activeTab === 'botfather' && <BotFatherGuide config={botConfig} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">ChatMate Telegram Bot</span>
            <span>·</span>
            <span>Only TELEGRAM_BOT_TOKEN Required</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('simulator')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Simulator
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              bot.py Code
            </button>
            <button
              onClick={() => setActiveTab('android')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Android Termux
            </button>
            <button
              onClick={() => setActiveTab('cloud')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Free Cloud Deploy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
