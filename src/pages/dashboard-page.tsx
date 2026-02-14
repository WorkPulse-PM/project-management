'use client';

import * as React from 'react';
import ProjectCard from '@/components/dashboard/ProjectCard';
import { Button } from '@/components/ui/button';
import NoProjectsYet from '@/components/ui/no-projects.yet';
import { Spinner } from '@/components/ui/spinner';
import { CommandDialog, CommandInput } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiBase } from '@/lib/api';
import type { ProjectCardType } from '@/lib/types/projectTypes';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/components/ui/avatar-group';
import StatsCard from '@/components/dashboard/StatsCard';
import {
  FolderKanban,
  ListTodo,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data, isPending } = useQuery<ProjectCardType[]>({
    queryKey: ['projects', 'list'],
    staleTime: 1000 * 60 * 60, // 1 hour
    queryFn: async () => {
      const res = await apiBase.get<ProjectCardType[]>('/projects');
      return res.data;
    },
  });

  // Fetch dashboard stats
  const { data: stats, isPending: isLoadingStats } = useQuery<{
    totalProjects: number;
    totalTasks: number;
    tasksByStatus: Array<{
      status: string;
      color: string | null;
      count: number;
    }>;
    overdueTasks: number;
  }>({
    queryKey: ['dashboard', 'stats'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      const res = await apiBase.get('/projects/stats');
      return res.data;
    },
  });

  // Filter projects based on search query
  const filteredProjects = React.useMemo(() => {
    if (!searchQuery || !data) return data || [];
    const query = searchQuery.toLowerCase();
    return data.filter(
      project =>
        project.name.toLowerCase().includes(query) ||
        project.key.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Reset search when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  const handleProjectSelect = (projectId: string) => {
    navigate(`/projects/${projectId}`);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-fg-primary">Projects</h2>
          <p>Manage and track your projects</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:ml-auto">
          {/* Search Button */}
          <Button
            variant="outline"
            color="neutral"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2"
          >
            <SearchIcon className="size-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <Button asChild>
            <Link to="/projects/create">
              <PlusIcon />
              Create Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {!isLoadingStats && stats && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={FolderKanban}
            description="Active projects"
          />
          <StatsCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={ListTodo}
            description="Across all projects"
          />
          <StatsCard
            title="Overdue Tasks"
            value={stats.overdueTasks}
            icon={AlertCircle}
            description="Needs attention"
            className={stats.overdueTasks > 0 ? 'border-error-text/20' : ''}
          />
          <StatsCard
            title="Completed"
            value={
              stats.tasksByStatus.find(s => s.status === 'Done')?.count || 0
            }
            icon={CheckCircle2}
            description="Tasks completed"
            className="border-success-text/20"
          />
        </div>
      )}

      {/* Project Grid */}
      {isPending ? (
        <Spinner />
      ) : data?.length === 0 ? (
        <div className="flex justify-center items-center h-[600px]">
          <NoProjectsYet />
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))] grid-rows-[repeat(auto-fill,minmax(auto,1fr))]">
          {data?.map(project => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <ProjectCard {...project} projectKey={project.key} />
            </Link>
          ))}
        </div>
      )}

      {/* 🔍 Command Search with ScrollArea */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search Projects"
        description="Search for projects by name or key"
      >
        <CommandInput
          placeholder="Search projects..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />

        <ScrollArea className="h-[400px] px-1">
          <div className="p-2">
            {filteredProjects.length === 0 ? (
              <div className="py-6 text-center text-sm text-fg-tertiary">
                No projects found.
              </div>
            ) : (
              <div>
                <div className="px-2 py-1.5 text-xs font-medium text-fg-secondary">
                  Projects
                </div>
                <div className="space-y-1">
                  {filteredProjects.map(project => (
                    <div
                      key={project.id}
                      onClick={() => handleProjectSelect(project.id)}
                      className="relative flex cursor-pointer select-none items-center gap-3 rounded-sm px-2.5 py-2 text-sm outline-none hover:bg-fill2-alpha transition-colors"
                    >
                      <Avatar size="24">
                        <AvatarImage src={project.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(project.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium truncate">
                          {project.name}
                        </span>
                        <span className="text-xs text-fg-tertiary">
                          {project.key}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CommandDialog>
    </div>
  );
};

export default DashboardPage;
