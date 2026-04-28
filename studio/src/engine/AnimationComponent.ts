/**
 * Playback settings for GLTF clips attached to a {@link GameObject}.
 * The engine owns {@link AnimationMixer} instances keyed by object id.
 */
export class AnimationComponent {
  /** Name of the clip to play (first clip if empty). */
  clipName: string | null = null;
  enabled = true;
  loop = true;
  /** Cross-fade duration in seconds when switching clips. */
  blendDuration = 0.35;
  /** Internal: clip we are fading to (engine-managed). */
  pendingClip: string | null = null;
}
