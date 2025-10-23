// adminApi.ts
import type { ReviewSubmissionResponse, GetPhotoResponse } from './types';

const ADMIN_API_BASE_URL = 'https://localhost/robo_workshop';

// Helper function to get admin auth headers
const getAdminAuthHeaders = () => {
  const adminToken = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };
};

const handleResponseError = async (response: Response) => {
  const errorText = await response.text();
  let errorData;
  try {
    errorData = JSON.parse(errorText);
  } catch {
    errorData = { error: `Server error: ${response.status}` };
  }
  throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
};

export const adminApiService = {
  // Admin Authentication
  login: async (username: string, password: string): Promise<any> => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/admin_login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error: Could not connect to server');
    }
  },

  checkAuth: async (): Promise<any> => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/admin_check_auth.php`, {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      });
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to check admin authentication');
    }
  },

  logout: async (): Promise<any> => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/admin_logout.php`, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
      });
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to logout');
    }
  },
  getDashboardStats: async (): Promise<any> => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/admin_get_dashboard.php`, {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      });
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch dashboard stats');
    }
  },

  getSubmissions: async (status: string = 'all', page: number = 1): Promise<any> => {
    try {
      const response = await fetch(
        `${ADMIN_API_BASE_URL}/admin_get_submissions.php?status=${status}&page=${page}`, 
        {
          method: 'GET',
          headers: getAdminAuthHeaders(),
        }
      );
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch submissions');
    }
  },
  
  reviewSubmission: async (submissionId: number, action: 'accept' | 'reject', adminNotes: string = '', reviewType: 'answer' | 'photo' = 'answer'): Promise<ReviewSubmissionResponse> => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/admin_review_submission.php`, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({
          submission_id: submissionId,
          action: action,
          admin_notes: adminNotes,
          review_type: reviewType
        }),
      });
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to review submission');
    }
  },

  // Get Photo
  getPhoto: async (submissionId: number): Promise<GetPhotoResponse> => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/admin_get_photo.php?submission_id=${submissionId}`, {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      });
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch photo');
    }
  },

  getTeams: async (): Promise<any> => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/admin_get_teams.php`, {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      });
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch teams');
    }
  },
  getQuestions: async (): Promise<any> => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/admin_get_questions.php`, {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      });
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch questions');
    }
  },

  createQuestion: async (questionData: {
    title: string;
    description_html: string;
    hint: string;
    display_order: number;
  }): Promise<any> => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/admin_create_question.php`, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(questionData),
      });
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create question');
    }
  },

  toggleQuestion: async (questionId: number, isActive: boolean): Promise<any> => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/admin_toggle_question.php`, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({
          question_id: questionId,
          is_active: isActive
        }),
      });
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to toggle question status');
    }
  },
};