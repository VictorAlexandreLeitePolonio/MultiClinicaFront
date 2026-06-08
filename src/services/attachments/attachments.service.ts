import api from "@/lib/api";
import { ClinicalAttachment, ClinicalAttachmentType } from "@/types";

interface DownloadUrlResponse {
  url: string;
  expiresInSeconds: number;
}

interface UploadMedicalRecordAttachmentParams {
  patientId: number;
  medicalRecordId: number;
  type: ClinicalAttachmentType;
  file: File;
}

function createFileFormData({
  patientId,
  medicalRecordId,
  type,
  file,
}: UploadMedicalRecordAttachmentParams): FormData {
  const formData = new FormData();
  formData.append("patientId", String(patientId));
  formData.append("medicalRecordId", String(medicalRecordId));
  formData.append("type", type);
  formData.append("file", file);

  return formData;
}

export async function uploadMedicalRecordAttachment(
  params: UploadMedicalRecordAttachmentParams
): Promise<ClinicalAttachment> {
  const response = await api.post<ClinicalAttachment>(
    "/api/attachments",
    createFileFormData(params),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

export async function getAttachmentDownloadUrl(id: number): Promise<string> {
  const response = await api.get<DownloadUrlResponse>(`/api/attachments/${id}/download`);

  return response.data.url;
}
