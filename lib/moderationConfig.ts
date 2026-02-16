/**
 * Configuration for Pyx AI Content Moderation System
 */
export const MODERATION_CONFIG = {
  // Threshold for inappropriate content (scores >= this are banned)
  BAN_LINE: 0.7,
  
  // Number of warnings before auto-ban (within same month)
  WARNING_THRESHOLD_PER_MONTH: 2,
  
  // Severity level thresholds
  SEVERITY_THRESHOLDS: {
    HIGH: 0.9,
    MEDIUM: 0.8,
    LOW: 0.7
  },
  
  // Enable/disable moderation system
  ENABLE_MODERATION: true,
  
  // Usernames exempt from moderation (admins)
  EXEMPT_USERNAMES: ['admin', 'tictalk', 'idon\'tknow', '6767kid', 'billibob', 'daniello1', 'funboy', 'belloboy1', 'bob', 'mr.noob', 'bdawgsawesome1'],
  
  // Neural network configuration
  NEURAL_NET_CONFIG: {
    INPUT_SIZE: 64,   // Size of input vector (text encoding)
    HIDDEN_SIZE: 32,  // Size of hidden layer
    OUTPUT_SIZE: 8,   // Size of output layer
    LEARNING_RATE: 0.15
  },
  
  // Training configuration
  TRAINING: {
    DEFAULT_EPOCHS: 5,
    BATCH_SIZE: 1,
    SAVE_INTERVAL: 10 // Save model every N training examples
  }
} as const;
