import { getCsrfToken } from './api';

interface UploadResult {
  url: string;
}

interface UploadOptions {
  path: string;
  formData: FormData;
  onProgress: (percent: number) => void;
  signal?: AbortSignal;
}

export function uploadFileWithProgress({
  path,
  formData,
  onProgress,
  signal,
}: UploadOptions): Promise<UploadResult> {
  return new Promise(async (resolve, reject) => {
    try {
      const { token, headerName } = await getCsrfToken();

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api${path}`, true);
      xhr.withCredentials = true;
      xhr.setRequestHeader(headerName, token);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          onProgress(pct);
        }
      };

      if (signal) {
        signal.addEventListener('abort', () => xhr.abort());
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText);
            if (json.success && json.data) {
              resolve(json.data as UploadResult);
            } else {
              reject(new Error(json.message || 'Upload failed'));
            }
          } catch {
            reject(new Error('Invalid server response'));
          }
        } else {
          let msg = `Upload failed (${xhr.status})`;
          try {
            const json = JSON.parse(xhr.responseText);
            msg = json.message || msg;
          } catch {
            // use default msg
          }
          reject(new Error(msg));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.ontimeout = () => reject(new Error('Upload timed out'));
      xhr.send(formData);
    } catch (err) {
      reject(err);
    }
  });
}
