import { DragEvent, FC, useEffect, useState } from 'react';
import { FaFolderClosed, FaFolderOpen } from 'react-icons/fa6';
import { RiDeleteBin6Line, RiPencilFill } from 'react-icons/ri';
import { IoMoveSharp } from 'react-icons/io5';
import { IoClose, IoCheckmark } from 'react-icons/io5';
import { classNames } from '@utils';
import { Input } from './Input';
import { TreeNode } from '@models/index';

type TreeDragDropProps = {
  nodes: TreeNode[];
  currentNode: TreeNode;
  onSelect: (tab: TreeNode) => void;
  className?: string;
  showAction?: boolean;
  quantity?: string | number;
  onUpdate?: (node: TreeNode) => void;
  onDelete?: (node: TreeNode) => void;
  onMove?: (node: any, node2: any) => void;
};

export const TreeDragDrop: FC<TreeDragDropProps> = ({
  nodes,
  currentNode,
  onSelect,
  className = '',
  showAction = false,
  quantity = null,
  onUpdate,
  onDelete,
  onMove,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({});
  const [draggedNode, setDraggedNode] = useState<TreeNode | null>(null);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!nodes?.length) return;

  return (
    <ul className={classNames('text-sm select-none', className)}>
      {nodes.map((node: any) => (
        <TreeItem
          key={node.id}
          node={node}
          currentNode={currentNode}
          onSelect={onSelect}
          expandedNodes={expandedNodes}
          toggleNode={toggleNode}
          showAction={showAction}
          quantity={quantity}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onMove={onMove}
          setDraggedNode={setDraggedNode}
          draggedNode={draggedNode}
        />
      ))}
    </ul>
  );
};

type TreeItemProps = {
  node: TreeNode;
  currentNode: TreeNode;
  onSelect: (node: TreeNode) => void;
  expandedNodes: { [key: string]: boolean };
  toggleNode: (id: string) => void;
  showAction: boolean;
  quantity?: string | number;
  onUpdate?: (node: TreeNode) => void;
  onDelete?: (node: TreeNode) => void;
  onMove?: (draggedNode: TreeNode, targetNode: TreeNode) => void;
  setDraggedNode: (node: TreeNode | null) => void;
  draggedNode: TreeNode | null;
};

export const TreeItem: FC<TreeItemProps> = ({
  node,
  currentNode,
  onSelect,
  expandedNodes,
  toggleNode,
  showAction,
  quantity,
  onUpdate,
  onDelete,
  onMove,
  setDraggedNode,
  draggedNode,
}) => {
  const [inputName, setInputName] = useState<string>(node.name);
  const [editNodeId, setEditNodeId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | 'inside' | null>(null);

  let { id, name, type, children } = node;

  const handleUpdate = (node: TreeNode) => {
    onUpdate?.({
      ...node,
      path: node?.path?.replace(node?.name, inputName),
      name: inputName,
    });
    setEditNodeId(null);
  };

  const handleDragStart = (e: DragEvent, node: TreeNode) => {
    e.stopPropagation();
    setDraggedNode(node);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;

    if (offsetY < rect.height / 3) {
      setDropPosition('above');
    } else if (offsetY > (2 * rect.height) / 3) {
      setDropPosition('below');
    } else {
      setDropPosition('inside');
    }
  };

  const handleDrop = (e: DragEvent, targetNode: TreeNode) => {
    e.stopPropagation();
    e.preventDefault();

    if (!draggedNode || draggedNode.id === targetNode.id) return;

    onMove?.(draggedNode, targetNode);
    setDraggedNode(null);
    setDropPosition(null);
  };

  if (type !== 'folder') return <></>;

  return (
    <li
      draggable
      onDragStart={(e) => handleDragStart(e, node)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, node)}
      onDragLeave={() => setDropPosition(null)}
      className="pl-3 border-l border-line relative"
    >
      {dropPosition === 'above' && <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500" />}
      {dropPosition === 'below' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500" />}
      <div
        className={classNames(
          'flex items-center justify-between space-x-2 cursor-pointer rounded-md py-1.5 px-2 hover:bg-accent_50 group',
          currentNode?.id === node.id ? 'bg-accent text-white' : '',
          editNodeId === node.id ? 'bg-accent_50' : ''
        )}
        onClick={() => {
          onSelect(node);
          toggleNode(node.id);
        }}
      >
        <div className="flex-1 flex items-center space-x-2 truncate">
          {node.children && (
            <>
              <span className="block group-hover:hidden">
                {expandedNodes[node.id] ? (
                  <FaFolderOpen className="hover:text-blue-500 w-4 h-4" />
                ) : (
                  <FaFolderClosed className="hover:text-blue-500" />
                )}
              </span>
              {/* <span
                className="hidden group-hover:block"
                ref={(el) => {
                  el && drag(drop(el));
                }}
              >
                <IoMoveSharp />
              </span> */}
            </>
          )}
          {editNodeId === node.id ? (
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
            <span className="truncate">{node.name}</span>
          )}
        </div>
        {showAction && (
          <div className="flex items-center space-x-2">
            {editNodeId === node.id ? (
              <>
                <span
                  className="px-1 py-1 bg-accent_50 rounded-md hover:text-green-400"
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
                onDelete?.(node);
              }}
            >
              <RiDeleteBin6Line className="w-4 h-4 hover:text-red-500" />
            </span>
          </div>
        )}
      </div>
      {/* && expandedNodes[id] */}
      {children && (
        <ul>
          {children.map((child: any) => (
            <TreeItem
              key={child.id}
              node={child}
              currentNode={currentNode}
              onSelect={onSelect}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              showAction={showAction}
              quantity={quantity}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onMove={onMove}
              setDraggedNode={setDraggedNode}
              draggedNode={draggedNode}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
