import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';

export const TagNode = Node.create({
    name: 'tag',
    group: 'inline',
    inline: true,
    atom: true,

    addAttributes() {
        return {
            label: {
                default: '',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-tag]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { 'data-tag': '' }), HTMLAttributes.label];
    },

    addNodeView() {
        return ReactNodeViewRenderer(({ node, deleteNode }) => {
            return (
                <NodeViewWrapper
                    as="span"
                    className="inline-flex items-center gap-1 bg-[#fef3c7] text-[#d97706] px-2.5 py-1 rounded-full text-[11px] font-bold mx-1 border border-[#fbbf24]/30"
                    contentEditable={false}
                >
                    <span>{node.attrs.label}</span>
                    <button
                        onClick={deleteNode}
                        className="hover:bg-[#d97706]/20 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[11px] leading-none font-bold"
                        contentEditable={false}
                    >
                        ×
                    </button>
                </NodeViewWrapper>
            );
        });
    },
});

