import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import HandwritingBlock from '../HandwritingBlock';

export interface HandwritingNodeOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        handwritingBlock: {
            /**
             * Insert a handwriting block
             */
            insertHandwritingBlock: (attributes?: {
                blockId?: string;
                width?: number;
                height?: number;
            }) => ReturnType;
        };
    }
}

export const HandwritingNode = Node.create<HandwritingNodeOptions>({
    name: 'handwritingBlock',

    group: 'block',

    atom: true, // Cannot be edited as text

    draggable: true,

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            blockId: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-block-id'),
                renderHTML: (attributes) => {
                    if (!attributes.blockId) {
                        return {};
                    }
                    return {
                        'data-block-id': attributes.blockId,
                    };
                },
            },
            width: {
                default: 800,
                parseHTML: (element) => {
                    const width = element.getAttribute('data-width');
                    return width ? parseInt(width, 10) : 800;
                },
                renderHTML: (attributes) => {
                    return {
                        'data-width': attributes.width,
                    };
                },
            },
            height: {
                default: 400,
                parseHTML: (element) => {
                    const height = element.getAttribute('data-height');
                    return height ? parseInt(height, 10) : 400;
                },
                renderHTML: (attributes) => {
                    return {
                        'data-height': attributes.height,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="handwriting-block"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(
                { 'data-type': 'handwriting-block', class: 'handwriting-block' },
                this.options.HTMLAttributes,
                HTMLAttributes
            ),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(HandwritingBlock);
    },

    addCommands() {
        return {
            insertHandwritingBlock:
                (attributes) =>
                    ({ commands }) => {
                        const blockId = attributes?.blockId || `hw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                        const width = attributes?.width || 800;
                        const height = attributes?.height || 400;

                        return commands.insertContent({
                            type: this.name,
                            attrs: {
                                blockId,
                                width,
                                height,
                            },
                        });
                    },
        };
    },
});

export default HandwritingNode;
