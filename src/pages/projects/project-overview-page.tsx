'use client';

import StatsCard from '@/components/dashboard/StatsCard';
import { Spinner } from '@/components/ui/spinner';
import { apiBase } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import {
  ListTodo,
  AlertCircle,
  CheckCircle2,
  Users,
  BarChart3,
  Layers,
} from 'lucide-react';
import { useParams } from 'react-router-dom';

type ProjectStats = {
  totalTasks: number;
  tasksByStatus: Array<{ status: string; color: string | null; count: number }>;
  tasksByColumn: Array<{ column: string; color: string | null; count: number }>;
  overdueTasks: number;
  completedTasks: number;
  teamMemberCount: number;
};

export default function ProjectOverviewPage() {
  const { projectId } = useParams();

  // Fetch project stats
  const { data: stats, isPending: isLoadingStats } = useQuery<ProjectStats>({
    queryKey: ['projects', projectId, 'stats'],
    // staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!projectId,
    queryFn: async () => {
      const res = await apiBase.get(`/projects/${projectId}/stats`);
      return res.data;
    },
  });

  if (isLoadingStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-fg-secondary">No stats available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-fg-primary">Project Overview</h2>
        <p className="text-fg-secondary">
          View statistics and insights for this project
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={ListTodo}
          description="All tasks in project"
        />
        <StatsCard
          title="Completed"
          value={stats.completedTasks}
          icon={CheckCircle2}
          description="Tasks completed"
          className="border-success-text/20"
        />
        <StatsCard
          title="Overdue"
          value={stats.overdueTasks}
          icon={AlertCircle}
          description="Needs attention"
          className={stats.overdueTasks > 0 ? 'border-error-text/20' : ''}
        />
        <StatsCard
          title="Team Members"
          value={stats.teamMemberCount}
          icon={Users}
          description="Active members"
        />
      </div>

      {/* Tasks by Status */}
      <div className="rounded-xl border border-border bg-elevation-level1 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="size-5 text-fg-secondary" />
          <h3 className="text-lg font-semibold text-fg-primary">
            Tasks by Status
          </h3>
        </div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {stats.tasksByStatus.map(item => (
            <div
              key={item.status}
              className="flex items-center justify-between p-4 rounded-lg bg-fill1 border border-border"
            >
              <div className="flex items-center gap-3">
                {item.color && (
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <span className="text-sm font-medium text-fg-secondary">
                  {item.status}
                </span>
              </div>
              <span className="text-lg font-bold text-fg-primary">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks by Column */}
      <div className="rounded-xl border border-border bg-elevation-level1 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="size-5 text-fg-secondary" />
          <h3 className="text-lg font-semibold text-fg-primary">
            Tasks by Column
          </h3>
        </div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.tasksByColumn.map(item => (
            <div
              key={item.column}
              className="flex items-center justify-between p-4 rounded-lg bg-fill1 border border-border"
            >
              <div className="flex items-center gap-3">
                {item.color && (
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <span className="text-sm font-medium text-fg-secondary">
                  {item.column}
                </span>
              </div>
              <span className="text-lg font-bold text-fg-primary">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
