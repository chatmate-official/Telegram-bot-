import React, { useState } from 'react';
import { BotConfig } from '../types';
import {
  generateBotPy,
  generateRequirementsTxt,
  generateEnvExample,
  generateProcfile,
  generateReadme,
  downloadProjectZip,
} from '../utils/zipExport';
import {
  Copy,
  Check,
  Download,
  FileCode,
  Sliders,
  Archive,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  config: BotConfig;
  onUpdateConfig: (newConfig: BotConfig) => void;
}

export const CodeViewer: React.FC<Props> = ({ config, onUpdateConfig }) => {
  const [activeFile, setActiveFile] = useState<'bot.py' | 'requirements.txt' | '.env.example' | 'Procfile' | 'README.md'>('bot.py');
  const [copied, setCopied] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  const getFileContent = (fileName: string): string => {
    switch (fileName) {
      case 'bot.py':
        return generateBotPy(config);
      case 'requirements.txt':
        return generateRequirementsTxt();
      case '.env.example':
        return generateEnvExample(config);
      case 'Procfile':
        return generateProcfile();
      case 'README.md':
        return generateReadme(config);
      default:
        return '';
    }
  };

  const currentContent = getFileContent(activeFile);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Customizer Toggle */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <FileCode className="w-5 h-5 text-sky-400" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100">Production Source Code Suite</h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/50">
                Single Token Mode (No Admin ID)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Only TELEGRAM_BOT_TOKEN required · Functional About, Download, and Help buttons
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showConfigDrawer
                ? 'bg-sky-950 text-sky-300 border-sky-800'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Settings</span>
          </button>

          <button
            onClick={() => downloadProjectZip(config)}
            className="px-3.5 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm ml-auto md:ml-0 cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Download All (.ZIP)</span>
          </button>
        </div>
      </div>

      {/* Configuration Drawer */}
      {showConfigDrawer && (
        <div className="bg-slate-900 border border-sky-900/40 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Configuration Parameters
              </h4>
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>No Admin IDs Needed</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">App Name</label>
              <input
                type="text"
                value={config.appName}
                onChange={(e) => onUpdateConfig({ ...config, appName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">App Download URL</label>
              <input
                type="text"
                value={config.appDownloadUrl}
                onChange={(e) => onUpdateConfig({ ...config, appDownloadUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Required Token Env Variable</label>
              <input
                type="text"
                value={config.envVarName}
                onChange={(e) => onUpdateConfig({ ...config, envVarName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* File Navigation & Code Viewer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* File Tabs */}
        <div className="bg-slate-950 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {(['bot.py', 'requirements.txt', '.env.example', 'Procfile', 'README.md'] as const).map((file) => (
              <button
                key={file}
                onClick={() => setActiveFile(file)}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeFile === file
                    ? 'bg-slate-800 text-sky-300 font-semibold border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 opacity-70" />
                <span>{file}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadSingle}
              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[620px] leading-relaxed selection:bg-sky-500/30">
          <pre className="whitespace-pre">
            {currentContent.split('\n').map((line, index) => (
              <div key={index} className="table-row">
                <span className="table-cell pr-4 text-right select-none text-slate-600 font-mono text-[11px] tabular-nums">
                  {index + 1}
                </span>
                <span className="table-cell whitespace-pre">{line}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};
