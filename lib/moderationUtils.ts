/**
 * Utility functions for moderation system
 */

/**
 * Get color for severity level
 */
export function getSeverityColor(severity: 'high' | 'medium' | 'low' | string | null): string {
  switch (severity) {
    case 'high': return '#ff4444';
    case 'medium': return '#ff9800';
    case 'low': return '#ffeb3b';
    default: return '#999';
  }
}

/**
 * Get label for severity level
 */
export function getSeverityLabel(severity: 'high' | 'medium' | 'low' | string | null): string {
  switch (severity) {
    case 'high': return 'High Severity';
    case 'medium': return 'Medium Severity';
    case 'low': return 'Low Severity';
    default: return 'Unknown';
  }
}

/**
 * Get color for score
 */
export function getScoreColor(score: number): string {
  if (score >= 0.9) return '#ff4444';
  if (score >= 0.8) return '#ff9800';
  if (score >= 0.7) return '#ffeb3b';
  return '#4caf50';
}

/**
 * Get label for score
 */
export function getScoreLabel(score: number): string {
  if (score >= 0.9) return 'High Risk - Definitely Inappropriate';
  if (score >= 0.8) return 'Medium Risk - Likely Inappropriate';
  if (score >= 0.7) return 'Low Risk - Possibly Inappropriate';
  return 'Safe - Allowed';
}
