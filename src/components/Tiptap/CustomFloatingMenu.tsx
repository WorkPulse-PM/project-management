import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCurrentEditor, useEditorState } from '@tiptap/react';
import { Heading1, Heading2, Heading3, List, ListOrdered } from 'lucide-react';
import type { PropsWithChildren } from 'react';

const getActiveStyles = (state?: boolean) => {
  if (!state) return '';
  return 'bg-slate-100 dark:bg-slate-800';
};

const FloatingButton = ({
  isActive,
  onClick,
  children,
}: PropsWithChildren<{
  onClick?: VoidFunction;
  isActive?: boolean;
}>) => {
  return (
    <Button
      variant={'ghost'}
      className={cn(
        'rounded-xl h-full aspect-square',
        getActiveStyles(isActive)
      )}
      size={'28'}
      color="neutral"
      onClick={onClick}
      onMouseDown={e => e.preventDefault()} // Prevent focus loss
    >
      {children}
    </Button>
  );
};

export default function CustomFloatingMenu() {
  const { editor } = useCurrentEditor();
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;

      return {
        isH1: editor.isActive('heading', { level: 1 }),
        isH2: editor.isActive('heading', { level: 2 }),
        isH3: editor.isActive('heading', { level: 3 }),
        isBulletList: editor.isActive('bulletList'),
        isOrderedList: editor.isActive('orderedList'),
      };
    },
  });

  if (!editor) return null;

  return (
    <div className="bg-bg shadow-md rounded-2xl w-fit p-1 flex items-center gap-1 border-border/40 dark:border-border border">
      <FloatingButton
        isActive={editorState?.isH1}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 size={18} />
      </FloatingButton>
      <FloatingButton
        isActive={editorState?.isH2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={18} />
      </FloatingButton>
      <FloatingButton
        isActive={editorState?.isH3}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={18} />
      </FloatingButton>
      <FloatingButton
        isActive={editorState?.isBulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={18} />
      </FloatingButton>
      <FloatingButton
        isActive={editorState?.isOrderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={18} />
      </FloatingButton>
    </div>
  );
}
