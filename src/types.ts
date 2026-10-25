export interface TelegramMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  keyboard?: InlineButton[][];
  meta?: {
    handlerType: 'CommandHandler' | 'CallbackQueryHandler' | 'MessageHandler';
    commandOrQuery?: string;
    processingTimeMs?: number;
  };
}

export interface InlineButton {
  text: string;
  callbackData?: string;
  url?: string;
}

export interface BotConfig {
  appName: string;
  appDownloadUrl: string;
  envVarName: string;
}
