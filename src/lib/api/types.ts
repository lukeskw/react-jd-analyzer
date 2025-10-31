export interface JobSummary {
  jd_id: string;
  title: string;
  candidate_count: number;
}

export interface CreateJobResponse {
  jd_id: string;
  title: string;
}

export interface UploadResumesResponse {
  jd_id: string;
  queued_count: number;
  batch_id?: string;
}

export interface Candidate {
  id: string;
  candidate_name?: string;
  candidate_email?: string;
  fit_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  evidence: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
