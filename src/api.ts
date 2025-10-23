import type { TeamEntryResponse, SubmitPhotoResponse } from './types';

const API_BASE_URL = 'https://api.expertfle.org/robo';
// const API_BASE_URL = 'http://localhost/robo_workshop';


// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('team_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Generic error handler
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

export const apiService = {
  // Team Entry
  enterGame: async (teamCode: string): Promise<TeamEntryResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/enter_game.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ team_code: teamCode }),
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

  // Team Progress & Questions
  getTeamProgress: async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_team_progress.php`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch team progress');
    }
  },

  // Question Details
  getQuestionDetail: async (questionId: number): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_question_detail.php?question_id=${questionId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch question details');
    }
  },

  // Submit Answer
  submitAnswer: async (questionId: number, answer: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/submit_answer.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ question_id: questionId, answer }),
      });
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        // Check for global completion error
        if (error.message.includes('Question has been completed by another team')) {
          throw new Error('This question has been completed by another team and is now locked.');
        }
        throw error;
      }
      throw new Error('Failed to submit answer');
    }
  },

  // Submit Photo
  submitPhoto: async (questionId: number, photoData: string): Promise<SubmitPhotoResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/submit_photo.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          question_id: questionId, 
          photo_data: photoData 
        }),
      });
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        // Check for global completion error
        if (error.message.includes('Question has been completed by another team')) {
          throw new Error('This question has been completed by another team and is now locked.');
        }
        throw error;
      }
      throw new Error('Failed to submit photo');
    }
  },

  // Get Hints
  getHints: async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_hints.php`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        await handleResponseError(response);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch hints');
    }
  },
};