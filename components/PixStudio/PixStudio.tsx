'use client';

import { useState, useRef, useEffect } from 'react';
import { User, PublishedGame, SceneData, SceneObject } from '@/types';
import { getPublished, savePublished, getSceneData, saveSceneData } from '@/lib/storage';
import { apiUrl } from '@/lib/apiBaseUrl';

  // Handle publish
  const handlePublish = async () => {
    if (!publishTitle.trim()) {
      alert('Please enter a game title');
      return;
    }

    // Combine all code files
    let finalCode = '';
    if (codeFiles.length > 0) {
      finalCode = codeFiles.map(f => f.content || '').join('\n\n');
    } else {
      // Generate code from models if no code files
      finalCode = generateCodeFromModels();
    }

    const published: PublishedGame = {
      title: publishTitle,
      desc: publishDescription || '(no description)',
      owner: user.username,
      ts: Date.now(),
      gameCode: finalCode,
      thumbnail: publishThumbnail,
      playable: true,
      multiplayer: false,
      sceneData: {
        objects: modelFiles.flatMap(mf => mf.objects).concat(sceneData.objects)
      }
    };

    const pub = await getPublished();
    pub.push(published);
    await savePublished(pub);
    
    alert(`Game "${publishTitle}" published to Pixel Place!`);
    setShowPublishDialog(false);
    onClose();
  };

  // Generate code from models
  const generateCodeFromModels = () => {
    const allObjects = modelFiles.flatMap(mf => mf.objects).concat(sceneData.objects);
    if (allObjects.length === 0) {
      return `function createGame(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 5);
  scene.add(directionalLight);
  
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
  
  return () => {
    if (container && renderer.domElement) {
      container.removeChild(renderer.domElement);
      renderer.dispose();
    }
  };
}`;
    }

    let code = `function createGame(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(20, 15, 20);
  camera.lookAt(0, 0, 0);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  
  // Baseplate
  const baseplate = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8 })
  );
  baseplate.rotation.x = -Math.PI / 2;
  scene.add(baseplate);
  
`;

    allObjects.forEach((obj) => {
      const pos = obj.position || { x: 0, y: 0, z: 0 };
      const rot = obj.rotation || { x: 0, y: 0, z: 0 };
      const scale = obj.scale || { x: 4, y: 4, z: 4 };
      const color = obj.color || '#4a90e2';
      const hexColor = color.startsWith('#') ? `0x${color.slice(1)}` : '0x4a90e2';

      let geometryCode = '';
      switch (obj.type) {
        case 'box':
          geometryCode = `new THREE.BoxGeometry(${scale.x}, ${scale.y}, ${scale.z})`;
          break;
        case 'sphere':
          geometryCode = `new THREE.SphereGeometry(${scale.x / 2}, 32, 32)`;
          break;
        case 'cylinder':
          geometryCode = `new THREE.CylinderGeometry(${scale.x / 2}, ${scale.x / 2}, ${scale.y}, 32)`;
          break;
        default:
          geometryCode = `new THREE.BoxGeometry(${scale.x}, ${scale.y}, ${scale.z})`;
      }

      code += `  const ${obj.id} = new THREE.Mesh(
    ${geometryCode},
    new THREE.MeshStandardMaterial({ color: ${hexColor}, roughness: 0.7 })
  );
  ${obj.id}.position.set(${pos.x}, ${pos.y}, ${pos.z});
  ${obj.id}.rotation.set(${rot.x}, ${rot.y}, ${rot.z});
  ${obj.id}.castShadow = true;
  scene.add(${obj.id});
  
`;
    });

    code += `  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
  
  return () => {
    if (container && renderer.domElement) {
      container.removeChild(renderer.domElement);
      renderer.dispose();
    }
  };
}`;

    return code;
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPublishThumbnail(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update object property
  const updateObjectProperty = (objId: string, property: string, value: any) => {
    const updateInModel = (mf: ModelFile) => {
      return {
        ...mf,
        objects: mf.objects.map(obj => 
          obj.id === objId ? { ...obj, [property]: value } : obj
        )
      };
    };

    setModelFiles(modelFiles.map(updateInModel));
    
    const updated = {
      objects: sceneData.objects.map(obj => 
        obj.id === objId ? { ...obj, [property]: value } : obj
      )
    };
    setSceneData(updated);
    saveSceneData(updated);
    
    if (selectedObject?.id === objId) {
      setSelectedObject({ ...selectedObject, [property]: value });
    }
  };

  // Delete object
  const deleteObject = (objId: string) => {
    setModelFiles(modelFiles.map(mf => ({
      ...mf,
      objects: mf.objects.filter(obj => obj.id !== objId)
    })));
    
    const updated = {
      objects: sceneData.objects.filter(obj => obj.id !== objId)
    };
    setSceneData(updated);
    saveSceneData(updated);
    setSelectedObject(null);
  };

  // Get all objects for explorer
  const getAllObjects = () => {
    const modelObjects = modelFiles.flatMap(mf => 
      mf.objects.map(obj => ({ ...obj, modelName: mf.name }))
    );
    return modelObjects.concat(sceneData.objects.map(obj => ({ ...obj, modelName: 'Workspace' })));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f3f3f3', // Roblox Studio light grey
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10000,
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '13px'
    }}>
      {/* Top Menu Bar - Roblox Style */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #d0d0d0',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '8px',
        gap: '16px',
        fontSize: '12px',
        color: '#333'
      }}>
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Insert</span>
        <span>Format</span>
        <span>Tools</span>
        <span>Window</span>
        <span>Help</span>
      </div>

      {/* Ribbon Menu - Roblox Style */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #d0d0d0',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '2px', borderRight: '1px solid #d0d0d0', paddingRight: '8px', marginRight: '8px' }}>
          <button
            onClick={() => setActiveTab('home')}
            style={{
              padding: '6px 12px',
              backgroundColor: activeTab === 'home' ? '#0078d4' : 'transparent',
              color: activeTab === 'home' ? '#fff' : '#333',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === 'home' ? '600' : '400'
            }}
          >
            HOME
          </button>
          <button
            onClick={() => setActiveTab('model')}
            style={{
              padding: '6px 12px',
              backgroundColor: activeTab === 'model' ? '#0078d4' : 'transparent',
              color: activeTab === 'model' ? '#fff' : '#333',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === 'model' ? '600' : '400'
            }}
          >
            MODEL
          </button>
          <button
            onClick={() => setActiveTab('test')}
            style={{
              padding: '6px 12px',
              backgroundColor: activeTab === 'test' ? '#0078d4' : 'transparent',
              color: activeTab === 'test' ? '#fff' : '#333',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === 'test' ? '600' : '400'
            }}
          >
            TEST
          </button>
          <button
            onClick={() => setActiveTab('view')}
            style={{
              padding: '6px 12px',
              backgroundColor: activeTab === 'view' ? '#0078d4' : 'transparent',
              color: activeTab === 'view' ? '#fff' : '#333',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === 'view' ? '600' : '400'
            }}
          >
            VIEW
          </button>
          <button
            onClick={() => setActiveTab('code')}
            style={{
              padding: '6px 12px',
              backgroundColor: activeTab === 'code' ? '#0078d4' : 'transparent',
              color: activeTab === 'code' ? '#fff' : '#333',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === 'code' ? '600' : '400'
            }}
          >
            CODE
          </button>
        </div>

        {/* Toolbar Icons */}
        {activeTab !== 'code' && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flex: 1 }}>
            <button
              title="Select"
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✏️
            </button>
            <button
              title="Move"
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ↔️
            </button>
            <button
              title="Scale"
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ⬜
            </button>
            <button
              title="Rotate"
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🔄
            </button>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#d0d0d0', margin: '0 4px' }} />
            <button
              onClick={() => addPart('box')}
              title="Part"
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              📦
            </button>
            <button
              title="Material"
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🎨
            </button>
            <button
              title="Color"
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🎨
            </button>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#d0d0d0', margin: '0 4px' }} />
            <button
              onClick={() => setShowPublishDialog(true)}
              title="Publish"
              style={{
                padding: '4px 12px',
                backgroundColor: '#107c10',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '3px'
              }}
            >
              Publish
            </button>
            <button
              onClick={onClose}
              title="Exit"
              style={{
                padding: '4px 12px',
                backgroundColor: 'transparent',
                color: '#333',
                border: '1px solid #d0d0d0',
                cursor: 'pointer',
                fontSize: '13px',
                borderRadius: '3px',
                marginLeft: '8px'
              }}
            >
              Exit
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel - Toolbox (Build Mode) */}
        {activeTab !== 'code' && (
          <div style={{
            width: '250px',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #d0d0d0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '12px', borderBottom: '1px solid #d0d0d0' }}>
              <div style={{ color: '#333', fontWeight: '600', marginBottom: '8px', fontSize: '13px' }}>TOOLBOX</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                <button
                  onClick={() => setToolboxTab('models')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    backgroundColor: toolboxTab === 'models' ? '#0078d4' : 'transparent',
                    color: toolboxTab === 'models' ? '#fff' : '#333',
                    border: '1px solid #d0d0d0',
                    cursor: 'pointer',
                    fontSize: '11px',
                    borderRadius: '3px'
                  }}
                >
                  Models
                </button>
                <button
                  onClick={() => setToolboxTab('parts')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    backgroundColor: toolboxTab === 'parts' ? '#0078d4' : 'transparent',
                    color: toolboxTab === 'parts' ? '#fff' : '#333',
                    border: '1px solid #d0d0d0',
                    cursor: 'pointer',
                    fontSize: '11px',
                    borderRadius: '3px'
                }}
                >
                  Parts
                </button>
              </div>
              <input
                type="text"
                placeholder="Search..."
                style={{
                  width: '100%',
                  padding: '6px',
                  backgroundColor: '#f9f9f9',
                  color: '#333',
                  border: '1px solid #d0d0d0',
                  borderRadius: '3px',
                  fontSize: '11px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              {toolboxTab === 'parts' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => addPart('box')}
                    style={{
                      padding: '10px',
                      backgroundColor: '#f9f9f9',
                      color: '#333',
                      border: '1px solid #d0d0d0',
                      cursor: 'pointer',
                      fontSize: '12px',
                      borderRadius: '4px',
                      textAlign: 'left'
                    }}
                  >
                    📦 Part (Box)
                  </button>
                  <button
                    onClick={() => addPart('sphere')}
                    style={{
                      padding: '10px',
                      backgroundColor: '#f9f9f9',
                      color: '#333',
                      border: '1px solid #d0d0d0',
                      cursor: 'pointer',
                      fontSize: '12px',
                      borderRadius: '4px',
                      textAlign: 'left'
                    }}
                  >
                    ⚪ Part (Sphere)
                  </button>
                  <button
                    onClick={() => addPart('cylinder')}
                    style={{
                      padding: '10px',
                      backgroundColor: '#f9f9f9',
                      color: '#333',
                      border: '1px solid #d0d0d0',
                      cursor: 'pointer',
                      fontSize: '12px',
                      borderRadius: '4px',
                      textAlign: 'left'
                    }}
                  >
                    🔵 Part (Cylinder)
                  </button>
                </div>
              ) : (
                <div style={{ color: '#888', fontSize: '11px' }}>Browse models from the community</div>
              )}
            </div>
          </div>
        )}

        {/* Center - 3D Viewport (Build) or Code Editor (Code) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f3f3f3', position: 'relative' }}>
          {activeTab === 'code' ? (
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* File Explorer */}
              <div style={{
                width: '200px',
                backgroundColor: '#ffffff',
                borderRight: '1px solid #d0d0d0',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid #d0d0d0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ color: '#333', fontWeight: '600', fontSize: '12px' }}>EXPLORER</div>
                  <button
                    onClick={createNewCodeFile}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#0078d4',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '11px',
                      borderRadius: '3px'
                    }}
                    title="New Script"
                  >
                    +
                  </button>
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
                  {codeFiles.length === 0 ? (
                    <div style={{ color: '#888', fontSize: '11px', fontStyle: 'italic', padding: '8px' }}>
                      No scripts. Click + to create one.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {codeFiles.map((file) => (
                        <div
                          key={file.name}
                          onClick={() => {
                            setSelectedCodeFile(file.name);
                            setCodeContent(file.content);
                          }}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: selectedCodeFile === file.name ? '#0078d4' : 'transparent',
                            color: selectedCodeFile === file.name ? '#fff' : '#333',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>📄</span>
                          <span>{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Code Editor with AI Assistant */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e' }}>
                {selectedCodeFile ? (
                  <>
                    <div style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #3e3e42',
                      backgroundColor: '#2d2d30',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{ color: '#fff', fontSize: '12px' }}>{selectedCodeFile}</div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => setShowAIAssistant(!showAIAssistant)}
                          style={{
                            padding: '4px 12px',
                            backgroundColor: showAIAssistant ? '#0078d4' : '#3e3e42',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '11px',
                            borderRadius: '3px'
                          }}
                          title="AI Coding Assistant"
                        >
                          🤖 AI Help
                        </button>
                        <button
                          onClick={saveCodeFile}
                          style={{
                            padding: '4px 12px',
                            backgroundColor: '#107c10',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '11px',
                            borderRadius: '3px'
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                      <textarea
                        value={codeContent}
                        onChange={(e) => setCodeContent(e.target.value)}
                        style={{
                          flex: showAIAssistant ? 1 : 1,
                          backgroundColor: '#1e1e1e',
                          color: '#d4d4d4',
                          border: 'none',
                          padding: '16px',
                          fontFamily: 'Consolas, "Courier New", monospace',
                          fontSize: '14px',
                          resize: 'none',
                          outline: 'none',
                          lineHeight: '1.6'
                        }}
                        spellCheck={false}
                      />
                      {showAIAssistant && (
                        <div style={{
                          width: '350px',
                          backgroundColor: '#252526',
                          borderLeft: '1px solid #3e3e42',
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '12px'
                        }}>
                          <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>🤖 AI Coding Assistant</h3>
                          <textarea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="What do you need help with? e.g., 'Add a rotating cube' or 'Create a player movement system'"
                            style={{
                              flex: 1,
                              minHeight: '100px',
                              backgroundColor: '#1e1e1e',
                              color: '#d4d4d4',
                              border: '1px solid #3e3e42',
                              padding: '8px',
                              borderRadius: '4px',
                              fontFamily: 'Consolas, monospace',
                              fontSize: '12px',
                              resize: 'none',
                              marginBottom: '8px'
                            }}
                          />
                          <button
                            onClick={handleAIHelp}
                            disabled={aiLoading}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: aiLoading ? '#555' : '#0078d4',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: aiLoading ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              marginBottom: '12px'
                            }}
                          >
                            {aiLoading ? 'Generating...' : 'Get AI Help'}
                          </button>
                          {aiResponse && (
                            <div style={{
                              flex: 1,
                              backgroundColor: '#1e1e1e',
                              border: '1px solid #3e3e42',
                              borderRadius: '4px',
                              padding: '8px',
                              overflow: 'auto',
                              maxHeight: '300px'
                            }}>
                              <div style={{ color: '#4ec9b0', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}>
                                AI Generated Code:
                              </div>
                              <pre style={{
                                color: '#d4d4d4',
                                fontSize: '11px',
                                fontFamily: 'Consolas, monospace',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                margin: 0
                              }}>
                                {aiResponse}
                              </pre>
                              <button
                                onClick={() => {
                                  setCodeContent(codeContent + '\n\n// AI Generated:\n' + aiResponse);
                                  setAiResponse('');
                                  setAiPrompt('');
                                }}
                                style={{
                                  marginTop: '8px',
                                  padding: '6px 12px',
                                  backgroundColor: '#107c10',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  width: '100%'
                                }}
                              >
                                Insert into Code
                              </button>
                            </div>
                          )}
                          <div style={{ color: '#888', fontSize: '10px', marginTop: '8px', fontStyle: 'italic' }}>
                            💡 Tip: Ask for specific features like &quot;add physics&quot; or &quot;create a camera system&quot;                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    color: '#888',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
                    <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: '20px' }}>Code Editor</h2>
                    <div style={{ maxWidth: '600px', lineHeight: '1.8', fontSize: '14px' }}>
                      <p style={{ marginBottom: '12px' }}>
                        <strong style={{ color: '#fff' }}>How to use:</strong>
                      </p>
                      <p style={{ marginBottom: '8px' }}>
                        1. Click the <strong style={{ color: '#0078d4' }}>+</strong> button in Explorer to create a new script
                      </p>
                      <p style={{ marginBottom: '8px' }}>
                        2. Write your game code using Three.js
                      </p>
                      <p style={{ marginBottom: '8px' }}>
                        3. Your code must export a <code style={{ color: '#4ec9b0' }}>createGame(container)</code> function
                      </p>
                      <p style={{ marginBottom: '8px' }}>
                        4. <strong style={{ color: '#fff' }}>THREE</strong> is automatically available - no imports needed
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              ref={viewportRef}
              style={{
                flex: 1,
                backgroundColor: '#87CEEB',
                position: 'relative'
              }}
            />
          )}
        </div>

        {/* Right Panel - Explorer & Properties */}
        {activeTab !== 'code' && (
          <div style={{
            width: '300px',
            backgroundColor: '#ffffff',
            borderLeft: '1px solid #d0d0d0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Explorer */}
            <div style={{ flex: 1, borderBottom: '1px solid #d0d0d0', overflow: 'auto' }}>
              <div style={{
                padding: '8px 12px',
                borderBottom: '1px solid #d0d0d0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ color: '#333', fontWeight: '600', fontSize: '12px' }}>EXPLORER</div>
                <button
                  onClick={createNewModel}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#0078d4',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '11px',
                    borderRadius: '3px'
                  }}
                  title="New Model"
                >
                  +
                </button>
              </div>
              <div style={{ padding: '8px', fontSize: '11px', color: '#333' }}>
                <div
                  onClick={() => setExplorerExpanded({ ...explorerExpanded, Workspace: !explorerExpanded.Workspace })}
                  style={{ marginBottom: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>{explorerExpanded.Workspace ? '▼' : '▶'}</span>
                  <span>📁 Workspace</span>
                </div>
                {explorerExpanded.Workspace && (
                  <div style={{ marginLeft: '20px' }}>
                    <div style={{ marginBottom: '4px' }}>📄 Baseplate</div>
                    {getAllObjects().map((obj) => (
                      <div
                        key={obj.id}
                        onClick={() => setSelectedObject(obj)}
                        style={{
                          marginBottom: '4px',
                          padding: '2px 4px',
                          backgroundColor: selectedObject?.id === obj.id ? '#0078d4' : 'transparent',
                          color: selectedObject?.id === obj.id ? '#fff' : '#333',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        📄 {obj.id}
                      </div>
                    ))}
                  </div>
                )}
                {modelFiles.map((mf) => (
                  <div key={mf.id} style={{ marginTop: '8px' }}>
                    <div
                      onClick={() => setExplorerExpanded({ ...explorerExpanded, [mf.id]: !explorerExpanded[mf.id] })}
                      style={{ marginBottom: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>{explorerExpanded[mf.id] ? '▼' : '▶'}</span>
                      <span>📦 {mf.name}</span>
                    </div>
                    {explorerExpanded[mf.id] && (
                      <div style={{ marginLeft: '20px' }}>
                        {mf.objects.map((obj) => (
                          <div
                            key={obj.id}
                            onClick={() => setSelectedObject(obj)}
                            style={{
                              marginBottom: '4px',
                              padding: '2px 4px',
                              backgroundColor: selectedObject?.id === obj.id ? '#0078d4' : 'transparent',
                              color: selectedObject?.id === obj.id ? '#fff' : '#333',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            📄 {obj.id}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Properties */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              <div style={{
                padding: '8px 12px',
                borderBottom: '1px solid #d0d0d0',
                color: '#333',
                fontWeight: '600',
                fontSize: '12px'
              }}>
                PROPERTIES
              </div>
              {selectedObject ? (
                <div style={{ padding: '12px', fontSize: '12px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', color: '#333', marginBottom: '4px' }}>Position</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="number"
                        value={selectedObject.position?.x || 0}
                        onChange={(e) => updateObjectProperty(selectedObject.id, 'position', { ...selectedObject.position, x: parseFloat(e.target.value) || 0 })}
                        style={{
                          flex: 1,
                          padding: '6px',
                          backgroundColor: '#f9f9f9',
                          color: '#333',
                          border: '1px solid #d0d0d0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                        placeholder="X"
                      />
                      <input
                        type="number"
                        value={selectedObject.position?.y || 0}
                        onChange={(e) => updateObjectProperty(selectedObject.id, 'position', { ...selectedObject.position, y: parseFloat(e.target.value) || 0 })}
                        style={{
                          flex: 1,
                          padding: '6px',
                          backgroundColor: '#f9f9f9',
                          color: '#333',
                          border: '1px solid #d0d0d0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                        placeholder="Y"
                      />
                      <input
                        type="number"
                        value={selectedObject.position?.z || 0}
                        onChange={(e) => updateObjectProperty(selectedObject.id, 'position', { ...selectedObject.position, z: parseFloat(e.target.value) || 0 })}
                        style={{
                          flex: 1,
                          padding: '6px',
                          backgroundColor: '#f9f9f9',
                          color: '#333',
                          border: '1px solid #d0d0d0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                        placeholder="Z"
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', color: '#333', marginBottom: '4px' }}>Size</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="number"
                        value={selectedObject.scale?.x || 4}
                        onChange={(e) => updateObjectProperty(selectedObject.id, 'scale', { ...selectedObject.scale, x: parseFloat(e.target.value) || 4 })}
                        style={{
                          flex: 1,
                          padding: '6px',
                          backgroundColor: '#f9f9f9',
                          color: '#333',
                          border: '1px solid #d0d0d0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                        placeholder="X"
                      />
                      <input
                        type="number"
                        value={selectedObject.scale?.y || 4}
                        onChange={(e) => updateObjectProperty(selectedObject.id, 'scale', { ...selectedObject.scale, y: parseFloat(e.target.value) || 4 })}
                        style={{
                          flex: 1,
                          padding: '6px',
                          backgroundColor: '#f9f9f9',
                          color: '#333',
                          border: '1px solid #d0d0d0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                        placeholder="Y"
                      />
                      <input
                        type="number"
                        value={selectedObject.scale?.z || 4}
                        onChange={(e) => updateObjectProperty(selectedObject.id, 'scale', { ...selectedObject.scale, z: parseFloat(e.target.value) || 4 })}
                        style={{
                          flex: 1,
                          padding: '6px',
                          backgroundColor: '#f9f9f9',
                          color: '#333',
                          border: '1px solid #d0d0d0',
                          borderRadius: '3px',
                          fontSize: '11px'
                        }}
                        placeholder="Z"
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', color: '#333', marginBottom: '4px' }}>Color</label>
                    <input
                      type="color"
                      value={selectedObject.color || '#4a90e2'}
                      onChange={(e) => updateObjectProperty(selectedObject.id, 'color', e.target.value)}
                      style={{
                        width: '100%',
                        height: '32px',
                        border: '1px solid #d0d0d0',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <button
                    onClick={() => deleteObject(selectedObject.id)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#d32f2f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div style={{ padding: '12px', color: '#888', fontSize: '11px', fontStyle: 'italic' }}>
                  Select an object to view properties
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Publish Dialog */}
      {showPublishDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '90vw',
            border: '1px solid #d0d0d0'
          }}>
            <h2 style={{ color: '#333', marginBottom: '16px', fontSize: '18px' }}>Publish to Pixel Place</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#333', marginBottom: '8px', fontSize: '14px' }}>
                Game Title *
              </label>
              <input
                type="text"
                value={publishTitle}
                onChange={(e) => setPublishTitle(e.target.value)}
                placeholder="Enter game title..."
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#f9f9f9',
                  color: '#333',
                  border: '1px solid #d0d0d0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#333', marginBottom: '8px', fontSize: '14px' }}>
                Game Description
              </label>
              <textarea
                value={publishDescription}
                onChange={(e) => setPublishDescription(e.target.value)}
                placeholder="Describe your game..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#f9f9f9',
                  color: '#333',
                  border: '1px solid #d0d0d0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#333', marginBottom: '8px', fontSize: '14px' }}>
                Thumbnail Image
              </label>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => thumbnailInputRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0078d4',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {publishThumbnail ? 'Change Thumbnail' : 'Upload Thumbnail'}
              </button>
              {publishThumbnail && (
                <img
                  src={publishThumbnail}
                  alt="Thumbnail preview"
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    marginTop: '8px',
                    borderRadius: '4px'
                  }}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowPublishDialog(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#333',
                  border: '1px solid #d0d0d0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#107c10',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
