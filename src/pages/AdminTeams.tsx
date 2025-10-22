import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../authContext';
import { adminApiService } from '../adminApi';

interface Team {
  id: number;
  name: string;
  code: string;
  token: string | null;
  created_at: string;
  last_activity: string | null;
  total_submissions: number;
  hint_unlocked_count: number;
  completed_count: number;
  pending_answer_count: number;
  pending_photo_count: number;
  progress_percentage: number;
  is_online: boolean;
  last_submission: string | null;
}

interface TeamsStats {
  total_teams: number;
  active_teams: number;
  average_progress: number;
  total_completed: number;
  total_hint_unlocked: number;
}

const AdminTeams: React.FC = () => {
  const { logoutAdmin } = useAuthContext();
  const navigate = useNavigate();

  const [teams, setTeams] = useState<Team[]>([]);
  const [stats, setStats] = useState<TeamsStats>({
    total_teams: 0,
    active_teams: 0,
    average_progress: 0,
    total_completed: 0,
    total_hint_unlocked: 0
  });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'progress' | 'name' | 'recent'>('progress');

  const loadTeams = async () => {
    try {
      const response = await adminApiService.getTeams();
      setTeams(response.teams);
      setStats(response.stats);
      setTotalQuestions(response.total_questions);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
    
    // Auto-refresh every 20 seconds
    const interval = setInterval(loadTeams, 2000);
    return () => clearInterval(interval);
  }, []);

  // Sort teams based on selected criteria
  const sortedTeams = [...teams].sort((a, b) => {
    switch (sortBy) {
      case 'progress':
        // Primary: completed_count, Secondary: hint_unlocked_count
        if (b.completed_count !== a.completed_count) {
          return b.completed_count - a.completed_count;
        }
        return b.hint_unlocked_count - a.hint_unlocked_count;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'recent':
        const timeA = a.last_activity ? new Date(a.last_activity).getTime() : 0;
        const timeB = b.last_activity ? new Date(b.last_activity).getTime() : 0;
        return timeB - timeA;
      default:
        return 0;
    }
  });

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getOnlineStatus = (team: Team) => {
    if (!team.last_activity) return { text: 'Never Active', color: 'text-gray-400' };
    
    const lastActive = new Date(team.last_activity);
    const minutesAgo = Math.floor((Date.now() - lastActive.getTime()) / 60000);
    
    if (minutesAgo < 5) return { text: 'Online Now', color: 'text-green-400' };
    if (minutesAgo < 30) return { text: `Active ${minutesAgo}m ago`, color: 'text-yellow-400' };
    return { text: `Inactive ${minutesAgo}m ago`, color: 'text-red-400' };
  };
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

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d47a1] to-[#1565c0] flex items-center justify-center">
        <div className="text-white text-xl">Loading Teams...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d47a1] to-[#1565c0] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-lg transform rotate-45"></div>
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 border-2 border-white transform -rotate-12"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <Link to="/admin/dashboard" className="text-white/80 hover:text-white mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white">Team Management</h1>
            <p className="text-white/80">
              {stats.total_teams} teams registered • {stats.active_teams} currently active
            </p>
          </div>
          <button
            onClick={() => handleLogout()}
            className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            Logout
          </button>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold mb-1">{stats.total_teams}</div>
            <div className="text-white/70 text-sm">Total Teams</div>
          </div>
          
          <div className="bg-green-500/20 backdrop-blur-sm border border-green-400 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold mb-1">{stats.active_teams}</div>
            <div className="text-white/70 text-sm">Active Teams</div>
          </div>
          
          <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-400 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold mb-1">{stats.total_completed}</div>
            <div className="text-white/70 text-sm">Questions Completed</div>
          </div>

          <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold mb-1">{stats.total_hint_unlocked}</div>
            <div className="text-white/70 text-sm">Hints Unlocked</div>
          </div>
          
          <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold mb-1">{stats.average_progress}%</div>
            <div className="text-white/70 text-sm">Avg Progress</div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400 rounded-lg text-red-100">
            {error}
          </div>
        )}

        {/* Sort Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setSortBy('progress')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'progress'
                  ? 'bg-white text-[#0d47a1]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Sort by Progress
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'name'
                  ? 'bg-white text-[#0d47a1]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Sort by Name
            </button>
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                sortBy === 'recent'
                  ? 'bg-white text-[#0d47a1]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Sort by Activity
            </button>
          </div>
          
          <div className="text-white/70 text-sm">
            Auto-refresh every 20s
          </div>
        </div>

        {/* Teams List */}
        <div className="space-y-4">
          {sortedTeams.length === 0 ? (
            <div className="text-center text-white/70 py-12">
              <p className="text-xl">No teams registered yet</p>
            </div>
          ) : (
            sortedTeams.map((team) => {
              const onlineStatus = getOnlineStatus(team);
              
              return (
                <div
                  key={team.id}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{team.name}</h3>
                        <span className={`text-sm ${onlineStatus.color}`}>
                          • {onlineStatus.text}
                        </span>
                        {team.is_online && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs animate-pulse">
                            LIVE
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-white/70">Team Code:</span>
                          <div className="text-white font-mono">{team.code}</div>
                        </div>
                        <div>
                          <span className="text-white/70">Registered:</span>
                          <div className="text-white">{formatTime(team.created_at)}</div>
                        </div>
                        <div>
                          <span className="text-white/70">Last Active:</span>
                          <div className="text-white">{formatTime(team.last_activity)}</div>
                        </div>
                        <div>
                          <span className="text-white/70">Last Submission:</span>
                          <div className="text-white">{formatTime(team.last_submission)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white mb-1">
                        {team.progress_percentage}%
                      </div>
                      <div className="text-white/70 text-sm">
                        {team.completed_count}/{totalQuestions} completed
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-white/70 text-sm mb-1">
                      <span>Mission Progress</span>
                      <span>{team.completed_count} completed • {team.hint_unlocked_count} hints unlocked • {team.pending_answer_count + team.pending_photo_count} pending</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${getProgressColor(team.progress_percentage)} transition-all duration-500`}
                        style={{ width: `${team.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-2 text-sm">
                    <div className="bg-purple-500/20 text-purple-100 px-3 py-1 rounded">
                      🏆 {team.completed_count} Completed
                    </div>
                    <div className="bg-blue-500/20 text-blue-100 px-3 py-1 rounded">
                      🔓 {team.hint_unlocked_count} Hints Unlocked
                    </div>
                    <div className="bg-yellow-500/20 text-yellow-100 px-3 py-1 rounded">
                      ⏳ {team.pending_answer_count} Answer Pending
                    </div>
                    <div className="bg-orange-500/20 text-orange-100 px-3 py-1 rounded">
                      📷 {team.pending_photo_count} Photo Pending
                    </div>
                    <div className="bg-gray-500/20 text-gray-100 px-3 py-1 rounded">
                      📝 {team.total_submissions} Total
                    </div>
                    {team.token && (
                      <div className="bg-indigo-500/20 text-indigo-100 px-3 py-1 rounded">
                        🔐 Token Active
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-white/60 text-sm">
          <p>Team Management • {totalQuestions} Active Missions • Auto-refresh active</p>
        </div>
      </div>
    </div>
  );
};

export default AdminTeams;