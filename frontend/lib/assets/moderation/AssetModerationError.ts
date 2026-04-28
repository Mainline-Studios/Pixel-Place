export class AssetModerationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'login_required'
      | 'scan_rejected'
      | 'scan_failed'
      | 'filename_blocked'
      | 'moderation_unavailable',
    public readonly details?: string | null
  ) {
    super(message);
    this.name = 'AssetModerationError';
  }
}
