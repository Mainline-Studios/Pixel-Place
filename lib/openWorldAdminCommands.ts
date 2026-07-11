'use client';

import { banUser, unbanUser } from '@/lib/storage';
import {
  clearOpenWorldChat,
  isOpenWorldAdmin,
  kickOpenWorldPlayer,
  sendOpenWorldChat,
  type OpenWorldChatChannel,
} from '@/lib/openWorldRtdb';

export type AdminCommandResult = {
  /** Local-only feedback lines in the chat panel */
  lines: string[];
  /** True if the input was handled as a command (do not send as normal chat) */
  handled: boolean;
};

const HELP_LINES = [
  'Admin commands:',
  '/help — show this list',
  '/clearchat — clear this chat channel',
  '/kick <user> [reason] — remove from this server (~10 min)',
  '/ban <user> [reason] — site ban + kick from server',
  '/unban <user> — lift a site ban',
  '/announce <message> — post a system message here',
];

function parseArgs(raw: string): { cmd: string; args: string[] } {
  const parts = raw.trim().split(/\s+/);
  const cmd = (parts[0] || '').toLowerCase();
  return { cmd, args: parts.slice(1) };
}

/**
 * Run Open World slash commands. Non-admins cannot use admin commands.
 * Returns handled=true for any leading `/` so slash text never goes to public chat.
 */
export async function runOpenWorldAdminCommand(opts: {
  raw: string;
  role?: string;
  actorUsername: string;
  room: string;
  channel: OpenWorldChatChannel;
}): Promise<AdminCommandResult> {
  const text = opts.raw.trim();
  if (!text.startsWith('/')) {
    return { handled: false, lines: [] };
  }

  const admin = isOpenWorldAdmin(opts.role);
  const { cmd, args } = parseArgs(text);

  if (!admin) {
    return {
      handled: true,
      lines: ['Only admins can use / commands.'],
    };
  }

  switch (cmd) {
    case '/help':
    case '/commands':
      return { handled: true, lines: HELP_LINES };

    case '/clearchat':
    case '/clear': {
      await clearOpenWorldChat(opts.room, opts.channel);
      await sendOpenWorldChat(
        'System',
        `Chat cleared by ${opts.actorUsername}.`,
        opts.room,
        opts.channel,
      );
      return { handled: true, lines: [`Cleared ${opts.channel === 'everywhere' ? 'Everywhere' : 'Server'} chat.`] };
    }

    case '/kick': {
      const target = args[0];
      if (!target) return { handled: true, lines: ['Usage: /kick <username> [reason]'] };
      if (target.toLowerCase() === opts.actorUsername.toLowerCase()) {
        return { handled: true, lines: ['You cannot kick yourself.'] };
      }
      const reason = args.slice(1).join(' ').trim();
      await kickOpenWorldPlayer(opts.room, target, opts.actorUsername, reason);
      await sendOpenWorldChat(
        'System',
        `${opts.actorUsername} kicked ${target}${reason ? ` (${reason})` : ''}.`,
        opts.room,
        opts.channel === 'everywhere' ? 'server' : opts.channel,
      );
      return { handled: true, lines: [`Kicked ${target} from this server.`] };
    }

    case '/ban': {
      const target = args[0];
      if (!target) return { handled: true, lines: ['Usage: /ban <username> [reason]'] };
      if (target.toLowerCase() === opts.actorUsername.toLowerCase()) {
        return { handled: true, lines: ['You cannot ban yourself.'] };
      }
      const reason = args.slice(1).join(' ').trim() || 'Banned from Open World';
      const canBanAdmins = opts.role === 'head_admin';
      const ok = await banUser(target, opts.actorUsername, reason, true, undefined, canBanAdmins);
      if (!ok) {
        return {
          handled: true,
          lines: [
            canBanAdmins
              ? `Could not ban ${target}.`
              : `Could not ban ${target} (admins can only be banned by head admins).`,
          ],
        };
      }
      await kickOpenWorldPlayer(opts.room, target, opts.actorUsername, reason);
      await sendOpenWorldChat(
        'System',
        `${opts.actorUsername} banned ${target}.`,
        opts.room,
        'server',
      );
      return { handled: true, lines: [`Banned ${target}.`] };
    }

    case '/unban': {
      const target = args[0];
      if (!target) return { handled: true, lines: ['Usage: /unban <username>'] };
      await unbanUser(target);
      return { handled: true, lines: [`Unbanned ${target}.`] };
    }

    case '/announce':
    case '/say': {
      const message = args.join(' ').trim();
      if (!message) return { handled: true, lines: ['Usage: /announce <message>'] };
      await sendOpenWorldChat(
        'System',
        `[Admin ${opts.actorUsername}] ${message}`.slice(0, 200),
        opts.room,
        opts.channel,
      );
      return { handled: true, lines: ['Announcement sent.'] };
    }

    default:
      return {
        handled: true,
        lines: [`Unknown command "${cmd}". Type /help for admin commands.`],
      };
  }
}
