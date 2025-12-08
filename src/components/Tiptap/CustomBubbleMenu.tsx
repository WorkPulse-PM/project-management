import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { cn } from '@/lib/utils';
import { useCurrentEditor, useEditorState } from '@tiptap/react';
import {
  Bold,
  ChevronDown,
  Italic,
  Link,
  List,
  ListOrdered,
  Strikethrough,
  Underline,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';

const getActiveStyles = (state?: boolean) => {
  if (!state) return '';
  return 'bg-slate-100 dark:bg-slate-800';
};

const BubbleButton = ({
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
        'rounded-xl h-full aspect-square  ',
        getActiveStyles(isActive)
      )}
      size={'28'}
      color="neutral"
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default function CustomBubbleMenu() {
  const { editor } = useCurrentEditor();
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;

      return {
        isBold: editor.isActive('bold'),
        isItalic: editor.isActive('italic'),
        isUnderline: editor.isActive('underline'),
        isStrike: editor.isActive('strike'),
        isBulletList: editor.isActive('bullet-list'),
      };
    },
  });

  return (
    <div className="bg-bg shadow-md rounded-2xl w-fit p-1 flex items-center gap-1 border-border/40 dark:border-border border">
      <Button
        className="font-normal rounded-xl"
        variant={'ghost'}
        color="neutral"
      >
        Heading 1
        <ChevronDown />
      </Button>

      <Divider orientation="vertical" className="inline-block h-1/2!" />
      <BubbleButton
        isActive={editorState?.isBold}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <Bold />
      </BubbleButton>
      <BubbleButton
        isActive={editorState?.isItalic}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <Italic />
      </BubbleButton>
      <BubbleButton
        isActive={editorState?.isUnderline}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
      >
        <Underline />
      </BubbleButton>
      <BubbleButton
        isActive={editorState?.isStrike}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
      >
        <Strikethrough />
      </BubbleButton>
      <Divider orientation="vertical" className="inline-block h-1/2!" />
      <Button
        variant={'ghost'}
        className="rounded-xl h-full aspect-square"
        size={'28'}
        color="neutral"
      >
        <Link />
      </Button>
      <Divider orientation="vertical" className="inline-block h-1/2!" />
      <Button
        variant={'ghost'}
        className="rounded-xl h-full aspect-square"
        size={'28'}
        color="neutral"
      >
        <ListOrdered />
      </Button>
      <BubbleButton
        isActive={editorState?.isBulletList}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      >
        <List />
      </BubbleButton>
    </div>
  );
}
