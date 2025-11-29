import axios from 'axios';
import { toast } from 'sonner';
import { STATUS_MESSAGES } from '@/constants/status-messages';
import { ShieldAlert, XIcon } from 'lucide-react';

export const apiBase = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    Accept: 'application/json',
  },
});

apiBase.interceptors.request.use(
  req => {
    console.log('request sent');
    return req;
  },
  error => {
    console.log(error);
    return Promise.reject(error);
  }
);

apiBase.interceptors.response.use(
  res => {
    console.log('response received');
    return res;
  },
  error => {
    const status = error?.response?.status;

    // match status from map
    const message = STATUS_MESSAGES[status];

    if (message) {
      toast.custom(t => (
        <div className="bg-elevation-level1 border-border flex  items-center justify-between gap-2 rounded-lg border px-3 py-2.5">
          <ShieldAlert className="text-error" size={20} />
          <div className="flex flex-col gap-1">
            <p className="text-error-text text-sm font-medium">
              {message.title}
            </p>
            <p className="text-error-text text-sm font-normal">
              {message.description}
            </p>
          </div>
          <XIcon
            onClick={() => toast.dismiss(t)}
            size={16}
            className="text-fg-secondary cursor-pointer"
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
