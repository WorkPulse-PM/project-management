import ProjectCard from '@/components/dashboard/ProjectCard';
import { Button } from '@/components/ui/button';
import { dummyProjects } from '@/lib/dummyData';
import { PlusIcon } from 'lucide-react';

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-start justify-between gap-y-4 sm:flex-row">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-fg-primary">Projects</h2>
          <p>Manage and track your projects</p>
        </div>
        <Button className="ml-auto">
          <PlusIcon />
          Create Project
        </Button>
      </div>
      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        {dummyProjects.map(project => (
          <ProjectCard {...project} />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
