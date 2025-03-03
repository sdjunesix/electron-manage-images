import { DragEvent, FC, useEffect, useState } from 'react';
import { FaFolderClosed, FaFolderOpen } from 'react-icons/fa6';
import { RiDeleteBin6Line, RiPencilFill } from 'react-icons/ri';
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
  onMove?: (draggedNode: TreeNode, targetNode: TreeNode, position: 'above' | 'below' | 'inside') => void;
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

  if (!nodes?.length) return null;

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
  onMove?: (draggedNode: TreeNode, targetNode: TreeNode, position: 'above' | 'below' | 'inside') => void;
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
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

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
    if (type !== 'folder') return; // Only allow dragging folders

    setDraggedNode(node);
    // Add data to the drag event
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: node.id, type: node.type }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedNode || draggedNode.id === node.id) {
      setDropPosition(null);
      return;
    }

    setIsDragOver(true);

    // Only allow dropping on folders
    if (type !== 'folder') {
      setDropPosition(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;

    if (offsetY < rect.height / 4) {
      setDropPosition('above');
    } else if (offsetY > (3 * rect.height) / 4) {
      setDropPosition('below');
    } else {
      setDropPosition('inside');
    }
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDropPosition(null);
  };

  const handleDrop = (e: DragEvent, targetNode: TreeNode) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragOver(false);

    if (!draggedNode || draggedNode.id === targetNode.id) {
      setDropPosition(null);
      return;
    }

    // Only allow dropping on folders
    if (type !== 'folder') {
      setDropPosition(null);
      return;
    }

    if (dropPosition && onMove) {
      onMove(draggedNode, targetNode, dropPosition);
    }

    setDraggedNode(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedNode(null);
    setDropPosition(null);
    setIsDragOver(false);
  };

  if (type !== 'folder') return null;

  return (
    <li
      draggable={type === 'folder' && name !== 'Unassigned'}
      onDragStart={(e) => handleDragStart(e, node)}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, node)}
      onDragEnd={handleDragEnd}
      className={classNames('pl-3 border-l border-line relative', isDragOver ? 'bg-blue-50' : '')}
    >
      {dropPosition === 'above' && <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500" />}
      {dropPosition === 'inside' && <div className="absolute inset-0 border-2 border-blue-500 rounded-md opacity-30" />}
      {dropPosition === 'below' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500" />}
      <div
        className={classNames(
          'flex items-center justify-between space-x-2 cursor-pointer rounded-md py-1.5 px-2 hover:bg-accent_50 group',
          currentNode?.id === id ? 'bg-accent text-white' : '',
          editNodeId === id ? 'bg-accent_50' : ''
        )}
        onClick={() => {
          onSelect(node);
          toggleNode(id);
        }}
      >
        <div className="flex-1 flex items-center space-x-2 truncate">
          <span className="">
            {expandedNodes[id] ? (
              <FaFolderOpen className="hover:text-blue-500 w-4 h-4" />
            ) : (
              <FaFolderClosed className="hover:text-blue-500 w-4 h-4" />
            )}
          </span>
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
        {showAction && name !== 'Unassigned' && (
          <div className="flex items-center space-x-2">
            {editNodeId === id ? (
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
      {children && expandedNodes[id] && (
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
