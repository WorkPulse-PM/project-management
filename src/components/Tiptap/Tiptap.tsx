import { cn } from '@/lib/utils';
import {
  EditorContent,
  EditorContext,
  useEditor,
  type UseEditorOptions,
} from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import type { ClassValue } from 'clsx';
import { useEffect, useMemo } from 'react';
import CustomBubbleMenu from './CustomBubbleMenu';
import CustomFloatingMenu from './CustomFloatingMenu';

const Tiptap = ({
  classNames,
  placeholder = 'Start typing...',
  content,
  ...rest
}: {
  classNames?: ClassValue;
  placeholder?: string;
} & UseEditorOptions) => {
  const extensions = useMemo(
    () => [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    [placeholder]
  );

  const editor = useEditor({
    extensions,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert prose-p:my-0 prose-li:my-1 prose-headings:my-1 max-w-none overflow-auto min-h-[120px] p-3 rounded-md border border-border bg-elevation-level1 transition-all focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 tiptap',
          classNames
        ),
      },
    },
    content,
    immediatelyRender: false,
    ...rest,
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <EditorContext.Provider value={providerValue}>
      <EditorContent editor={editor} />
      <FloatingMenu editor={editor}>
        <CustomFloatingMenu />
      </FloatingMenu>
      <BubbleMenu editor={editor}>
        <CustomBubbleMenu />
      </BubbleMenu>
    </EditorContext.Provider>
  );
};

export default Tiptap;
