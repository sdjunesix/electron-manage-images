import { FC, useState } from 'react';
import { FaFolderClosed, FaFolderOpen } from 'react-icons/fa6';
import { RiDeleteBin6Line, RiPencilFill } from 'react-icons/ri';
import { IoClose, IoCheckmark } from 'react-icons/io5';
import { classNames } from '@utils';
import { Input } from './Input';
import { TreeNode } from '@models/index';

type TreeProps = {
  nodes: TreeNode[];
  currentNode: TreeNode;
  onSelect: (tab: TreeNode) => void;
  className?: string;
  showAction?: boolean;
  quantity?: string | number;
  onUpdate?: (node: TreeNode) => void;
  onDelete?: (node: TreeNode) => void;
};

export const Tree: FC<TreeProps> = ({
  nodes,
  currentNode,
  onSelect,
  className = '',
  showAction = false,
  quantity = null,
  onUpdate,
  onDelete,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({});
  const [inputName, setInputName] = useState<string>('');
  const [editNodeId, setEditNodeId] = useState<string | null>(null);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdate = (node: TreeNode) => {
    onUpdate?.({ 
      ...node,
      path: node?.path?.replace(node?.name, inputName),
      name: inputName 
    })
    setEditNodeId(null);
  };

  if (!nodes?.length) return;

  return (
    <ul className={classNames('text-sm select-none', className)}>
      {nodes.map((node) => {
        let { id, name, type, children } = node;

        if (type !== 'folder') return <></>;

        return (
          <li key={id} className="pl-3 border-l border-line">
            <div
              className={classNames(
                'flex items-center justify-between space-x-2 cursor-pointer rounded-md py-1.5 px-2 hover:bg-accent_50 group',
                currentNode?.id === id ? 'bg-accent text-white' : '',
                editNodeId === id ? 'bg-accent_50' : '',
              )}
              onClick={(e) => {
                onSelect(node);
                toggleNode(id);
              }}
            >
              <div className="flex-1 flex items-center space-x-2 truncate">
                {children && (
                  <span>
                    {expandedNodes[id] ? (
                      <FaFolderOpen className="hover:text-blue-500 w-4 h-4" />
                    ) : (
                      <FaFolderClosed className="hover:text-blue-500" />
                    )}
                  </span>
                )}
                {editNodeId === id ? (
                  <Input
                    value={inputName}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setInputName(e.target.value)}
                    onBlur={() => !!inputName.trim() && handleUpdate(node)}
                    onKeyDown={(e) => e.key === 'Enter' && !!inputName.trim() && handleUpdate(node)}
                    className="!py-0.5 text-black text-xs"
                    autoFocus
                  />
                ) : (
                  <span className="truncate">{name}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {showAction && (
                  <>
                    {editNodeId === id ? (
                      <>
                        <span
                          className={classNames(
                            'px-1 py-1 bg-accent_50 rounded-md',
                            inputName.trim() !== '' ? 'hover:text-green-400' : 'cursor-not-allowed'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!!inputName.trim()) handleUpdate(node);
                          }}
                        >
                          <IoCheckmark className="w-4 h-4" />
                        </span>
                        <span
                          className="px-1 py-1 bg-accent_50 rounded-md hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditNodeId(null);
                            setInputName('');
                          }}
                        >
                          <IoClose className="w-4 h-4" />
                        </span>
                      </>
                    ) : (
                      <span
                        className="px-1 py-1 bg-accent_50 rounded-md opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditNodeId(id);
                          setInputName(name);
                        }}
                      >
                        <RiPencilFill className="w-4 h-4 hover:text-blue-500" />
                      </span>
                    )}
                    <span
                      className="px-1 py-1 bg-accent_50 rounded-md opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(node);
                      }}
                    >
                      <RiDeleteBin6Line className="w-4 h-4 hover:text-red-500" />
                    </span>
                  </>
                )}
                {quantity !== null && quantity !== undefined && (
                  <span className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted_foreground">{quantity}</span>
                )}
              </div>
            </div>
            {children && expandedNodes[id] && (
              <Tree
                nodes={children}
                currentNode={currentNode}
                onSelect={onSelect}
                className={className}
                showAction={showAction}
                quantity={quantity}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};
