import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { cn } from '@/lib/utils';
import { useCurrentEditor, useEditorState } from '@tiptap/react';
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
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
        isBulletList: editor.isActive('bulletList'),
        isOrderedList: editor.isActive('orderedList'),
        isLink: editor.isActive('link'),
        isH1: editor.isActive('heading', { level: 1 }),
        isH2: editor.isActive('heading', { level: 2 }),
        isH3: editor.isActive('heading', { level: 3 }),
      };
    },
  });

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div className="bg-bg shadow-md rounded-2xl w-fit p-1 flex items-center gap-1 border-border/40 dark:border-border border">
      <BubbleButton
        isActive={editorState?.isH1}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 size={18} />
      </BubbleButton>
      <BubbleButton
        isActive={editorState?.isH2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={18} />
      </BubbleButton>
      <BubbleButton
        isActive={editorState?.isH3}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={18} />
      </BubbleButton>

      <Divider orientation="vertical" className="inline-block h-1/2!" />
      <BubbleButton
        isActive={editorState?.isBold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={18} />
      </BubbleButton>
      <BubbleButton
        isActive={editorState?.isItalic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={18} />
      </BubbleButton>
      <BubbleButton
        isActive={editorState?.isUnderline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline size={18} />
      </BubbleButton>
      <BubbleButton
        isActive={editorState?.isStrike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={18} />
      </BubbleButton>
      <Divider orientation="vertical" className="inline-block h-1/2!" />
      <BubbleButton isActive={editorState?.isLink} onClick={setLink}>
        <LinkIcon size={18} />
      </BubbleButton>
      <Divider orientation="vertical" className="inline-block h-1/2!" />
      <BubbleButton
        isActive={editorState?.isOrderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={18} />
      </BubbleButton>
      <BubbleButton
        isActive={editorState?.isBulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={18} />
      </BubbleButton>
    </div>
  );
}
