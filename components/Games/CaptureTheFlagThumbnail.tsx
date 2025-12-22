'use client';

interface CaptureTheFlagThumbnailProps {
  width?: number;
  height?: number;
}

export default function CaptureTheFlagThumbnail({ width = 160, height = 120 }: CaptureTheFlagThumbnailProps) {
  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      background: 'linear-gradient(180deg, #ff0000 0%, #1a1a1a 50%, #0000ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Red flag */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '20px',
        width: '20px',
        height: '30px',
        backgroundColor: '#ff0000',
        border: '2px solid #fff',
        borderRadius: '2px'
      }} />
      {/* Blue flag */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '20px',
        width: '20px',
        height: '30px',
        backgroundColor: '#0000ff',
        border: '2px solid #fff',
        borderRadius: '2px'
      }} />
      {/* Center line */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: '3px',
        backgroundColor: '#fff',
        transform: 'translateX(-50%)'
      }} />
      {/* Player */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '15px',
        height: '15px',
        backgroundColor: '#4a90e2',
        borderRadius: '50%',
        border: '2px solid #fff'
      }} />
    </div>
  );
}



