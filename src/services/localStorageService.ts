export interface Project {
  id: string;
  user_id: string;
  title: string;
  type: 'marketing' | 'brand';
  status: 'draft' | 'completed' | 'archived';
  data: any;
  created_at: string;
  updated_at: string;
}

export interface MarketingCampaign {
  id: string;
  project_id: string;
  campaign_type: string;
  target_audience: string;
  tone: string;
  prompt: string;
  generated_content: any;
  created_at: string;
  updated_at: string;
}

export interface BrandKit {
  id: string;
  project_id: string;
  industry: string;
  style: string;
  values: string;
  prompt: string;
  brand_data: any;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithDetails extends Project {
  marketing_campaign?: MarketingCampaign;
  brand_kit?: BrandKit;
}

export interface ProjectMarketingData {
  type: string;
  tone: string;
  prompt: string;
  content?: any;
}

export interface ProjectBrandData {
  industry: string;
  style: string;
  values: string;
  prompt: string;
  brandKit?: any;
}

class LocalStorageService {
  private readonly PROJECTS_KEY = 'adgen_projects';
  private readonly MARKETING_CAMPAIGNS_KEY = 'adgen_marketing_campaigns';
  private readonly BRAND_KITS_KEY = 'adgen_brand_kits';
  private readonly USER_ID = 'local_user'; // Single user for local storage

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get data from localStorage
   */
  private getFromStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return [];
    }
  }

  /**
   * Save data to localStorage
   */
  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage key ${key}:`, error);
    }
  }

  /**
   * Save a marketing campaign project
   */
  async saveMarketingProject(data: {
    title: string;
    campaignData: ProjectMarketingData;
  }): Promise<{ project?: Project; error?: string }> {
    try {
      const projectId = this.generateId();
      const now = new Date().toISOString();

      // Create the main project
      const project: Project = {
        id: projectId,
        user_id: this.USER_ID,
        title: data.title,
        type: 'marketing',
        status: 'completed',
        data: data.campaignData,
        created_at: now,
        updated_at: now
      };

      // Save project
      const projects = this.getFromStorage<Project>(this.PROJECTS_KEY);
      projects.push(project);
      this.saveToStorage(this.PROJECTS_KEY, projects);

      // Create marketing campaign details
      const marketingCampaign: MarketingCampaign = {
        id: this.generateId(),
        project_id: projectId,
        campaign_type: data.campaignData.type,
        target_audience: 'General', // Default since we removed target audience step
        tone: data.campaignData.tone,
        prompt: data.campaignData.prompt,
        generated_content: data.campaignData.content,
        created_at: now,
        updated_at: now
      };

      // Save marketing campaign
      const campaigns = this.getFromStorage<MarketingCampaign>(this.MARKETING_CAMPAIGNS_KEY);
      campaigns.push(marketingCampaign);
      this.saveToStorage(this.MARKETING_CAMPAIGNS_KEY, campaigns);

      return { project };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to save marketing project'
      };
    }
  }

  /**
   * Save a brand identity project
   */
  async saveBrandProject(data: {
    title: string;
    brandData: ProjectBrandData;
  }): Promise<{ project?: Project; error?: string }> {
    try {
      const projectId = this.generateId();
      const now = new Date().toISOString();

      // Create the main project
      const project: Project = {
        id: projectId,
        user_id: this.USER_ID,
        title: data.title,
        type: 'brand',
        status: 'completed',
        data: data.brandData,
        created_at: now,
        updated_at: now
      };

      // Save project
      const projects = this.getFromStorage<Project>(this.PROJECTS_KEY);
      projects.push(project);
      this.saveToStorage(this.PROJECTS_KEY, projects);

      // Create brand kit details
      const brandKit: BrandKit = {
        id: this.generateId(),
        project_id: projectId,
        industry: data.brandData.industry,
        style: data.brandData.style,
        values: data.brandData.values,
        prompt: data.brandData.prompt,
        brand_data: data.brandData.brandKit,
        created_at: now,
        updated_at: now
      };

      // Save brand kit
      const brandKits = this.getFromStorage<BrandKit>(this.BRAND_KITS_KEY);
      brandKits.push(brandKit);
      this.saveToStorage(this.BRAND_KITS_KEY, brandKits);

      return { project };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to save brand project'
      };
    }
  }

  /**
   * Get all projects for the current user
   */
  async getUserProjects(): Promise<{ projects?: ProjectWithDetails[]; error?: string }> {
    try {
      const projects = this.getFromStorage<Project>(this.PROJECTS_KEY);
      const marketingCampaigns = this.getFromStorage<MarketingCampaign>(this.MARKETING_CAMPAIGNS_KEY);
      const brandKits = this.getFromStorage<BrandKit>(this.BRAND_KITS_KEY);

      // Transform the data to match our interface
      const transformedProjects: ProjectWithDetails[] = projects
        .filter(project => project.user_id === this.USER_ID)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(project => ({
          ...project,
          marketing_campaign: marketingCampaigns.find(mc => mc.project_id === project.id),
          brand_kit: brandKits.find(bk => bk.project_id === project.id)
        }));

      return { projects: transformedProjects };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to load projects'
      };
    }
  }

  /**
   * Get a specific project by ID
   */
  async getProject(projectId: string): Promise<{ project?: ProjectWithDetails; error?: string }> {
    try {
      const projects = this.getFromStorage<Project>(this.PROJECTS_KEY);
      const marketingCampaigns = this.getFromStorage<MarketingCampaign>(this.MARKETING_CAMPAIGNS_KEY);
      const brandKits = this.getFromStorage<BrandKit>(this.BRAND_KITS_KEY);

      const project = projects.find(p => p.id === projectId && p.user_id === this.USER_ID);

      if (!project) {
        return { error: 'Project not found' };
      }

      // Transform the data
      const transformedProject: ProjectWithDetails = {
        ...project,
        marketing_campaign: marketingCampaigns.find(mc => mc.project_id === projectId),
        brand_kit: brandKits.find(bk => bk.project_id === projectId)
      };

      return { project: transformedProject };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to load project'
      };
    }
  }

  /**
   * Update project status
   */
  async updateProjectStatus(
    projectId: string,
    status: 'draft' | 'completed' | 'archived'
  ): Promise<{ success?: boolean; error?: string }> {
    try {
      const projects = this.getFromStorage<Project>(this.PROJECTS_KEY);
      const projectIndex = projects.findIndex(p => p.id === projectId && p.user_id === this.USER_ID);

      if (projectIndex === -1) {
        return { error: 'Project not found' };
      }

      projects[projectIndex].status = status;
      projects[projectIndex].updated_at = new Date().toISOString();

      this.saveToStorage(this.PROJECTS_KEY, projects);

      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to update project status'
      };
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<{ success?: boolean; error?: string }> {
    try {
      // Delete project
      const projects = this.getFromStorage<Project>(this.PROJECTS_KEY);
      const filteredProjects = projects.filter(p => !(p.id === projectId && p.user_id === this.USER_ID));
      this.saveToStorage(this.PROJECTS_KEY, filteredProjects);

      // Delete associated marketing campaigns
      const marketingCampaigns = this.getFromStorage<MarketingCampaign>(this.MARKETING_CAMPAIGNS_KEY);
      const filteredCampaigns = marketingCampaigns.filter(mc => mc.project_id !== projectId);
      this.saveToStorage(this.MARKETING_CAMPAIGNS_KEY, filteredCampaigns);

      // Delete associated brand kits
      const brandKits = this.getFromStorage<BrandKit>(this.BRAND_KITS_KEY);
      const filteredBrandKits = brandKits.filter(bk => bk.project_id !== projectId);
      this.saveToStorage(this.BRAND_KITS_KEY, filteredBrandKits);

      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to delete project'
      };
    }
  }

  /**
   * Generate a project title from campaign data
   */
  generateProjectTitle(type: 'marketing' | 'brand', data: any): string {
    const timestamp = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    if (type === 'marketing') {
      const campaignType = data.type || 'Campaign';
      return `${campaignType.replace('-', ' ')} Campaign - ${timestamp}`;
    } else {
      const industry = data.industry || 'Business';
      const style = data.style || 'Brand';
      return `${industry} ${style} Brand - ${timestamp}`;
    }
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
    try {
      const projects = this.getFromStorage<Project>(this.PROJECTS_KEY);
      const userProjects = projects.filter(p => p.user_id === this.USER_ID);

      const total = userProjects.length;
      const marketing = userProjects.filter(p => p.type === 'marketing').length;
      const brand = userProjects.filter(p => p.type === 'brand').length;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonth = userProjects.filter(p => {
        const projectDate = new Date(p.created_at);
        return projectDate.getMonth() === currentMonth &&
          projectDate.getFullYear() === currentYear;
      }).length;

      return {
        stats: { total, marketing, brand, thisMonth }
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to load project stats'
      };
    }
  }

  /**
   * Clear all data (for testing/development)
   */
  clearAllData(): void {
    localStorage.removeItem(this.PROJECTS_KEY);
    localStorage.removeItem(this.MARKETING_CAMPAIGNS_KEY);
    localStorage.removeItem(this.BRAND_KITS_KEY);
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();
export default localStorageService;

// Export types for use in other modules
export type { Project, MarketingCampaign, BrandKit, ProjectWithDetails, ProjectMarketingData, ProjectBrandData };
