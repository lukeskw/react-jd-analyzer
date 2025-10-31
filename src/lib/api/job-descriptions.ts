import client from "@/lib/api/client";
import type {
  CreateJobResponse,
  JobSummary,
  UploadResumesResponse,
} from "@/lib/api/types";

export const list = async (): Promise<JobSummary[]> => {
  const { data } = await client.get<{ data: JobSummary[] }>("/jds");
  return data.data;
};

export const createJobDescription = async ({
  title,
  file,
}: {
  title: string;
  file: File;
}): Promise<CreateJobResponse> => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("job_description", file);

  const { data } = await client.post<CreateJobResponse>("/jds", formData);
  return data;
};

export const uploadResumes = async ({
  jdId,
  files,
}: {
  jdId: string;
  files: File[];
}): Promise<UploadResumesResponse> => {
  const formData = new FormData();
  for (const file of files) {
    formData.append("resumes[]", file);
  }

  const { data } = await client.post<UploadResumesResponse>(
    `/jds/${jdId}/resumes`,
    formData,
  );
  return data;
};
