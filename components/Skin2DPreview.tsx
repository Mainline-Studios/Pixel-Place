'use client';
 
import { Skin } from '@/types';
 
interface Skin2DPreviewProps {
  skin: Skin;
  width?: number;
  height?: number;
}
 
const DEFAULT_COLORS = {
  head: '#f4c2a1',
  torso: '#4d536f',
  arm: '#3a3f56',
  legs: '#3a3f56'
};
 
 export default function Skin2DPreview({ skin, width = 80, height = 80 }: Skin2DPreviewProps) {
   const colors = {
     head: skin.colors?.head || DEFAULT_COLORS.head,
     torso: skin.colors?.torso || DEFAULT_COLORS.torso,
     arm: skin.colors?.arm || DEFAULT_COLORS.arm,
     legs: skin.colors?.legs || DEFAULT_COLORS.legs
   };
 
   return (
     <div
       style={{
         width,
         height,
         borderRadius: '8px',
         background: 'rgba(0, 0, 0, 0.3)',
         boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         position: 'relative',
         overflow: 'hidden'
       }}
     >
       <div style={{ width: '60%', height: '80%', position: 'relative' }}>
         <div
           style={{
             position: 'absolute',
             top: '0%',
             left: '30%',
             width: '40%',
             height: '28%',
             background: colors.head,
             borderRadius: '4px'
           }}
         />
         <div
           style={{
             position: 'absolute',
             top: '28%',
             left: '25%',
             width: '50%',
             height: '34%',
             background: colors.torso,
             borderRadius: '4px'
           }}
         />
         <div
           style={{
             position: 'absolute',
             top: '28%',
             left: '6%',
             width: '16%',
             height: '34%',
             background: colors.arm,
             borderRadius: '4px'
           }}
         />
         <div
           style={{
             position: 'absolute',
             top: '28%',
             right: '6%',
             width: '16%',
             height: '34%',
             background: colors.arm,
             borderRadius: '4px'
           }}
         />
         <div
           style={{
             position: 'absolute',
             top: '66%',
             left: '26%',
             width: '18%',
             height: '32%',
             background: colors.legs,
             borderRadius: '4px'
           }}
         />
         <div
           style={{
             position: 'absolute',
             top: '66%',
             right: '26%',
             width: '18%',
             height: '32%',
             background: colors.legs,
             borderRadius: '4px'
           }}
         />
       </div>
     </div>
   );
 }
