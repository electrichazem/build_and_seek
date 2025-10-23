import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../authContext';
import { useToastHelpers } from '../contexts/ToastContext';
import { apiService } from '../api';
import type { TeamProgressResponse, Question } from '../types';


const MissionControlPage: React.FC = () => {
    const { teamName, logoutTeam } = useAuthContext();
    const navigate = useNavigate();
    const { showWarning } = useToastHelpers();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [progress, setProgress] = useState({
        total_questions: 0,
        completed: 0,
        hint_unlocked: 0,
        pending_answer: 0,
        pending_photo: 0,
        available: 0
    });
    // const [newHintsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadProgress = async () => {
        try {
            const response: TeamProgressResponse = await apiService.getTeamProgress();
            
            // Check for newly globally completed questions
            if (questions.length > 0) {
                const newGloballyCompleted = response.questions.filter(q => 
                    q.status === 'globally_completed' && 
                    !questions.find(oldQ => oldQ.id === q.id && oldQ.status === 'globally_completed')
                );
                
                newGloballyCompleted.forEach(question => {
                    showWarning(
                        'Question Completed by Another Team',
                        `"${question.title}" has been completed by another team and is now locked.`,
                        {
                            label: 'View Question',
                            onClick: () => navigate(`/mission/${question.id}`)
                        }
                    );
                });
            }
            
            setQuestions(response.questions);
            setProgress(response.progress);
            // setNewHintsCount(response.new_hints_count || 0);
            setError('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load progress');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProgress();

        // Refresh every 3 seconds
        const interval = setInterval(loadProgress, 3000);
        return () => clearInterval(interval);
    }, []);



    const handleLogout = () => {
        logoutTeam();
        navigate('/enter');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'completed_by_me':
                return 'bg-purple-500/20 border-purple-400 text-purple-100';
            case 'globally_completed': 
                return 'bg-red-500/20 border-red-400 text-red-100';
            case 'hint_unlocked': return 'bg-blue-500/20 border-blue-400 text-blue-100';
            case 'pending_answer': return 'bg-yellow-500/20 border-yellow-400 text-yellow-100';
            case 'pending_photo': return 'bg-orange-500/20 border-orange-400 text-orange-100';
            case 'rejected': return 'bg-red-500/20 border-red-400 text-red-100';
            default: return 'bg-green-500/20 border-green-400 text-green-100';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
            case 'completed_by_me':
                return 'Completed';
            case 'globally_completed': 
                return 'Solved by Another Team';
            case 'hint_unlocked': return 'Take Photo';
            case 'pending_answer': return 'Answer Pending';
            case 'pending_photo': return 'Photo Pending';
            case 'rejected': return 'Needs Revision';
            default: return 'Available';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0d47a1] to-[#1565c0] flex items-center justify-center">
                <div className="text-white text-xl">Loading Mission Control...</div>
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

            <div className="relative z-10 container mx-auto px-12 py-12">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Mission Control</h1>
                        <p className="text-white/80">Welcome, {teamName}! Monitor your progress and launch missions.</p>
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

                {/* Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-white">
                        <div className="text-3xl font-bold mb-2">{progress.total_questions}</div>
                        <div className="text-white/80">Total Missions</div>
                    </div>

                    <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-400 rounded-xl p-6 text-white">
                        <div className="text-3xl font-bold mb-2">{progress.completed}</div>
                        <div className="text-white/80">Completed</div>
                    </div>

                    <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-400 rounded-xl p-6 text-white">
                        <div className="text-3xl font-bold mb-2">{progress.hint_unlocked}</div>
                        <div className="text-white/80">Take Photos</div>
                    </div>

                    <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400 rounded-xl p-6 text-white">
                        <div className="text-3xl font-bold mb-2">{progress.pending_answer}</div>
                        <div className="text-white/80">Answer Pending</div>
                    </div>
                </div>



                {/* Missions Grid */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Active Missions</h2>
                        <div className="text-white/60 text-sm">
                            Last updated: {new Date().toLocaleTimeString()}
                        </div>
                    </div>

                    {questions.length === 0 ? (
                        <div className="text-center text-white/70 py-8">
                            <p>No active missions available. Check back later!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {questions.map((question) => (
                                <Link
                                    key={question.id}
                                    to={`/mission/${question.id}`}
                                    className={`block border rounded-xl p-4 transition-all transform ${
                                        question.status === 'completed' || question.status === 'completed_by_me'
                                            ? 'bg-purple-500/10 border-purple-400 cursor-default'
                                            : question.status === 'globally_completed'
                                            ? 'bg-red-500/10 border-red-400 cursor-default opacity-75'
                                            : 'bg-white/5 border-white/20 hover:bg-white/10 hover:scale-105'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-white font-semibold text-lg">{question.title}</h3>
                                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(question.status)}`}>
                                            {getStatusText(question.status)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-white/60 text-sm">
                                            Mission #{question.display_order}
                                        </span>
                                        {question.status !== 'completed' && 
                                         question.status !== 'completed_by_me' && 
                                         question.status !== 'globally_completed' && (
                                            <div className="text-white/80 text-sm">
                                                {question.can_submit_answer ? 'Submit Answer' : 
                                                 question.can_submit_photo ? 'Take Photo' : 'Reviewing'}
                                            </div>
                                        )}
                                        {question.status === 'globally_completed' && (
                                            <div className="text-red-300 text-sm flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                Locked
                                            </div>
                                        )}
                                        {(question.status === 'completed' || question.status === 'completed_by_me') && (
                                            <div className="text-purple-300 text-sm flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Completed
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
};

export default MissionControlPage;