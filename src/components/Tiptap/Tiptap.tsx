import { cn } from '@/lib/utils';
import {
  EditorContent,
  EditorContext,
  useEditor,
  type UseEditorOptions,
} from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import type { ClassValue } from 'clsx';
import { useEffect, useMemo } from 'react';
import CustomBubbleMenu from './CustomBubbleMenu';

const Tiptap = ({
  classNames,
  placeholder = 'Start typing...',
  content,
  ...rest
}: {
  classNames?: ClassValue;
  placeholder?: string;
} & UseEditorOptions) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm prose-p:my-0 prose-li:my-1 prose-headings:my-1 max-w-none overflow-auto min-h-[120px] p-3 rounded-md border border-border bg-elevation-level1 transition-all focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 tiptap',
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
      {/* <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu> */}
      <BubbleMenu editor={editor}>
        <CustomBubbleMenu />
      </BubbleMenu>
    </EditorContext.Provider>
  );
};

export default Tiptap;
