/**
 * WebGL Renderer - Core rendering system
 * Handles WebGL context, shaders, and drawing
 */

export class Renderer {
  private gl: WebGLRenderingContext;
  private canvas: HTMLCanvasElement;
  private width: number = 800;
  private height: number = 600;
  
  // Shader programs
  private shaderProgram: WebGLProgram | null = null;
  
  // Vertex data buffers
  private positionBuffer: WebGLBuffer | null = null;
  private colorBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;

  constructor(container: HTMLElement) {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    container.appendChild(this.canvas);
    
    // Get WebGL context
    const gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!gl) {
      throw new Error('WebGL not supported');
    }
    this.gl = gl as WebGLRenderingContext;
    
    // Set up viewport
    this.resize();
    
    // Initialize shaders
    this.initShaders();
    
    // Set up buffers
    this.initBuffers();
    
    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.gl.viewport(0, 0, this.width, this.height);
  }

  private initShaders() {
    const gl = this.gl;
    
    // Vertex shader source
    const vertexShaderSource = `
      attribute vec3 aPosition;
      attribute vec3 aColor;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      varying vec3 vColor;
      
      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
        vColor = aColor;
      }
    `;
    
    // Fragment shader source
    const fragmentShaderSource = `
      precision mediump float;
      varying vec3 vColor;
      
      void main() {
        gl_FragColor = vec4(vColor, 1.0);
      }
    `;
    
    // Create and compile vertex shader
    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
    if (!vertexShader) throw new Error('Failed to create vertex shader');
    
    // Create and compile fragment shader
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!fragmentShader) throw new Error('Failed to create fragment shader');
    
    // Create shader program
    const program = gl.createProgram();
    if (!program) throw new Error('Failed to create shader program');
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error('Failed to link shader program: ' + info);
    }
    
    this.shaderProgram = program;
  }

  private createShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      console.error('Shader compilation error:', info);
      return null;
    }
    
    return shader;
  }

  private initBuffers() {
    const gl = this.gl;
    
    // Position buffer (will be updated per frame)
    this.positionBuffer = gl.createBuffer();
    
    // Color buffer (will be updated per frame)
    this.colorBuffer = gl.createBuffer();
    
    // Index buffer (will be updated per frame)
    this.indexBuffer = gl.createBuffer();
  }

  /**
   * Clear the canvas
   */
  clear(r: number = 0.2, g: number = 0.2, b: number = 0.3, a: number = 1.0) {
    const gl = this.gl;
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  /**
   * Render meshes
   */
  render(vertices: Float32Array, colors: Float32Array, indices: Uint16Array, modelViewMatrix: Float32Array, projectionMatrix: Float32Array) {
    const gl = this.gl;
    if (!this.shaderProgram) return;
    
    gl.useProgram(this.shaderProgram);
    
    // Set up position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(this.shaderProgram, 'aPosition');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    
    // Set up color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
    
    const colorLocation = gl.getAttribLocation(this.shaderProgram, 'aColor');
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
    
    // Set up index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.DYNAMIC_DRAW);
    
    // Set matrices
    const modelViewLocation = gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix');
    gl.uniformMatrix4fv(modelViewLocation, false, modelViewMatrix);
    
    const projectionLocation = gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix');
    gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
    
    // Draw
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get WebGL context
   */
  getGL(): WebGLRenderingContext {
    return this.gl;
  }

  /**
   * Get viewport dimensions
   */
  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  /**
   * Cleanup
   */
  destroy() {
    const gl = this.gl;
    
    if (this.positionBuffer) gl.deleteBuffer(this.positionBuffer);
    if (this.colorBuffer) gl.deleteBuffer(this.colorBuffer);
    if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer);
    if (this.shaderProgram) gl.deleteProgram(this.shaderProgram);
    
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}








