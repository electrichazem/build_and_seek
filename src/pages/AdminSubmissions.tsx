import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../authContext';
import { adminApiService } from '../adminApi';

interface Submission {
  id: number;
  team_name: string;
  team_id: number;
  question_title: string;
  question_id: number;
  submitted_answer: string;
  status: 'pending' | 'accepted' | 'rejected';
  submitted_at: string;
  admin_notes?: string;
  question_hint: string;
  photo_filename?: string;
  photo_status?: 'pending' | 'accepted' | 'rejected';
  photo_submitted_at?: string;
  photo_admin_notes?: string;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_submissions: number;
  limit: number;
}

const AdminSubmissions: React.FC = () => {
  const { logoutAdmin } = useAuthContext();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    total_pages: 1,
    total_submissions: 0,
    limit: 20
  });
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewingSubmission, setReviewingSubmission] = useState<Submission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewType, setReviewType] = useState<'answer' | 'photo'>('answer');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);


  
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


  const loadSubmissions = async (page: number = 1, status: string = 'all') => {
    try {
      const response = await adminApiService.getSubmissions(status, page);
      
      // Sort submissions by submission time (FIFO - first submitted, first reviewed)
      const sortedSubmissions = response.submissions.sort((a: Submission, b: Submission) => {
        const timeA = new Date(a.submitted_at).getTime();
        const timeB = new Date(b.submitted_at).getTime();
        return timeA - timeB; // Ascending order (oldest first)
      });
      
      setSubmissions(sortedSubmissions);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions(1, filter);
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => loadSubmissions(pagination.current_page, filter), 2000);
    return () => clearInterval(interval);
  }, [filter]);

  const handleReview = async (action: 'accept' | 'reject') => {
    if (!reviewingSubmission) return;

    try {
      await adminApiService.reviewSubmission(reviewingSubmission.id, action, adminNotes, reviewType);
      
      // Update local state and maintain FIFO order
      setSubmissions(prev => {
        const updated = prev.map(sub => {
          if (sub.id === reviewingSubmission.id) {
            if (reviewType === 'answer') {
              return { ...sub, status: (action === 'accept' ? 'accepted' : 'rejected') as 'accepted' | 'rejected', admin_notes: adminNotes };
            } else {
              return { ...sub, photo_status: (action === 'accept' ? 'accepted' : 'rejected') as 'accepted' | 'rejected', photo_admin_notes: adminNotes };
            }
          }
          return sub;
        });
        
        // Re-sort to maintain FIFO order
        return updated.sort((a: Submission, b: Submission) => {
          const timeA = new Date(a.submitted_at).getTime();
          const timeB = new Date(b.submitted_at).getTime();
          return timeA - timeB;
        });
      });
      
      setReviewingSubmission(null);
      setAdminNotes('');
      setPhotoData(null);
      
      // Show success message
      setError(`${action === 'accept' ? 'Accepted' : 'Rejected'} ${reviewType} successfully!`);
      setTimeout(() => setError(''), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review submission');
    }
  };

  const loadPhoto = async (submissionId: number) => {
    setLoadingPhoto(true);
    try {
      const response = await adminApiService.getPhoto(submissionId);
      setPhotoData(response.submission.photo_data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photo');
    } finally {
      setLoadingPhoto(false);
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

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'accepted': return '✅';
  //     case 'pending': return '⏳';
  //     case 'rejected': return '❌';
  //     default: return '📝';
  //   }
  // };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d47a1] to-[#1565c0] flex items-center justify-center">
        <div className="text-white text-xl">Loading Submissions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d47a1] to-[#1565c0] relative overflow-hidden">
      {/* Background elements same as dashboard */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-lg transform rotate-45"></div>
        {/* ... other background elements ... */}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <Link to="/admin/dashboard" className="text-white/80 hover:text-white mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white">Submission Reviews</h1>
   
          </div>
          <button
            onClick={() => handleLogout()}
            className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            Logout
          </button>
        </header>

        {/* FIFO Notice */}
        <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 text-blue-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">FIFO Review Order</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            Submissions are ordered by submission time (First In, First Out). Review the earliest submissions first.
          </p>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          {['all', 'pending', 'accepted', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setLoading(true);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status
                  ? 'bg-white text-[#0d47a1]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-lg ${
            error.includes('Accepted') || error.includes('Rejected')
              ? 'bg-green-500/20 border border-green-400 text-green-100'
              : 'bg-red-500/20 border border-red-400 text-red-100'
          }`}>
            {error}
          </div>
        )}

        {/* Submissions List */}
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="text-center text-white/70 py-12">
              <p className="text-xl">No submissions found</p>
              <p className="text-sm mt-2">Try changing the filter or check back later</p>
            </div>
          ) : (
            submissions.map((submission, index) => (
              <div
                key={submission.id}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-3">
                    {/* Queue Position Indicator */}
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        submission.status === 'pending' || submission.photo_status === 'pending'
                          ? 'bg-yellow-500/20 border border-yellow-400 text-yellow-100'
                          : 'bg-gray-500/20 border border-gray-400 text-gray-100'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {submission.team_name} - {submission.question_title}
                      </h3>
                      <div className="flex items-center space-x-4 text-white/70 text-sm">
                        <span>Submitted: {formatTime(submission.submitted_at)}</span>
                        {(submission.status === 'pending' || submission.photo_status === 'pending') && (
                          <span className="text-yellow-300 font-medium">
                            Queue Position: #{index + 1}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col space-y-1">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(submission.status)}`}>
                          Answer: {submission.status.toUpperCase()}
                        </span>
                        {submission.photo_filename && (
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(submission.photo_status || 'pending')}`}>
                            Photo: {(submission.photo_status || 'pending').toUpperCase()}
                          </span>
                        )}
                    </div>
                    <div className="flex flex-col space-y-1">
                      {submission.status === 'pending' && (
                        <button
                          onClick={() => {
                            setReviewingSubmission(submission);
                            setReviewType('answer');
                          }}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                        >
                          Review Answer
                        </button>
                      )}
                      {submission.photo_filename && submission.photo_status === 'pending' && (
                        <button
                          onClick={() => {
                            setReviewingSubmission(submission);
                            setReviewType('photo');
                            loadPhoto(submission.id);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          Review Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-white font-semibold mb-2">Submitted Answer:</h4>
                  <div className="bg-black/30 p-4 rounded-lg">
                    <p className="text-white/90 whitespace-pre-wrap">{submission.submitted_answer}</p>
                  </div>
                </div>

                {submission.admin_notes && (
                  <div className="mb-2">
                    <h4 className="text-white font-semibold mb-1">Answer Admin Notes:</h4>
                    <p className="text-white/70 text-sm">{submission.admin_notes}</p>
                  </div>
                )}

                {submission.photo_filename && (
                  <div className="mb-4">
                    <h4 className="text-white font-semibold mb-2">Photo Submission:</h4>
                    <div className="bg-black/30 p-4 rounded-lg">
                      <p className="text-white/90">Photo: {submission.photo_filename}</p>
                      {submission.photo_submitted_at && (
                        <p className="text-white/70 text-sm mt-1">
                          Submitted: {formatTime(submission.photo_submitted_at)}
                        </p>
                      )}
                    </div>
                    {submission.photo_admin_notes && (
                      <div className="mt-2">
                        <h4 className="text-white font-semibold mb-1">Photo Admin Notes:</h4>
                        <p className="text-white/70 text-sm">{submission.photo_admin_notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {submission.status === 'accepted' && (
                  <div className="bg-green-500/20 border border-green-400 rounded-lg p-3">
                    <h4 className="text-green-100 font-semibold mb-1">Hint Unlocked:</h4>
                    <p className="text-green-100/90">{submission.question_hint}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => loadSubmissions(pagination.current_page - 1, filter)}
              disabled={pagination.current_page === 1}
              className="bg-white/20 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/30 transition-colors"
            >
              Previous
            </button>
            <span className="text-white">
              Page {pagination.current_page} of {pagination.total_pages}
            </span>
            <button
              onClick={() => loadSubmissions(pagination.current_page + 1, filter)}
              disabled={pagination.current_page === pagination.total_pages}
              className="bg-white/20 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/30 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Review Modal */}
        {reviewingSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Review {reviewType === 'answer' ? 'Answer' : 'Photo'} Submission
              </h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Team: {reviewingSubmission.team_name}</h3>
                <p className="text-gray-600">Question: {reviewingSubmission.question_title}</p>
              </div>

              {/* Review Type Tabs */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => {
                    setReviewType('answer');
                    setPhotoData(null);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    reviewType === 'answer'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Review Answer
                </button>
                {reviewingSubmission.photo_filename && (
                  <button
                    onClick={() => {
                      setReviewType('photo');
                      if (!photoData) loadPhoto(reviewingSubmission.id);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      reviewType === 'photo'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Review Photo
                  </button>
                )}
              </div>

              {/* Answer Review */}
              {reviewType === 'answer' && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Submitted Answer:</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{reviewingSubmission.submitted_answer}</p>
                  </div>
                </div>
              )}

              {/* Photo Review */}
              {reviewType === 'photo' && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Submitted Photo:</h4>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    {loadingPhoto ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-gray-600">Loading photo...</span>
                      </div>
                    ) : photoData ? (
                      <img 
                        src={photoData} 
                        alt="Submitted photo" 
                        className="max-w-full h-auto rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-600">Failed to load photo</p>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Admin Notes (Optional):
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={`Add feedback for the ${reviewType}...`}
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setReviewingSubmission(null);
                    setAdminNotes('');
                    setPhotoData(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReview('reject')}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleReview('accept')}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubmissions;