import ProjectCard from '@/components/dashboard/ProjectCard';
import { Button } from '@/components/ui/button';
import NoProjectsYet from '@/components/ui/no-projects.yet';
import { Spinner } from '@/components/ui/spinner';
import { apiBase } from '@/lib/api';
import type { ProjectCardType } from '@/lib/types/projectTypes';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { data, isPending } = useQuery({
    queryKey: ['projects', 'list'],
    staleTime: 1000 * 60 * 60, // 1 hour
    queryFn: async () => {
      const res = await apiBase.get<ProjectCardType[]>('/projects');
      return res.data;
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-start justify-between gap-y-4 sm:flex-row">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-fg-primary">Projects</h2>
          <p>Manage and track your projects</p>
        </div>
        <Button className="ml-auto" asChild>
          <Link to={'/projects/create'}>
            <PlusIcon />
            Create Project
          </Link>
        </Button>
      </div>
      {isPending ? (
        <Spinner />
      ) : data?.length === 0 ? (
        <div className="flex justify-center items-center h-[600px]">
          <NoProjectsYet />
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))] grid-rows-[repeat(auto-fill,minmax(auto,1fr))]">
          {data?.map(project => (
            <Link to={`/projects/${project.id}`}>
              <ProjectCard {...project} projectKey={project.key} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
