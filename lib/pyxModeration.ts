/**
 * Pyx AI Content Moderation System - TypeScript Implementation
 * 
 * This is a neural network-based content moderation system that learns from examples.
 * It scores text content from 0.0 (safe) to 1.0 (inappropriate).
 * 
 * Based on the Pyx AI system architecture with:
 * - PyxBrain: Neural network engine
 * - PyxMemory: Content storage and filtering
 * - PyxModeration: Main interface
 */

import { MODERATION_CONFIG } from './moderationConfig';
import { INITIAL_TRAINING } from './initialTrainingData';
import { getFirestoreInstance, COLLECTIONS } from './firestore';

/**
 * Simple neural network brain for text classification
 */
export class PyxBrain {
  private weightsW1: number[][];  // Input to hidden weights
  private weightsW2: number[][];  // Hidden to output weights
  private biasesB1: number[];     // Hidden layer biases
  private biasesB2: number[];     // Output layer biases
  private learningRate: number;
  
  constructor(
    inputSize: number = MODERATION_CONFIG.NEURAL_NET_CONFIG.INPUT_SIZE,
    hiddenSize: number = MODERATION_CONFIG.NEURAL_NET_CONFIG.HIDDEN_SIZE,
    outputSize: number = MODERATION_CONFIG.NEURAL_NET_CONFIG.OUTPUT_SIZE,
    learningRate: number = MODERATION_CONFIG.NEURAL_NET_CONFIG.LEARNING_RATE
  ) {
    this.learningRate = learningRate;
    
    // Initialize weights with small random values (-0.5 to 0.5)
    this.weightsW1 = this.initializeWeights(inputSize, hiddenSize);
    this.weightsW2 = this.initializeWeights(hiddenSize, outputSize);
    this.biasesB1 = new Array(hiddenSize).fill(0).map(() => Math.random() - 0.5);
    this.biasesB2 = new Array(outputSize).fill(0).map(() => Math.random() - 0.5);
  }
  
  /**
   * Initialize weight matrix with random values
   */
  private initializeWeights(rows: number, cols: number): number[][] {
    const weights: number[][] = [];
    for (let i = 0; i < rows; i++) {
      weights[i] = [];
      for (let j = 0; j < cols; j++) {
        weights[i][j] = Math.random() - 0.5;
      }
    }
    return weights;
  }
  
  /**
   * Sigmoid activation function
   */
  sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }
  
  /**
   * Sigmoid derivative for backpropagation
   */
  private sigmoidDerivative(x: number): number {
    return x * (1 - x);
  }
  
  /**
   * Encode text into a fixed-size numerical vector using hash-based encoding
   */
  encode(text: string, size: number): number[] {
    const vector = new Array(size).fill(0);
    const normalized = text.toLowerCase().trim();
    
    // Character-level encoding
    for (let i = 0; i < normalized.length; i++) {
      const charCode = normalized.charCodeAt(i);
      const index = charCode % size;
      vector[index] += 1;
    }
    
    // Word-level encoding
    const words = normalized.split(/\s+/);
    for (const word of words) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash) + word.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
      }
      const index = Math.abs(hash) % size;
      vector[index] += 2;
    }
    
    // Normalize vector (scale to 0-1 range)
    const maxVal = Math.max(...vector, 1);
    return vector.map(v => v / maxVal);
  }
  
  /**
   * Forward pass through the network
   */
  forward(inputs: number[]): { hidden: number[], output: number[] } {
    // Input to hidden layer
    const hidden = new Array(this.biasesB1.length);
    for (let i = 0; i < hidden.length; i++) {
      let sum = this.biasesB1[i];
      for (let j = 0; j < inputs.length; j++) {
        sum += inputs[j] * this.weightsW1[j][i];
      }
      hidden[i] = this.sigmoid(sum);
    }
    
    // Hidden to output layer
    const output = new Array(this.biasesB2.length);
    for (let i = 0; i < output.length; i++) {
      let sum = this.biasesB2[i];
      for (let j = 0; j < hidden.length; j++) {
        sum += hidden[j] * this.weightsW2[j][i];
      }
      output[i] = this.sigmoid(sum);
    }
    
    return { hidden, output };
  }
  
  /**
   * Train the network on a single example (one training step)
   * Returns the loss for this training step
   */
  trainStep(inputs: number[], targets: number[]): number {
    // Forward pass
    const { hidden, output } = this.forward(inputs);
    
    // Calculate loss (mean squared error)
    let loss = 0;
    for (let i = 0; i < output.length; i++) {
      const error = targets[i] - output[i];
      loss += error * error;
    }
    loss /= output.length;
    
    // Backpropagation
    // Output layer error
    const outputErrors = new Array(output.length);
    for (let i = 0; i < output.length; i++) {
      outputErrors[i] = (targets[i] - output[i]) * this.sigmoidDerivative(output[i]);
    }
    
    // Hidden layer error
    const hiddenErrors = new Array(hidden.length).fill(0);
    for (let i = 0; i < hidden.length; i++) {
      let error = 0;
      for (let j = 0; j < output.length; j++) {
        error += outputErrors[j] * this.weightsW2[i][j];
      }
      hiddenErrors[i] = error * this.sigmoidDerivative(hidden[i]);
    }
    
    // Update weights and biases (hidden to output)
    for (let i = 0; i < hidden.length; i++) {
      for (let j = 0; j < output.length; j++) {
        this.weightsW2[i][j] += this.learningRate * outputErrors[j] * hidden[i];
      }
    }
    for (let i = 0; i < output.length; i++) {
      this.biasesB2[i] += this.learningRate * outputErrors[i];
    }
    
    // Update weights and biases (input to hidden)
    for (let i = 0; i < inputs.length; i++) {
      for (let j = 0; j < hidden.length; j++) {
        this.weightsW1[i][j] += this.learningRate * hiddenErrors[j] * inputs[i];
      }
    }
    for (let i = 0; i < hidden.length; i++) {
      this.biasesB1[i] += this.learningRate * hiddenErrors[i];
    }
    
    return loss;
  }
  
  /**
   * Predict output for given inputs
   */
  predict(inputs: number[]): number[] {
    return this.forward(inputs).output;
  }
  
  /**
   * Export model weights for storage
   */
  exportWeights() {
    return {
      weightsW1: this.weightsW1,
      weightsW2: this.weightsW2,
      biasesB1: this.biasesB1,
      biasesB2: this.biasesB2,
      learningRate: this.learningRate
    };
  }
  
  /**
   * Import model weights from storage
   */
  importWeights(weights: {
    weightsW1: number[][],
    weightsW2: number[][],
    biasesB1: number[],
    biasesB2: number[],
    learningRate: number
  }) {
    this.weightsW1 = weights.weightsW1;
    this.weightsW2 = weights.weightsW2;
    this.biasesB1 = weights.biasesB1;
    this.biasesB2 = weights.biasesB2;
    this.learningRate = weights.learningRate;
  }
}

/**
 * Memory storage for content with ban threshold filtering
 */
export class PyxMemory {
  private banThreshold: number;
  private storage: Map<string, Map<string, number>>; // category -> (text -> score)
  
  constructor(banThreshold: number = MODERATION_CONFIG.BAN_LINE) {
    this.banThreshold = banThreshold;
    this.storage = new Map();
  }
  
  /**
   * Check if a score indicates banned/inappropriate content
   */
  isBanned(score: number): boolean {
    return score >= this.banThreshold;
  }
  
  /**
   * Add content to memory with its score
   * Returns true if content is banned (score >= threshold)
   */
  add(category: string, text: string, score: number): boolean {
    if (!this.storage.has(category)) {
      this.storage.set(category, new Map());
    }
    this.storage.get(category)!.set(text, score);
    return this.isBanned(score);
  }
  
  /**
   * Get all allowed (safe) content in a category
   */
  getAllowed(category: string): Record<string, number> {
    const categoryData = this.storage.get(category);
    if (!categoryData) return {};
    
    const allowed: Record<string, number> = {};
    for (const [text, score] of categoryData.entries()) {
      if (!this.isBanned(score)) {
        allowed[text] = score;
      }
    }
    return allowed;
  }
  
  /**
   * Get all banned content in a category
   */
  getBanned(category: string): Record<string, number> {
    const categoryData = this.storage.get(category);
    if (!categoryData) return {};
    
    const banned: Record<string, number> = {};
    for (const [text, score] of categoryData.entries()) {
      if (this.isBanned(score)) {
        banned[text] = score;
      }
    }
    return banned;
  }
  
  /**
   * Remove content from memory
   */
  remove(category: string, text: string): void {
    const categoryData = this.storage.get(category);
    if (categoryData) {
      categoryData.delete(text);
    }
  }
  
  /**
   * Get all content in a category
   */
  getAll(category: string): Record<string, number> {
    const categoryData = this.storage.get(category);
    if (!categoryData) return {};
    
    const all: Record<string, number> = {};
    for (const [text, score] of categoryData.entries()) {
      all[text] = score;
    }
    return all;
  }
  
  /**
   * Export memory data
   */
  exportData() {
    const data: Record<string, Record<string, number>> = {};
    for (const [category, items] of this.storage.entries()) {
      data[category] = {};
      for (const [text, score] of items.entries()) {
        data[category][text] = score;
      }
    }
    return data;
  }
  
  /**
   * Import memory data
   */
  importData(data: Record<string, Record<string, number>>) {
    this.storage.clear();
    for (const [category, items] of Object.entries(data)) {
      const categoryMap = new Map<string, number>();
      for (const [text, score] of Object.entries(items)) {
        categoryMap.set(text, score);
      }
      this.storage.set(category, categoryMap);
    }
  }
}

/**
 * Main Pyx AI moderation interface
 * Singleton instance for performance
 */
export class PyxModeration {
  private brain: PyxBrain;
  private memory: PyxMemory;
  private initialized: boolean = false;
  private saveCounter: number = 0;
  
  constructor() {
    this.brain = new PyxBrain();
    this.memory = new PyxMemory();
  }
  
  /**
   * Initialize the system by loading training data and model from database
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Try to load existing model from database
      const modelLoaded = await this.loadModel();
      const trainingLoaded = await this.loadTrainingData();
      
      // If no existing model, train on initial data
      if (!modelLoaded || !trainingLoaded) {
        console.log('Pyx AI: No existing model found, training on initial data...');
        await this.trainInitialData();
        await this.save();
      }
      
      this.initialized = true;
      console.log('Pyx AI: Initialization complete');
    } catch (error) {
      console.error('Pyx AI: Initialization error:', error);
      // Train on initial data as fallback
      await this.trainInitialData();
      this.initialized = true;
    }
  }
  
  /**
   * Train on initial training data
   */
  private async trainInitialData(): Promise<void> {
    console.log('Pyx AI: Training on initial safe examples...');
    for (const text of INITIAL_TRAINING.safe) {
      await this.train(text, true, 'phrases', 3);
    }
    
    console.log('Pyx AI: Training on initial inappropriate examples...');
    for (const text of INITIAL_TRAINING.inappropriate) {
      await this.train(text, false, 'phrases', 3);
    }
  }
  
  /**
   * Score text content (returns 0.0-1.0, higher = more inappropriate)
   */
  score(text: string): number {
    if (!text || text.trim().length === 0) return 0;
    
    // Encode text
    const inputs = this.brain.encode(text, MODERATION_CONFIG.NEURAL_NET_CONFIG.INPUT_SIZE);
    
    // Get prediction
    const outputs = this.brain.predict(inputs);
    
    // Average output values as final score
    const score = outputs.reduce((sum, val) => sum + val, 0) / outputs.length;
    
    return Math.min(1, Math.max(0, score)); // Clamp to 0-1
  }
  
  /**
   * Train the AI on a text example
   * @param text The text to train on
   * @param safe True if safe/allowed, false if inappropriate/banned
   * @param category Category for memory storage (default: 'phrases')
   * @param epochs Number of training iterations (default: 5)
   * @returns Final score after training
   */
  async train(text: string, safe: boolean, category: string = 'phrases', epochs: number = 5): Promise<number> {
    if (!text || text.trim().length === 0) return 0;
    
    // Encode text
    const inputs = this.brain.encode(text, MODERATION_CONFIG.NEURAL_NET_CONFIG.INPUT_SIZE);
    
    // Set target (safe = low values, inappropriate = high values)
    const targetValue = safe ? 0.1 : 0.9;
    const targets = new Array(MODERATION_CONFIG.NEURAL_NET_CONFIG.OUTPUT_SIZE).fill(targetValue);
    
    // Train for multiple epochs
    let finalLoss = 0;
    for (let i = 0; i < epochs; i++) {
      finalLoss = this.brain.trainStep(inputs, targets);
    }
    
    // Get new score
    const newScore = this.score(text);
    
    // Store in memory
    this.memory.add(category, text, newScore);
    
    // Periodically save to database
    this.saveCounter++;
    if (this.saveCounter >= MODERATION_CONFIG.TRAINING.SAVE_INTERVAL) {
      await this.save();
      this.saveCounter = 0;
    }
    
    return newScore;
  }
  
  /**
   * Make a decision about text content
   * @returns Object with safe status and score
   */
  aiDecide(text: string, category: string = 'phrases'): { safe: boolean, score: number } {
    const score = this.score(text);
    const safe = !this.memory.isBanned(score);
    
    // Store decision in memory
    this.memory.add(category, text, score);
    
    return { safe, score };
  }
  
  /**
   * Manually label text as safe or inappropriate
   * @returns Status message
   */
  async setLabel(text: string, safe: boolean, category: string = 'phrases'): Promise<string> {
    await this.train(text, safe, category, MODERATION_CONFIG.TRAINING.DEFAULT_EPOCHS);
    const score = this.score(text);
    
    if (safe) {
      return `Labeled "${text}" as SAFE (score: ${score.toFixed(3)})`;
    } else {
      return `Labeled "${text}" as INAPPROPRIATE (score: ${score.toFixed(3)})`;
    }
  }
  
  /**
   * Load training data from database
   */
  async loadTrainingData(): Promise<boolean> {
    try {
      const db = getFirestoreInstance();
      if (!db) return false;
      
      const snapshot = await db.collection('pyx_training').get();
      if (snapshot.empty) return false;
      
      const memoryData: Record<string, Record<string, number>> = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.category && data.items) {
          memoryData[data.category] = data.items;
        }
      });
      
      this.memory.importData(memoryData);
      console.log('Pyx AI: Training data loaded from database');
      return true;
    } catch (error) {
      console.error('Pyx AI: Error loading training data:', error);
      return false;
    }
  }
  
  /**
   * Load model weights from database
   */
  async loadModel(): Promise<boolean> {
    try {
      const db = getFirestoreInstance();
      if (!db) return false;
      
      const doc = await db.collection('pyx_model').doc('current').get();
      if (!doc.exists) return false;
      
      const data = doc.data();
      if (data && data.weights_w1 && data.weights_w2) {
        this.brain.importWeights({
          weightsW1: data.weights_w1,
          weightsW2: data.weights_w2,
          biasesB1: data.biases_b1,
          biasesB2: data.biases_b2,
          learningRate: data.learning_rate || MODERATION_CONFIG.NEURAL_NET_CONFIG.LEARNING_RATE
        });
        console.log('Pyx AI: Model loaded from database');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Pyx AI: Error loading model:', error);
      return false;
    }
  }
  
  /**
   * Save model and training data to database
   */
  async save(): Promise<void> {
    try {
      const db = getFirestoreInstance();
      if (!db) {
        console.warn('Pyx AI: Database not available, skipping save');
        return;
      }
      
      // Save model weights
      const weights = this.brain.exportWeights();
      await db.collection('pyx_model').doc('current').set({
        weights_w1: weights.weightsW1,
        weights_w2: weights.weightsW2,
        biases_b1: weights.biasesB1,
        biases_b2: weights.biasesB2,
        learning_rate: weights.learningRate,
        ban_threshold: MODERATION_CONFIG.BAN_LINE,
        last_trained: Date.now()
      });
      
      // Save training data
      const memoryData = this.memory.exportData();
      for (const [category, items] of Object.entries(memoryData)) {
        await db.collection('pyx_training').doc(category).set({
          category,
          items,
          updated_at: Date.now()
        });
      }
      
      console.log('Pyx AI: Model and training data saved to database');
    } catch (error) {
      console.error('Pyx AI: Error saving to database:', error);
    }
  }
  
  /**
   * Get memory statistics
   */
  getStats(): {
    categories: string[];
    totalItems: number;
    safeItems: number;
    bannedItems: number;
  } {
    const data = this.memory.exportData();
    const categories = Object.keys(data);
    let totalItems = 0;
    let safeItems = 0;
    let bannedItems = 0;
    
    for (const category of categories) {
      const items = data[category];
      for (const [text, score] of Object.entries(items)) {
        totalItems++;
        if (this.memory.isBanned(score)) {
          bannedItems++;
        } else {
          safeItems++;
        }
      }
    }
    
    return { categories, totalItems, safeItems, bannedItems };
  }
}

// Singleton instance for performance (cached in memory)
let pyxInstance: PyxModeration | null = null;

/**
 * Get the singleton Pyx AI instance
 */
export async function getPyxInstance(): Promise<PyxModeration> {
  if (!pyxInstance) {
    pyxInstance = new PyxModeration();
    await pyxInstance.initialize();
  }
  return pyxInstance;
}
