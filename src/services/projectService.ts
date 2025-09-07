import localStorageService from './localStorageService';
import type {
  Project,
  MarketingCampaign,
  BrandKit,
  ProjectMarketingData,
  ProjectBrandData,
  ProjectWithDetails
} from './localStorageService';

export interface SaveProjectRequest {
  title: string;
  type: 'marketing' | 'brand';
  data: ProjectMarketingData | ProjectBrandData;
}

export { ProjectWithDetails, ProjectMarketingData, ProjectBrandData };

export class ProjectService {
  /**
   * Save a marketing campaign project
   */
  async saveMarketingProject(data: {
    title: string;
    campaignData: ProjectMarketingData;
  }): Promise<{ project?: Project; error?: string }> {
    return localStorageService.saveMarketingProject(data);
  }

  /**
   * Save a brand identity project
   */
  async saveBrandProject(data: {
    title: string;
    brandData: ProjectBrandData;
  }): Promise<{ project?: Project; error?: string }> {
    return localStorageService.saveBrandProject(data);
  }

  /**
   * Get all projects for the current user
   */
  async getUserProjects(): Promise<{ projects?: ProjectWithDetails[]; error?: string }> {
    return localStorageService.getUserProjects();
  }

  /**
   * Get a specific project by ID
   */
  async getProject(projectId: string): Promise<{ project?: ProjectWithDetails; error?: string }> {
    return localStorageService.getProject(projectId);
  }

  /**
   * Update project status
   */
  async updateProjectStatus(
    projectId: string, 
    status: 'draft' | 'completed' | 'archived'
  ): Promise<{ success?: boolean; error?: string }> {
    return localStorageService.updateProjectStatus(projectId, status);
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<{ success?: boolean; error?: string }> {
    return localStorageService.deleteProject(projectId);
  }

  /**
   * Generate a project title from campaign data
   */
  generateProjectTitle(type: 'marketing' | 'brand', data: any): string {
    return localStorageService.generateProjectTitle(type, data);
  }

  /**
   * Get project statistics
   */
  async getProjectStats(): Promise<{ 
    stats?: { 
      total: number; 
      marketing: number; 
      brand: number; 
      thisMonth: number; 
    }; 
    error?: string 
  }> {
    return localStorageService.getProjectStats();
  }
}

// Export singleton instance
export const projectService = new ProjectService();
export default projectService;
