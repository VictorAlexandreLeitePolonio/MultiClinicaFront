import api from "@/lib/api";

interface UploadResponse {
  url: string;
}

function createFileFormData(file: File): FormData {
  const formData = new FormData();
  formData.append("file", file);

  return formData;
}

export async function uploadMedicalRecordContrato(id: number, file: File): Promise<string> {
  const response = await api.post<UploadResponse>(
    `/api/medicalrecords/${id}/contrato`,
    createFileFormData(file),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.url;
}

export async function uploadMedicalRecordExame(id: number, file: File): Promise<string> {
  const response = await api.post<UploadResponse>(
    `/api/medicalrecords/${id}/exames`,
    createFileFormData(file),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.url;
}
