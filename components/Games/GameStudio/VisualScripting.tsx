'use client';

import React, { useState } from 'react';
import ModernCard from '../../RobloxStyle/ModernCard';
import ModernButton from '../../RobloxStyle/ModernButton';

/**
 * Visual Scripting System
 * Node-based scripting for non-coders
 * This is how we beat Roblox - easier scripting
 */

export interface VisualNode {
  id: string;
  type: 'event' | 'action' | 'logic' | 'value';
  name: string;
  position: { x: number; y: number };
  connections: string[]; // Connected node IDs
  data: Record<string, any>;
}

export interface VisualScript {
  id: string;
  name: string;
  nodes: VisualNode[];
}

const NODE_TYPES = {
  event: [
    { id: 'on_update', name: 'On Update', icon: '🔄' },
    { id: 'on_touch', name: 'On Touch', icon: '👆' },
    { id: 'on_interact', name: 'On Interact', icon: '🖱️' },
    { id: 'on_timer', name: 'On Timer', icon: '⏱️' }
  ],
  action: [
    { id: 'move', name: 'Move Object', icon: '➡️' },
    { id: 'rotate', name: 'Rotate Object', icon: '🔄' },
    { id: 'set_color', name: 'Set Color', icon: '🎨' },
    { id: 'spawn', name: 'Spawn Object', icon: '➕' },
    { id: 'destroy', name: 'Destroy Object', icon: '❌' }
  ],
  logic: [
    { id: 'if', name: 'If Condition', icon: '❓' },
    { id: 'compare', name: 'Compare', icon: '⚖️' },
    { id: 'timer', name: 'Timer', icon: '⏱️' },
    { id: 'delay', name: 'Delay', icon: '⏸️' }
  ],
  value: [
    { id: 'number', name: 'Number', icon: '🔢' },
    { id: 'vector', name: 'Vector3', icon: '📍' },
    { id: 'color', name: 'Color', icon: '🎨' }
  ]
};

export default function VisualScripting({ 
  objectId, 
  onSave 
}: { 
  objectId: string; 
  onSave: (script: string) => void;
}) {
  const [nodes, setNodes] = useState<VisualNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<VisualNode | null>(null);

  const addNode = (type: string, category: 'event' | 'action' | 'logic' | 'value') => {
    const nodeType = NODE_TYPES[category].find(n => n.id === type);
    if (!nodeType) return;

    const newNode: VisualNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: category,
      name: nodeType.name,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      connections: [],
      data: { nodeType: type }
    };

    setNodes(prev => [...prev, newNode]);
  };

  const compileToScript = (): string => {
    // Find event nodes
    const eventNodes = nodes.filter(n => n.type === 'event');
    
    if (eventNodes.length === 0) {
      return '// No events defined';
    }

    let code = '';

    eventNodes.forEach(eventNode => {
      const eventName = eventNode.data.nodeType;
      const connectedNodes = nodes.filter(n => eventNode.connections.includes(n.id));

      code += 'function ' + eventName + '(api, delta) {\n';
      
      connectedNodes.forEach(node => {
        switch (node.data.nodeType) {
          case 'move':
            code += '  const pos = api.get_position();\n';
            code += '  pos.x += ' + (node.data.x || 0) + ' * delta;\n';
            code += '  pos.y += ' + (node.data.y || 0) + ' * delta;\n';
            code += '  pos.z += ' + (node.data.z || 0) + ' * delta;\n';
            code += '  api.move_object(pos);\n';
            break;
          case 'rotate':
            code += '  // Rotate object\n';
            break;
          case 'set_color':
            code += '  api.set_color(\'' + (node.data.color || '#ff6b6b') + '\');\n';
            break;
          default:
            break;
        }
      });

      code += '}\n\n';
    });

    return code;
  };

  return (
    <ModernCard variant="elevated" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>🎨 Visual Scripting</h3>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '12px', marginBottom: '4px', color: '#bdc3c7' }}>Events</div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {NODE_TYPES.event.map(node => (
              <ModernButton
                key={node.id}
                onClick={() => addNode(node.id, 'event')}
                variant="primary"
                size="small"
              >
                {node.icon} {node.name}
              </ModernButton>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', marginBottom: '4px', color: '#bdc3c7' }}>Actions</div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {NODE_TYPES.action.map(node => (
              <ModernButton
                key={node.id}
                onClick={() => addNode(node.id, 'action')}
                variant="success"
                size="small"
              >
                {node.icon} {node.name}
              </ModernButton>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', marginBottom: '4px', color: '#bdc3c7' }}>Logic</div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {NODE_TYPES.logic.map(node => (
              <ModernButton
                key={node.id}
                onClick={() => addNode(node.id, 'logic')}
                variant="warning"
                size="small"
              >
                {node.icon} {node.name}
              </ModernButton>
            ))}
          </div>
        </div>
      </div>

      {/* Node Canvas (simplified - full implementation would use a graph library) */}
      <div style={{
        flex: 1,
        background: '#1a1a1a',
        borderRadius: '8px',
        padding: '20px',
        position: 'relative',
        minHeight: '400px',
        overflow: 'auto'
      }}>
        {nodes.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            Add nodes from above to create your script
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {nodes.map(node => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{
                  padding: '12px',
                  background: selectedNode?.id === node.id ? 'rgba(0,162,255,0.3)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: selectedNode?.id === node.id ? '2px solid #00a2ff' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ fontWeight: '600' }}>{node.name}</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  {node.type} • {node.connections.length} connections
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <ModernButton
          onClick={() => {
            const compiled = compileToScript();
            onSave(compiled);
          }}
          variant="success"
          size="medium"
        >
          Compile & Save
        </ModernButton>
        <ModernButton
          onClick={() => setNodes([])}
          variant="secondary"
          size="medium"
        >
          Clear
        </ModernButton>
      </div>
    </ModernCard>
  );
}
