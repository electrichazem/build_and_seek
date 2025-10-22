import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../authContext';
import { adminApiService } from '../adminApi';

interface DashboardStats {
  total_teams: number;
  total_questions: number;
  pending_submissions: number;
  total_submissions: number;
  teams_with_solutions: number;
  avg_completion_rate: number;
  completed_questions: number;
  photo_pending_count: number;
  globally_completed_questions: number;
  active_questions: number;
}

interface RecentSubmission {
  id: number;
  team_name: string;
  question_title: string;
  submitted_answer: string;
  status: 'pending' | 'accepted' | 'rejected';
  submitted_at: string;
  photo_filename?: string;
  photo_status?: 'pending' | 'accepted' | 'rejected';
  photo_submitted_at?: string;
}

const AdminDashboard: React.FC = () => {
  const { logoutAdmin, adminUsername } = useAuthContext();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    total_teams: 0,
    total_questions: 0,
    pending_submissions: 0,
    total_submissions: 0,
    teams_with_solutions: 0,
    avg_completion_rate: 0,
    completed_questions: 0,
    photo_pending_count: 0,
    globally_completed_questions: 0,
    active_questions: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'analytics'>('overview');
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'recent'>('pending');

  const loadDashboardData = async () => {
    try {
      const response = await adminApiService.getDashboardStats();
      setStats(response.stats);
      setRecentSubmissions(response.recent_submissions || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(loadDashboardData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await adminApiService.logout();
      logoutAdmin();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      logoutAdmin();
      navigate('/admin/login');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/20 border-green-400 text-green-100';
      case 'pending': return 'bg-yellow-500/20 border-yellow-400 text-yellow-100';
      case 'rejected': return 'bg-red-500/20 border-red-400 text-red-100';
      default: return 'bg-blue-500/20 border-blue-400 text-blue-100';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  // Helper functions for better UX
  const getFilteredSubmissions = () => {
    switch (submissionFilter) {
      case 'pending':
        return recentSubmissions.filter(s => s.status === 'pending' || s.photo_status === 'pending');
      case 'recent':
        return recentSubmissions.slice(0, 5);
      default:
        return recentSubmissions;
    }
  };

  const getPriorityActions = () => {
    const pendingCount = (stats.pending_submissions || 0) + (stats.photo_pending_count || 0);
    return [
      {
        title: 'Review Submissions',
        count: pendingCount,
        priority: pendingCount > 0 ? 'high' : 'normal',
        link: '/admin/submissions',
        icon: '📋',
        color: pendingCount > 0 ? 'bg-yellow-500/20 border-yellow-400' : 'bg-white/10 border-white/20'
      },
      {
        title: 'Manage Questions',
        count: stats.total_questions || 0,
        priority: 'normal',
        link: '/admin/questions',
        icon: '❓',
        color: 'bg-white/10 border-white/20'
      },
      {
        title: 'View Teams',
        count: stats.total_teams || 0,
        priority: 'normal',
        link: '/admin/teams',
        icon: '👥',
        color: 'bg-white/10 border-white/20'
      }
    ];
  };

  const getKeyMetrics = () => {
    return [
      {
        title: 'Pending Reviews',
        value: (stats.pending_submissions || 0) + (stats.photo_pending_count || 0),
        color: 'bg-yellow-500/20 border-yellow-400 text-yellow-100',
        icon: '⏳',
        priority: 'high'
      },
      {
        title: 'Active Teams',
        value: stats.total_teams || 0,
        color: 'bg-blue-500/20 border-blue-400 text-blue-100',
        icon: '👥',
        priority: 'normal'
      },
      {
        title: 'Completed Questions',
        value: stats.globally_completed_questions || 0,
        color: 'bg-red-500/20 border-red-400 text-red-100',
        icon: '🔒',
        priority: 'normal'
      },
      {
        title: 'Total Submissions',
        value: stats.total_submissions || 0,
        color: 'bg-purple-500/20 border-purple-400 text-purple-100',
        icon: '📊',
        priority: 'normal'
      }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d47a1] to-[#1565c0] flex items-center justify-center">
        <div className="text-white text-xl">Loading Command Center...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d47a1] to-[#1565c0] relative overflow-hidden">
      {/* Circuit Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-lg transform rotate-45"></div>
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 border-2 border-white transform -rotate-12"></div>
        <div className="absolute bottom-40 right-40 w-20 h-20 border-2 border-white rounded-lg"></div>
        
        {/* Circuit Lines */}
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/20 transform -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/20 transform -translate-y-1/2"></div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white"></div>
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white"></div>
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white"></div>
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white"></div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Command Center</h1>
            <p className="text-white/70 text-sm">
              Welcome back, {adminUsername} • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right text-sm text-white/70">
              <div>Auto-refresh: ON</div>
              <div className="text-xs">Every 2 seconds</div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500/20 text-red-100 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors border border-red-400"
            >
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400 rounded-lg text-red-100">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Connection Error</span>
            </div>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/10 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'submissions', label: 'Submissions', icon: '📋' },
            { id: 'analytics', label: 'Analytics', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics - Priority First */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {getKeyMetrics().map((metric, index) => (
                <div key={index} className={`${metric.color} backdrop-blur-sm border rounded-xl p-4 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{metric.icon}</span>
                    {metric.priority === 'high' && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className="text-2xl font-bold mb-1">{metric.value}</div>
                  <div className="text-sm opacity-80">{metric.title}</div>
                </div>
              ))}
            </div>

            {/* Priority Actions */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                Priority Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getPriorityActions().map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className={`${action.color} backdrop-blur-sm border rounded-xl p-4 text-white hover:scale-105 transition-all transform group`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{action.title}</h3>
                      <div className="text-xl group-hover:scale-110 transition-transform">{action.icon}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm opacity-70">{action.count} items</span>
                      {action.priority === 'high' && (
                        <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-medium">
                          URGENT
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Question Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Active Questions</span>
                    <span className="text-white font-semibold">{stats.total_questions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Completed</span>
                    <span className="text-purple-300 font-semibold">{stats.completed_questions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Globally Completed</span>
                    <span className="text-red-300 font-semibold">{stats.globally_completed_questions || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Submission Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Answer Pending</span>
                    <span className="text-yellow-300 font-semibold">{stats.pending_submissions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Photo Pending</span>
                    <span className="text-orange-300 font-semibold">{stats.photo_pending_count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Total Submissions</span>
                    <span className="text-white font-semibold">{stats.total_submissions || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* Submission Filters */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Recent Submissions</h2>
              <div className="flex space-x-2">
                {[
                  { id: 'pending', label: 'Pending', count: recentSubmissions.filter(s => s.status === 'pending' || s.photo_status === 'pending').length },
                  { id: 'recent', label: 'Recent', count: recentSubmissions.length },
                  { id: 'all', label: 'All', count: recentSubmissions.length }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSubmissionFilter(filter.id as any)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      submissionFilter === filter.id
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Submissions List */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              {getFilteredSubmissions().length === 0 ? (
                <div className="text-center text-white/70 py-12">
                  <div className="text-4xl mb-4">📭</div>
                  <p className="text-lg">No submissions found</p>
                  <p className="text-sm">Try changing the filter or check back later</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredSubmissions().map((submission) => (
                    <div 
                      key={submission.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-semibold">{submission.team_name}</h3>
                            <span className="text-white/50 text-sm">#{submission.id}</span>
                          </div>
                          <p className="text-white/70 text-sm mb-2">{submission.question_title}</p>
                          <p className="text-white/80 text-sm line-clamp-2">
                            {submission.submitted_answer}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(submission.status)}`}>
                            Answer: {submission.status}
                          </span>
                          {submission.photo_filename && (
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(submission.photo_status || 'pending')}`}>
                              Photo: {submission.photo_status || 'pending'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-white/50 text-xs">
                        <span>
                          Answer: {formatTime(submission.submitted_at)}
                          {submission.photo_submitted_at && (
                            <span className="ml-2">Photo: {formatTime(submission.photo_submitted_at)}</span>
                          )}
                        </span>
                        <Link 
                          to="/admin/submissions" 
                          className="text-blue-300 hover:text-blue-200 transition-colors"
                        >
                          Review →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Analytics Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Team Performance</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">Teams with Solutions</span>
                      <span className="text-white">{stats.teams_with_solutions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Total Teams</span>
                      <span className="text-white">{stats.total_teams || 0}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${((stats.teams_with_solutions || 0) / Math.max(stats.total_teams || 1, 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Completion Rate</h3>
                  <div className="text-3xl font-bold text-white mb-2">{(stats.avg_completion_rate || 0).toFixed(1)}%</div>
                  <div className="text-white/70 text-sm">Average completion rate</div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Question Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">Active</span>
                      <span className="text-green-300">{stats.active_questions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Completed</span>
                      <span className="text-purple-300">{stats.completed_questions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Globally Completed</span>
                      <span className="text-red-300">{stats.globally_completed_questions || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;