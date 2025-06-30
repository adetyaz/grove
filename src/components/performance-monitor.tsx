"use client";
import { useEffect } from "react";

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only monitor performance in development
    if (process.env.NODE_ENV !== "development") return;

    // Monitor memory usage
    const checkMemoryUsage = () => {
      if ("memory" in performance) {
        const memInfo = (performance as any).memory;
        const memUsage = {
          used: Math.round(memInfo.usedJSHeapSize / 1048576), // MB
          total: Math.round(memInfo.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memInfo.jsHeapSizeLimit / 1048576), // MB
        };

        // Only log if memory usage is high
        if (memUsage.used > 50) {
          console.log("🔍 Memory Usage:", memUsage);
        }
      }
    };

    // Check memory every 30 seconds
    const memoryInterval = setInterval(checkMemoryUsage, 30000);

    // Monitor slow renders
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 16) {
          // > 16ms = might cause frame drops
          console.warn("⚠️ Slow render detected:", {
            duration: `${entry.duration.toFixed(2)}ms`,
            name: entry.name,
          });
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["measure"] });
    } catch {
      // Performance Observer not supported
    }

    // Monitor network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;

        if (duration > 1000) {
          // > 1 second
          console.warn("🐌 Slow network request:", {
            url: args[0],
            duration: `${duration.toFixed(2)}ms`,
          });
        }

        return response;
      } catch (error) {
        console.error("❌ Network error:", args[0], error);
        throw error;
      }
    };

    return () => {
      clearInterval(memoryInterval);
      observer.disconnect();
      window.fetch = originalFetch; // Restore original fetch
    };
  }, []);

  return null; // This component doesn't render anything
}
