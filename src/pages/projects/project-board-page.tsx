import BoardHeader from '@/components/projects/board/BoardHeader';
import ProjectBoard from '@/components/projects/board/ProjectBoard';

export default function ProjectBoardPage() {
  return (
    <div className="flex flex-col gap-3">
      <BoardHeader />
      <ProjectBoard />
    </div>
  );
}
