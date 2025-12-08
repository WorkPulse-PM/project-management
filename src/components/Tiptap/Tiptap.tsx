import { cn } from '@/lib/utils';
import {
  EditorContent,
  EditorContext,
  useEditor,
  type Content,
  type EditorEvents,
} from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import type { ClassValue } from 'clsx';
import { useMemo } from 'react';
import CustomBubbleMenu from './CustomBubbleMenu';

const Tiptap = ({
  classNames,
  content,
  onUpdate,
}: {
  classNames?: ClassValue;
  content?: Content;
  onUpdate?: (props: EditorEvents['update']) => void;
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm  prose-p:my-0 prose-li:my-1 prose-headings:my-1 max-w-none overflow-auto',
          classNames
        ),
      },
    },
  });

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
