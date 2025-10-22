import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../authContext';
import { adminApiService } from '../adminApi';

interface Question {
  id: number;
  title: string;
  description_html: string;
  hint: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  total_submissions: number;
  accepted_count: number;
  pending_count: number;
}

const AdminQuestions: React.FC = () => {
  const { logoutAdmin } = useAuthContext();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description_html: '',
    hint: '',
    display_order: 1
  });

  const loadQuestions = async () => {
    try {
      const response = await adminApiService.getQuestions();
      setQuestions(response.questions);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadQuestions, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await adminApiService.createQuestion(formData);
      setShowCreateForm(false);
      setFormData({
        title: '',
        description_html: '',
        hint: '',
        display_order: 1
      });
      loadQuestions(); // Reload questions
      setError('Question created successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create question');
    }
  };

  const handleToggleQuestion = async (questionId: number, currentStatus: boolean) => {
    try {
      await adminApiService.toggleQuestion(questionId, !currentStatus);
      loadQuestions(); // Reload questions
      setError(`Question ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle question status');
    }
  };

  // const getNextDisplayOrder = () => {
  //   if (questions.length === 0) return 1;
  //   return Math.max(...questions.map(q => q.display_order)) + 1;
  // };

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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d47a1] to-[#1565c0] flex items-center justify-center">
        <div className="text-white text-xl">Loading Questions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d47a1] to-[#1565c0] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-lg transform rotate-45"></div>
        <div className="absolute top-1/4 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <Link to="/admin/dashboard" className="text-white/80 hover:text-white mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white">Mission Management</h1>
            <p className="text-white/80">
              {questions.length} missions total • {questions.filter(q => q.is_active).length} active
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              + New Mission
            </button>
            <button
              onClick={handleLogout}
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div className={`mb-6 p-4 rounded-lg ${
            error.includes('successfully')
              ? 'bg-green-500/20 border border-green-400 text-green-100'
              : 'bg-red-500/20 border border-red-400 text-red-100'
          }`}>
            {error}
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {questions.length === 0 ? (
            <div className="text-center text-white/70 py-12">
              <p className="text-xl">No missions created yet</p>
              <p className="text-sm mt-2">Create your first mission to get started</p>
            </div>
          ) : (
            questions.map((question) => (
              <div
                key={question.id}
                className={`bg-white/10 backdrop-blur-sm border rounded-xl p-6 transition-colors ${
                  question.is_active 
                    ? 'border-white/20 hover:bg-white/15' 
                    : 'border-red-400/50 bg-red-500/10 hover:bg-red-500/15'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        #{question.display_order} - {question.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-sm ${
                        +question.is_active
                          ? 'bg-green-500/20 text-green-100 border border-green-400'
                          : 'bg-red-500/20 text-red-100 border border-red-400'
                      }`}>
                        {+question.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-white/70">Created:</span>
                        <div className="text-white">{formatTime(question.created_at)}</div>
                      </div>
                      <div>
                        <span className="text-white/70">Total Submissions:</span>
                        <div className="text-white">{question.total_submissions}</div>
                      </div>
                      <div>
                        <span className="text-white/70">Accepted:</span>
                        <div className="text-green-400">{question.accepted_count}</div>
                      </div>
                      <div>
                        <span className="text-white/70">Pending:</span>
                        <div className="text-yellow-400">{question.pending_count}</div>
                      </div>
                    </div>

                    {/* Question Preview */}
                    <div className="mb-3">
                      <h4 className="text-white font-semibold mb-2">Mission Briefing:</h4>
                      <div 
                        className="bg-black/30 p-4 rounded-lg max-h-32 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: question.description_html }}
                      />
                    </div>

                    {/* Hint Preview */}
                    <div>
                      <h4 className="text-white font-semibold mb-1">Electronic Part Hint:</h4>
                      <p className="text-white/80 bg-black/20 p-3 rounded-lg">
                        {question.hint}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleToggleQuestion(question.id, question.is_active)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        question.is_active
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {question.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => {/* Edit functionality can be added later */}}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Question Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Create New Mission
              </h2>
              
              <form onSubmit={handleCreateQuestion} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Mission Title:
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter mission title..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Mission Briefing (HTML):
                  </label>
                  <textarea
                    value={formData.description_html}
                    onChange={(e) => setFormData({...formData, description_html: e.target.value})}
                    placeholder="Enter mission description with HTML formatting..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Electronic Part Hint:
                  </label>
                  <textarea
                    value={formData.hint}
                    onChange={(e) => setFormData({...formData, hint: e.target.value})}
                    placeholder="Enter the hint that will be revealed when answer is accepted..."
                    className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Display Order:
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 1})}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Create Mission
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

     
      </div>
    </div>
  );
};

export default AdminQuestions;