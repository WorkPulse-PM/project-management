import axios from 'axios';
import { toast } from 'sonner';
import { STATUS_MESSAGES } from '@/constants/status-messages';
import { ShieldAlert, XIcon } from 'lucide-react';

export const apiBase = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

apiBase.interceptors.request.use(
  req => {
    return req;
  },
  error => {
    return Promise.reject(error);
  }
);

apiBase.interceptors.response.use(
  res => {
    return res;
  },
  error => {
    const status = error?.response?.status;
    const responseMessage = error?.response?.data?.message;

    const message = Array.isArray(responseMessage)
      ? responseMessage[0]
      : responseMessage || STATUS_MESSAGES[status];

    if (message) {
      toast.custom(t => (
        <div className="bg-elevation-level1 border-border flex  items-center justify-between gap-2 rounded-lg border px-3 py-2.5">
          <ShieldAlert className="text-error" size={20} />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-error-text">
              {message?.title || message}
            </p>
            {message?.description && (
              <p className="text-sm font-normal text-error-text">
                {message.description}
              </p>
            )}
          </div>
          <XIcon
            onClick={() => toast.dismiss(t)}
            size={16}
            className="cursor-pointer text-fg-secondary"
          />
        </div>
      ));
    } else {
      toast.error('Something went wrong', {
        description: 'Please try again.',
      });
    }

    return Promise.reject(error);
  }
);
