import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../authContext';
import { useToastHelpers } from '../contexts/ToastContext';
import { apiService } from '../api';
import PhotoUpload from '../components/PhotoUpload';

interface MissionDetail {
  id: number;
  title: string;
  description_html: string;
  hint: string;
  hint_image_url?: string;
  status: 'available' | 'pending_answer' | 'hint_unlocked' | 'pending_photo' | 'completed' | 'rejected' | 'globally_completed';
  can_submit_answer: boolean;
  can_submit_photo: boolean;
  submitted_answer?: string;
  admin_notes?: string;
  photo_filename?: string;
  photo_admin_notes?: string;
  answer_status?: 'pending' | 'accepted' | 'rejected';
  photo_status?: 'pending' | 'accepted' | 'rejected';
  is_globally_completed?: boolean;
  completed_by_team?: string;
  completed_at?: string;
}

const MissionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logoutTeam } = useAuthContext();
  const { showSuccess, showError, showWarning } = useToastHelpers();
  
  const [mission, setMission] = useState<MissionDetail | null>(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<number | null>(null);
  const [lastUserInput, setLastUserInput] = useState<number>(0);

  const loadMission = async () => {
    if (!id) return;
    
    try {
      const response = await apiService.getQuestionDetail(parseInt(id));
      if (response.success) {
        const newMission = response.question;
        
        // Check for status changes and show toasts
        if (mission) {
          // Check if question became globally completed
          if (!mission.is_globally_completed && newMission.is_globally_completed) {
            showWarning(
              'Question Completed by Another Team',
              `"${newMission.title}" has been completed by ${newMission.completed_by_team || 'another team'} and is now locked.`,
              {
                label: 'View Mission Control',
                onClick: () => navigate('/mission-control')
              }
            );
          }
          
          // Check if answer was accepted (hint unlocked)
          if (mission.status !== 'hint_unlocked' && newMission.status === 'hint_unlocked') {
            showSuccess(
              'Answer Accepted!',
              `Great work! Your answer for "${newMission.title}" has been accepted. The hint is now unlocked!`,
              {
                label: 'View Hint',
                onClick: () => {
                  // Scroll to hint section
                  const hintSection = document.getElementById('hint-section');
                  if (hintSection) {
                    hintSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }
            );
          }
          
          // Check if photo was accepted (question completed)
          if (mission.status !== 'completed' && newMission.status === 'completed') {
            showSuccess(
              'Mission Completed!',
              `Congratulations! You have successfully completed "${newMission.title}". Well done!`,
              {
                label: 'View All Missions',
                onClick: () => navigate('/mission-control')
              }
            );
          }
          
          // Check if answer was rejected
          if (mission.status !== 'rejected' && newMission.status === 'rejected') {
            showError(
              'Answer Needs Revision',
              `Your answer for "${newMission.title}" was not accepted. Please review the feedback and try again.`,
              {
                label: 'View Feedback',
                onClick: () => {
                  const feedbackSection = document.getElementById('feedback-section');
                  if (feedbackSection) {
                    feedbackSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }
            );
          }
        }
        
        setMission(newMission);
        // Only reset answer if:
        // 1. User hasn't typed in the last 5 seconds AND
        // 2. Either there's no current answer OR there's a submitted answer from server
        const now = Date.now();
        const timeSinceLastInput = now - lastUserInput;
        if (timeSinceLastInput > 5000 && (!answer.trim() || newMission.submitted_answer)) {
          setAnswer(newMission.submitted_answer || '');
        }
        setError('');
      } else {
        setError('Failed to load mission details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mission');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMission();
    
    // Refresh every 3 seconds to check status updates, but only if user is not typing
    const interval = setInterval(() => {
      if (!isTyping) {
        loadMission();
      }
    }, 3000);
    return () => {
      clearInterval(interval);
      // Clean up typing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [id, isTyping]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission || !answer.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await apiService.submitAnswer(mission.id, answer.trim());
      showSuccess(
        'Answer Submitted!',
        `Your answer for "${mission.title}" has been submitted and is waiting for review.`,
        {
          label: 'View Mission Control',
          onClick: () => navigate('/mission-control')
        }
      );
      setAnswer('');
      // Reload mission to update status
      setTimeout(loadMission, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer';
      setError(errorMessage);
      
      // Show toast for global completion error
      if (errorMessage.includes('completed by another team')) {
        showWarning(
          'Question Locked',
          'This question has been completed by another team and is no longer available.',
          {
            label: 'View Mission Control',
            onClick: () => navigate('/mission-control')
          }
        );
        setTimeout(() => {
          loadMission();
        }, 1000);
      } else {
        showError('Submission Failed', errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoSuccess = (_response: any) => {
    showSuccess(
      'Photo Submitted!',
      `Your photo for "${mission?.title}" has been submitted and is waiting for review.`,
      {
        label: 'View Mission Control',
        onClick: () => navigate('/mission-control')
      }
    );
    setPhotoSuccess('');
    setPhotoError('');
    // Reload mission to update status
    setTimeout(loadMission, 1000);
  };

  const handlePhotoError = (error: string) => {
    setPhotoError(error);
    setPhotoSuccess('');
    
    // Show toast for global completion error
    if (error.includes('completed by another team')) {
      showWarning(
        'Question Locked',
        'This question has been completed by another team and is no longer available.',
        {
          label: 'View Mission Control',
          onClick: () => navigate('/mission-control')
        }
      );
      setTimeout(() => {
        loadMission();
      }, 1000);
    } else {
      showError('Photo Submission Failed', error);
    }
  };

  const handleLogout = () => {
    logoutTeam();
    navigate('/enter');
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-purple-500/20 border-purple-400 text-purple-100',
          icon: '✓',
          text: 'Mission Completed',
          message: 'Congratulations! You have successfully completed this mission.'
        };
      case 'globally_completed':
        return {
          color: 'bg-red-500/20 border-red-400 text-red-100',
          icon: '🔒',
          text: 'Solved by Another Team',
          message: 'This question has been completed by another team and is now locked.'
        };
      case 'pending_photo':
        return {
          color: 'bg-orange-500/20 border-orange-400 text-orange-100',
          icon: '⏳',
          text: 'Photo Under Review',
          message: 'Your photo is being reviewed by command center.'
        };
      case 'hint_unlocked':
        return {
          color: 'bg-blue-500/20 border-blue-400 text-blue-100',
          icon: '🔓',
          text: 'Hint Unlocked',
          message: 'Great! Now go to the hint location and take a photo.'
        };
      case 'pending_answer':
        return {
          color: 'bg-yellow-500/20 border-yellow-400 text-yellow-100',
          icon: '⏳',
          text: 'Answer Under Review',
          message: 'Your answer is being reviewed by command center.'
        };
      case 'rejected':
        return {
          color: 'bg-red-500/20 border-red-400 text-red-100',
          icon: '✓',
          text: 'Needs Revision',
          message: 'Please review the feedback and resubmit your answer or photo.'
        };
      default:
        return {
          color: 'bg-green-500/20 border-green-400 text-green-100',
          icon: '→',
          text: 'Mission Available',
          message: 'Submit your solution to complete this mission.'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d47a1] to-[#1565c0] flex items-center justify-center">
        <div className="text-white text-xl">Loading Mission Details...</div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d47a1] to-[#1565c0] flex items-center justify-center">
        <div className="text-white text-xl">Mission not found</div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(mission.status);

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

      <div className="relative z-10 container mx-auto px-12 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <Link 
              to="/mission-control" 
              className="text-white/80 hover:text-white mb-2 inline-block transition-colors"
            >
              ← Back to Mission Control
            </Link>
            <h1 className="text-4xl font-bold text-white">{mission.title}</h1>

          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mission Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className={`border rounded-2xl p-6 ${statusConfig.color}`}>
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{statusConfig.icon}</span>
                <h2 className="text-xl font-semibold">{statusConfig.text}</h2>
              </div>
              <p>{statusConfig.message}</p>
              {mission.status === 'globally_completed' && mission.completed_by_team && (
                <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-400">
                  <strong>Completed by:</strong> {mission.completed_by_team}
                  {mission.completed_at && (
                    <div className="text-sm mt-1">
                      <strong>Completed at:</strong> {new Date(mission.completed_at).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
              {mission.admin_notes && (
                <div id="feedback-section" className="mt-4 p-3 bg-black/20 rounded-lg">
                  <strong>Answer Feedback:</strong> {mission.admin_notes}
                </div>
              )}
              {mission.photo_admin_notes && (
                <div className="mt-4 p-3 bg-black/20 rounded-lg">
                  <strong>Photo Feedback:</strong> {mission.photo_admin_notes}
                </div>
              )}
            </div>

            {/* Mission Briefing */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Question</h2>
              <div 
                className="prose prose-invert max-w-none text-white/90 mission-content"
                dangerouslySetInnerHTML={{ __html: mission.description_html }}
              />
            </div>

            {/* Hint Section (if unlocked) */}
            {(mission.status === 'hint_unlocked' || mission.status === 'pending_photo' || mission.status === 'completed') && (
              <div id="hint-section" className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-3">🔓 Unlocked Hint</h2>
                <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-400">
                  {mission.hint.startsWith('http') ? (
                    <img 
                      src={mission.hint} 
                      alt="Hint" 
                      className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                      onError={(e) => {
                        // Show error message if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'text-red-300 text-center p-4';
                        errorDiv.textContent = 'Failed to load hint image';
                        target.parentNode?.appendChild(errorDiv);
                      }}
                    />
                  ) : (
                    <p className="text-white/90 font-medium">{mission.hint}</p>
                  )}
                </div>
              </div>
            )}

            {/* Previous Answer Submission (if exists) */}
            {mission.submitted_answer && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-3">Your Answer Submission</h2>
                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="text-white/80 whitespace-pre-wrap">{mission.submitted_answer}</p>
                </div>
                {mission.answer_status && (
                  <div className="mt-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      mission.answer_status === 'accepted' ? 'bg-green-500/20 border-green-400 text-green-100' :
                      mission.answer_status === 'pending' ? 'bg-yellow-500/20 border-yellow-400 text-yellow-100' :
                      'bg-red-500/20 border-red-400 text-red-100'
                    }`}>
                      Answer: {mission.answer_status}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Photo Submission Status (if exists) */}
            {mission.photo_filename && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-3">📷 Photo Submission</h2>
                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="text-white/80">Photo submitted: {mission.photo_filename}</p>
                </div>
                {mission.photo_status && (
                  <div className="mt-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      mission.photo_status === 'accepted' ? 'bg-green-500/20 border-green-400 text-green-100' :
                      mission.photo_status === 'pending' ? 'bg-yellow-500/20 border-yellow-400 text-yellow-100' :
                      'bg-red-500/20 border-red-400 text-red-100'
                    }`}>
                      Photo: {mission.photo_status}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submission Panel */}
          <div className="space-y-6">
            {/* Submit Answer Card */}
            {mission.can_submit_answer && mission.status !== 'globally_completed' && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Submit Answer</h2>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-400 rounded-lg text-red-100">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-500/20 border border-green-400 rounded-lg text-green-100">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="answer" className="block text-white mb-2">
                      Your Answer
                    </label>
                    <textarea
                      id="answer"
                      value={answer}
                      onChange={(e) => {
                        setAnswer(e.target.value);
                        setIsTyping(true);
                        setLastUserInput(Date.now());
                        // Clear existing timeout
                        if (typingTimeout) {
                          clearTimeout(typingTimeout);
                        }
                        // Set new timeout to reset typing state after 5 seconds
                        const timeout = setTimeout(() => setIsTyping(false), 5000);
                        setTypingTimeout(timeout);
                      }}
                      onBlur={() => setIsTyping(false)}
                      placeholder="Enter your answer here..."
                      className="w-full h-32 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all resize-none"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !answer.trim()}
                    className="w-full bg-white text-[#0d47a1] py-3 px-4 rounded-lg font-semibold hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0d47a1] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#0d47a1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </div>
                    ) : (
                      '🚀 Submit Answer'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Submit Photo Card */}
            {mission.can_submit_photo && mission.status !== 'globally_completed' && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Submit Photo</h2>
                
                {photoError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-400 rounded-lg text-red-100">
                    {photoError}
                  </div>
                )}

                {photoSuccess && (
                  <div className="mb-4 p-3 bg-green-500/20 border border-green-400 rounded-lg text-green-100">
                    {photoSuccess}
                  </div>
                )}

                <PhotoUpload
                  questionId={mission.id}
                  onSuccess={handlePhotoSuccess}
                  onError={handlePhotoError}
                />
              </div>
            )}

            {/* Locked Question Message */}
            {mission.status === 'globally_completed' && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-400 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h2 className="text-xl font-bold text-red-100">Question Locked</h2>
                </div>
                <p className="text-red-100 mb-4">
                  This question has been completed by another team and is no longer available for submissions.
                </p>
                {mission.completed_by_team && (
                  <div className="bg-red-500/30 p-3 rounded-lg">
                    <p className="text-red-100 text-sm">
                      <strong>Completed by:</strong> {mission.completed_by_team}
                    </p>
                    {mission.completed_at && (
                      <p className="text-red-100 text-sm mt-1">
                        <strong>Completed at:</strong> {new Date(mission.completed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mission Info Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Mission Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                    {statusConfig.text}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Answer:</span>
                  <span className="text-white">
                    {mission.submitted_answer ? 'Submitted' : 'Not Submitted'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Photo:</span>
                  <span className="text-white">
                    {mission.photo_filename ? 'Submitted' : 'Not Submitted'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Phase:</span>
                  <span className="text-white">
                    {mission.status === 'completed' ? 'Complete' :
                     mission.status === 'pending_photo' || mission.status === 'hint_unlocked' ? 'Phase 2' :
                     'Phase 1'}
                  </span>
                </div>
     
              </div>
            </div>

          </div>
        </div>


      </div>

      {/* Add some CSS for the mission content */}
      <style>{`
        .mission-content h1, .mission-content h2, .mission-content h3 {
          color: white;
          margin-bottom: 1rem;
        }
        .mission-content p {
          margin-bottom: 1rem;
        }
        .mission-content code {
          background: rgba(255,255,255,0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          color: #ffeb3b;
        }
        .mission-content pre {
          background: rgba(0,0,0,0.3);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
};

export default MissionDetailPage;