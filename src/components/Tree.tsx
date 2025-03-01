import { FC, useState } from 'react';
import { FaFolderClosed, FaFolderOpen } from 'react-icons/fa6';
import { classNames } from '@utils';

interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

type TreeProps = {
  nodes: TreeNode[];
  currentNode: TreeNode;
  onSelect: (tab: TreeNode) => void;
  className?: string;
};

export const Tree: FC<TreeProps> = ({ nodes, currentNode, onSelect, className = '' }) => {
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({});

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!nodes?.length) return;

  return (
    <ul className={classNames('text-sm select-none', className)}>
      {nodes.map((node) => {
        const { id, name, children } = node;
        return (
          <li key={id} className="pl-3 border-l border-gray-400">
            <div
              className={classNames(
                'flex items-center space-x-1 cursor-pointer rounded-md py-1.5 px-2 hover:bg-accent_50',
                currentNode?.id === id ? 'bg-accent text-white' : ''
              )}
              onClick={() => {
                onSelect(node);
              }}
            >
              {children && (
                <span className="mr-2" onClick={() => toggleNode(id)}>
                  {expandedNodes[id] ? <FaFolderOpen className='hover:text-blue-500' /> : <FaFolderClosed className='hover:text-blue-500' />}
                </span>
              )}
              <span>{name}</span>
            </div>
            {children && expandedNodes[id] && <Tree nodes={children} currentNode={currentNode} onSelect={onSelect} />}
          </li>
        );
      })}
    </ul>
  );
};
