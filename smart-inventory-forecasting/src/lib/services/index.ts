// Export all services
export { DataCleanupService } from './data-cleanup-service';
export { ForecastingService } from './forecasting-service';
export { ForecastingIntegrationService } from './forecasting-integration-service';
export { AIAgentService } from './ai-agent-service';

// Service instances for easy import
import { DataCleanupService } from './data-cleanup-service';
import { AIAgentService } from './ai-agent-service';

export const dataCleanupService = new DataCleanupService();
export const aiAgentService = new AIAgentService();