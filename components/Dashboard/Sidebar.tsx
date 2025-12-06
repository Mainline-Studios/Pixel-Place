'use client';

import { useEffect, useRef } from 'react';
import { User, Skin } from '@/types';
import { getSkins } from '@/lib/storage';

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const headRef = useRef<HTMLDivElement>(null);
  const torsoRef = useRef<HTMLDivElement>(null);
  const armLeftRef = useRef<HTMLDivElement>(null);
  const armRightRef = useRef<HTMLDivElement>(null);
  const legsRef = useRef<HTMLDivElement>(null);
  const legLeftRef = useRef<HTMLDivElement>(null);
  const legRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const skins = getSkins();
    const skin = skins.find(s => s.id === user.equippedSkin);
    if (!skin) return;

    const setBlockColor = (el: HTMLDivElement | null, color: string) => {
      if (!el) return;
      el.style.background = `linear-gradient(${color}, #1a1d29)`;
      el.style.borderColor = color;
      el.style.boxShadow =
        "inset 0 0 20px rgba(0,0,0,.8)," +
        "0 10px 24px rgba(0,0,0,.9)," +
        "0 0 40px " + color + "55";
    };

    const cHead = skin.colors?.head || "#4a4f66";
    const cTor = skin.colors?.torso || "#4d536f";
    const cArm = skin.colors?.arm || "#3a3f56";
    const cLeg = skin.colors?.legs || "#3a3f56";

    setBlockColor(headRef.current, cHead);
    setBlockColor(torsoRef.current, cTor);
    setBlockColor(armLeftRef.current, cArm);
    setBlockColor(armRightRef.current, cArm);
    setBlockColor(legsRef.current, cLeg);
    setBlockColor(legLeftRef.current, cLeg);
    setBlockColor(legRightRef.current, cLeg);
  }, [user.equippedSkin]);

  return (
    <aside className="sidebar-card">
      <div className="avatar-showcase">
        <div className="figure-wrapper">
          <div className="figure-head" ref={headRef}></div>
          <div className="figure-upper">
            <div className="arm-left" ref={armLeftRef}></div>
            <div className="torso" ref={torsoRef}></div>
            <div className="arm-right" ref={armRightRef}></div>
          </div>
          <div className="figure-legs" ref={legsRef}>
            <div className="leg-left" ref={legLeftRef}></div>
            <div className="leg-gap"></div>
            <div className="leg-right" ref={legRightRef}></div>
          </div>
          <div className="figure-shadow"></div>
        </div>
      </div>
      <div className="info-name">{user.username}</div>
      <div className="info-role">Role: {user.role}</div>
      <div className="info-gender">Gender: {user.gender || 'N/A'}</div>
      <div className="sidebar-sep"></div>
      <div className="sidebar-link">Profile</div>
      <div className="sidebar-link">Inventory</div>
      <div className="sidebar-link">Badges</div>
      <div className="sidebar-link">Messages</div>
    </aside>
  );
}


