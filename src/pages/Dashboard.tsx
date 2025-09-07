import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import projectService, { ProjectWithDetails } from '../services/projectService';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectDetailsModal } from '../components/ProjectDetailsModal';
import { 
  Sparkles, 
  ArrowRight,
  Plus,
  Folder,
  Calendar,
  Zap,
  Palette,
  Trash2,
  ExternalLink
} from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadProjects();
    loadStats();
  }, []);

  const loadProjects = async () => {
    try {
      const result = await projectService.getUserProjects();
      if (result.error) {
        setError(result.error);
      } else if (result.projects) {
        setProjects(result.projects);
      }
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await projectService.getProjectStats();
      if (result.stats) {
        setStats(result.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const handleViewDetails = (project: ProjectWithDetails) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };
  
  const handleDeleteProject = async (projectId: string) => {
    setConfirmDeleteId(projectId);
  };
  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    const result = await projectService.deleteProject(confirmDeleteId);
    if (result.success) {
      setProjects(prev => prev.filter(p => p.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      loadStats();
    } else if (result.error) {
      alert('Failed to delete project: ' + result.error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Layout showNavbar>
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-white/60">Overview of your projects and activity</p>
          </motion.div>

          {/* Stats */}
          {stats && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="card p-3 sm:p-4 lg:p-5 text-center bg-white dark:bg-black border-gray-200 dark:border-white/10">
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-white/60 mb-1">Marketing</div>
                  <div className="text-xl sm:text-2xl font-bold">{stats.marketing}</div>
                  <div className="text-xs text-gray-500 dark:text-white/60">Campaigns</div>
                </div>
                <div className="card p-3 sm:p-4 lg:p-5 text-center bg-white dark:bg-black border-gray-200 dark:border-white/10">
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-white/60 mb-1">Brand</div>
                  <div className="text-xl sm:text-2xl font-bold">{stats.brand}</div>
                  <div className="text-xs text-gray-500 dark:text-white/60">Identities</div>
                </div>
                <div className="card p-3 sm:p-4 lg:p-5 text-center bg-white dark:bg-black border-gray-200 dark:border-white/10">
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-white/60 mb-1">This Month</div>
                  <div className="text-xl sm:text-2xl font-bold">{stats.thisMonth}</div>
                  <div className="text-xs text-gray-500 dark:text-white/60">Projects</div>
                </div>
                <div className="card p-3 sm:p-4 lg:p-5 text-center bg-white dark:bg-black border-gray-200 dark:border-white/10">
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-white/60 mb-1">Total</div>
                  <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-gray-500 dark:text-white/60">All Time</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Projects */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-black dark:text-white">Recent Projects</h3>
              {projects.length > 0 && (
                <button onClick={loadProjects} className="text-xs text-gray-500 dark:text-white/60 hover:underline">Refresh</button>
              )}
            </div>
            
            {loading && (
              <div className="text-center py-12 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-white/60">Loading your projects...</p>
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-12 bg-white dark:bg-black rounded-xl border border-red-300">
                <p className="text-red-600">{error}</p>
                <button onClick={loadProjects} className="mt-3 btn-primary">Try Again</button>
              </div>
            )}

            {!loading && !error && projects.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10">
                <h4 className="text-lg font-medium text-black dark:text-white mb-2">No projects yet</h4>
                <p className="text-gray-500 dark:text-white/60 mb-6">Create your first campaign to get started.</p>
<button onClick={() => navigate('/marketing')} className="btn-primary">Create Project</button>
              </div>
            )}

            {!loading && !error && projects.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
              >
                {projects.map((project, index) => {
                  const isMarketing = project.type === 'marketing';
                  const Icon = isMarketing ? Zap : Palette;
                  
                  return (
                    <motion.div 
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className="card p-6 hover:shadow-lg transition-shadow bg-white dark:bg-black border-gray-200 dark:border-white/10"
                    >
                      {/* Project Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/10`}>
                            <Icon className={`w-5 h-5 text-black dark:text-white`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                              {project.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-white/60 mt-1">
                              {isMarketing ? 'Marketing Campaign' : 'Brand Identity'}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-gray-400 dark:text-white/40 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Project Meta */}
                      <div className="flex items-center text-xs text-gray-500 dark:text-white/60 mb-4">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(project.created_at)}
                        <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
                          project.status === 'completed' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : project.status === 'draft'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/60'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      
                      {/* Project Preview */}
                      <div className="mb-4">
                        {isMarketing && project.marketing_campaign ? (
                          <div className="text-sm">
                            <p className="text-gray-600 dark:text-white/60 mb-1">
                              <span className="font-medium">Type:</span> {project.marketing_campaign.campaign_type}
                            </p>
                            <p className="text-gray-600 dark:text-white/60 mb-1">
                              <span className="font-medium">Audience:</span> {project.marketing_campaign.target_audience}
                            </p>
                            <p className="text-gray-600 dark:text-white/60">
                              <span className="font-medium">Tone:</span> {project.marketing_campaign.tone}
                            </p>
                          </div>
                        ) : project.brand_kit ? (
                          <div className="text-sm">
                            <p className="text-gray-600 dark:text-white/60 mb-1">
                              <span className="font-medium">Industry:</span> {project.brand_kit.industry}
                            </p>
                            <p className="text-gray-600 dark:text-white/60 mb-1">
                              <span className="font-medium">Style:</span> {project.brand_kit.style}
                            </p>
                            <p className="text-gray-600 dark:text-white/60">
                              <span className="font-medium">Values:</span> {project.brand_kit.values}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-white/40">Project details loading...</p>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(project)}
                          className="btn-secondary text-xs px-3 py-2 flex items-center flex-1"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Details
                        </button>
                        <button
                          onClick={() => navigate(isMarketing ? '/marketing' : '/brand')}
                          className="btn-primary text-xs px-3 py-2 flex-1"
                        >
                          Create Similar
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Project Details Modal */}
      <ProjectDetailsModal 
        project={selectedProject}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedProject(null);
        }}
      />

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDeleteId(null)}></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-black dark:text-white">Delete Project?</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-white/60 mb-4">This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setConfirmDeleteId(null)} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
              <button onClick={confirmDelete} className="btn-primary px-4 py-2 text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
