import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/text-area';
import { apiBase } from '@/lib/api';
import { generateProjectKey } from '@/lib/generateProjectKey';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Camera, Loader2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '../ui/avatar-group';

export const FormSchema = z.object({
  name: z.string().trim().nonempty('Project name is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  key: z
    .string()
    .max(5, {
      error: 'Key cannot be more than 5 characters',
    })
    .regex(/^[A-Z0-9]+$/, {
      error: 'Key can only contain uppercase letters and numbers',
    })
    .optional(),
});

export type CreateProjectFormValues = z.infer<typeof FormSchema>;

const CreateProjectForm = ({
  isLoading,
  onSubmit,
}: {
  isLoading?: boolean;
  onSubmit: (values: CreateProjectFormValues) => Promise<any>;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(FormSchema),
    disabled: isLoading,
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      key: '',
      image: '',
    },
  });

  const name = form.watch('name');

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const { data: presignedData } = await apiBase.get(`/files/presigned-url`);

      const { url, key, publicUrl } = presignedData;

      await axios.put(url, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      form.setValue('image', key);
      setLogoPreviewUrl(publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload project logo');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const cb = form.subscribe({
      name: 'name',
      formState: {
        values: true,
      },
      callback: ({ values }) => {
        form.setValue('key', generateProjectKey(values.name));
        form.clearErrors('key');
      },
    });

    return () => cb();
  }, [form.subscribe]);

  return (
    <div className="w-full mt-[15%]">
      <div className="max-w-md gap-6 p-4 mx-auto border rounded-md">
        <h2 className="text-2xl font-bold text-fg">Create New Project</h2>
        <Divider className="my-4" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <div className="relative group">
                    <Avatar
                      className="w-24 h-24 border-2 cursor-pointer border-border"
                      onClick={handleImageClick}
                    >
                      <AvatarImage
                        src={logoPreviewUrl}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xl">
                        {getInitials(name)}
                      </AvatarFallback>
                      <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black/50 rounded-full opacity-0 group-hover:opacity-100">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </Avatar>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                        <Loader2 className="w-8 h-8 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-medium mb-2">Upload Project Logo</h3>
                    <p className="text-sm text-fg-tertiary">
                      Click the image to upload a logo. JPG, GIF or PNG. Max
                      size of 5MB.
                    </p>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          size="36"
                          type="text"
                          {...field}
                          placeholder="e.g. Slack Redesign"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <TextArea
                          placeholder="UI overhaul and performance tuning for Slack’s workspace client."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key</FormLabel>
                      <FormControl>
                        <Input
                          size="36"
                          type="text"
                          {...field}
                          placeholder="e.g. SR"
                        />
                      </FormControl>
                      <FormDescription>
                        This project key will be used to prefix all tasks in the
                        project. E.g. SR-123
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="w-full"
                  type="button"
                  color="neutral"
                  variant={'soft'}
                  asChild
                >
                  <Link to={'/'}>Cancel</Link>
                </Button>
                <Button
                  className="w-full"
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateProjectForm;
