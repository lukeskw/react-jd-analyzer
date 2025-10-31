import client from "@/lib/api/client";
import type { Candidate } from "@/lib/api/types";

export const list = async (jdId: string): Promise<Candidate[]> => {
  const { data } = await client.get<Candidate[]>(`/jds/${jdId}/candidates`);
  return data;
};

export const getOne = async (
  jdId: string,
  candidateId: string,
): Promise<Candidate> => {
  const { data } = await client.get<Candidate>(`/jds/${jdId}/candidates`, {
    params: {
      candidateId,
    },
  });
  return data;
};
