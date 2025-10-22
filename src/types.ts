export interface TeamEntryResponse {
  success: boolean;
  message: string;
  team_name: string;
  token: string;
  error?: string;
}

export interface TeamEntryRequest {
  team_code: string;
}

export interface Question {
  id: number;
  title: string;
  description_html: string;
  hint: string; // This will contain either text or image URL
  hint_image_url?: string; // Optional separate image URL field
  display_order: number;
  is_active: boolean;
  status: 'available' | 'pending_answer' | 'hint_unlocked' | 'pending_photo' | 'completed' | 'rejected' | 'globally_completed';
  can_submit_answer: boolean;
  can_submit_photo: boolean;
  answer_status?: 'pending' | 'accepted' | 'rejected';
  photo_status?: 'pending' | 'accepted' | 'rejected';
  photo_filename?: string;
  photo_admin_notes?: string;
  is_globally_completed?: boolean;
  completed_by_team?: string;
  completed_at?: string;
}

export interface Submission {
  id: number;
  team_id: number;
  question_id: number;
  submitted_answer: string;
  status: 'pending' | 'accepted' | 'rejected';
  submitted_at: string;
  admin_notes?: string;
  photo_filename?: string;
  photo_status?: 'pending' | 'accepted' | 'rejected';
  photo_submitted_at?: string;
  photo_admin_notes?: string;
  team_name?: string;
  question_title?: string;
  question_hint?: string;
}

export interface TeamProgressResponse {
  success: boolean;
  team_name: string;
  progress: {
    total_questions: number;
    completed: number;
    hint_unlocked: number;
    pending_answer: number;
    pending_photo: number;
    available: number;
  };
  questions: Question[];
  unlocked_hints?: Array<{
    question_id: number;
    title: string;
    hint: string;
    submitted_at: string;
    photo_status?: 'pending' | 'accepted' | 'rejected';
  }>;
  new_hints_count?: number;
  last_updated?: string;
}

export interface QuestionDetailResponse {
  success: boolean;
  question: {
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
  };
}

export interface SubmitAnswerResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface SubmitPhotoResponse {
  success: boolean;
  message: string;
  filename?: string;
  submission_id?: number;
  error?: string;
}

export interface PhotoSubmission {
  id: number;
  team_name: string;
  question_title: string;
  photo_status: 'pending' | 'accepted' | 'rejected';
  photo_submitted_at: string;
  photo_data: string;
  filename: string;
}

export interface GetPhotoResponse {
  success: boolean;
  submission: PhotoSubmission;
}

export interface ReviewSubmissionRequest {
  submission_id: number;
  action: 'accept' | 'reject';
  admin_notes?: string;
  review_type: 'answer' | 'photo';
}

export interface ReviewSubmissionResponse {
  success: boolean;
  message: string;
  submission_id: number;
  new_status?: 'pending' | 'accepted' | 'rejected';
  new_photo_status?: 'pending' | 'accepted' | 'rejected';
  review_type: 'answer' | 'photo';
  question_completed?: boolean;
}

export interface HintsResponse {
  success: boolean;
  hints: Array<{
    question_id: number;
    title: string;
    hint: string;
    submitted_at: string;
    reviewed_at: string;
    is_new: number;
  }>;
  total_hints: number;
  new_hints_count: number;
  last_updated: string;
}