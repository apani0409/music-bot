/**
 * Health Monitor - Track bot health and performance
 */

export class HealthMonitor {
  private startTime: number;
  private errorCount: number;
  private lastError: Error | null;
  private memoryChecks: number[];

  constructor() {
    this.startTime = Date.now();
    this.errorCount = 0;
    this.lastError = null;
    this.memoryChecks = [];
    this.startMonitoring();
  }

  /**
   * Record an error
   */
  public recordError(error: Error): void {
    this.errorCount++;
    this.lastError = error;
  }

  /**
   * Get uptime in seconds
   */
  public getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): { count: number; lastError: string | null } {
    return {
      count: this.errorCount,
      lastError: this.lastError?.message || null,
    };
  }

  /**
   * Get memory usage
   */
  public getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  /**
   * Get formatted health status
   */
  public getHealthStatus(): string {
    const uptime = this.getUptime();
    const memory = this.getMemoryUsage();
    const memoryMB = Math.round(memory.heapUsed / 1024 / 1024);
    
    return `Uptime: ${uptime}s | Memory: ${memoryMB}MB | Errors: ${this.errorCount}`;
  }

  /**
   * Start periodic memory monitoring
   */
  private startMonitoring(): void {
    setInterval(() => {
      const memory = this.getMemoryUsage();
      const heapUsedMB = memory.heapUsed / 1024 / 1024;
      
      // Keep last 10 memory checks
      this.memoryChecks.push(heapUsedMB);
      if (this.memoryChecks.length > 10) {
        this.memoryChecks.shift();
      }

      // Warn if memory usage is high
      if (heapUsedMB > 450) {
        console.warn(`[Health Monitor] High memory usage: ${Math.round(heapUsedMB)}MB`);
      }
    }, 60000); // Check every minute
  }

  /**
   * Force garbage collection (if enabled with --expose-gc)
   */
  public forceGC(): void {
    if (global.gc) {
      global.gc();
      console.log('[Health Monitor] Garbage collection triggered');
    }
  }
}

export const healthMonitor = new HealthMonitor();
