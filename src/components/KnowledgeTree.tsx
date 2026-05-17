import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { Network, ZoomIn, ZoomOut } from 'lucide-react';

export function KnowledgeTree() {
  const { savedArticles } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const width = window.innerWidth;
    const height = 400; // Fixed height in this view
    
    // Support Retina
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Clear
    ctx.clearRect(0, 0, width, height);

    if (savedArticles.length === 0) {
       ctx.fillStyle = '#737373';
       ctx.font = '14px sans-serif';
       ctx.textAlign = 'center';
       ctx.fillText('Save articles to nurture your knowledge tree.', width/2, height/2);
       return;
    }

    // Generate positions for nodes pseudo-randomly but deterministically based on ID to group categories
    const categories = Array.from(new Set(savedArticles.map(a => a.category || 'General')));
    
    interface Node { x: number; y: number; r: number; color: string; label: string; catIdx: number }
    const nodes: Node[] = [];
    
    const colors = ['#2dd4bf', '#fbbf24', '#f87171', '#a78bfa', '#60a5fa', '#34d399'];

    savedArticles.forEach((article, i) => {
       const catIdx = categories.indexOf(article.category || 'General');
       // distribute nodes around a category center
       const catAngle = (catIdx / categories.length) * Math.PI * 2;
       const catRad = 100 * scale;
       const catX = width/2 + Math.cos(catAngle) * catRad;
       const catY = height/2 + Math.sin(catAngle) * catRad;
       
       const nodeAngle = i * (Math.PI * 2 / 5);
       const nodeRad = 30 + (i % 3) * 20 * scale;
       
       nodes.push({
          x: catX + Math.cos(nodeAngle) * nodeRad,
          y: catY + Math.sin(nodeAngle) * nodeRad,
          r: 6 * scale,
          color: colors[catIdx % colors.length],
          label: article.title,
          catIdx
       });
    });

    // Draw Edges (connect nodes of same category)
    ctx.lineWidth = 1;
    nodes.forEach((n1, i) => {
       nodes.forEach((n2, j) => {
          if (i < j && n1.catIdx === n2.catIdx) {
             const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
             if (dist < 100 * scale) {
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.strokeStyle = n1.color + '40'; // 25% opacity
                ctx.stroke();
             }
          }
       });
    });
    
    // Connect categories to center "Brain" node
    ctx.beginPath();
    ctx.arc(width/2, height/2, 12 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    categories.forEach((cat, idx) => {
       const catAngle = (idx / categories.length) * Math.PI * 2;
       const catX = width/2 + Math.cos(catAngle) * 50 * scale;
       const catY = height/2 + Math.sin(catAngle) * 50 * scale;
       
       ctx.beginPath();
       ctx.moveTo(width/2, height/2);
       ctx.lineTo(catX, catY);
       ctx.strokeStyle = '#ffffff20';
       ctx.stroke();
       
       // Draw category label
       ctx.fillStyle = colors[idx % colors.length];
       ctx.font = `bold ${10 * scale}px sans-serif`;
       ctx.fillText(cat.toUpperCase(), catX + 10, catY + 5);
    });

    // Draw Nodes
    nodes.forEach(n => {
       ctx.beginPath();
       ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
       ctx.fillStyle = n.color;
       ctx.fill();
       
       // Draw labels for some nodes to avoid clutter
       if (scale > 1.2 || Math.random() > 0.5) {
          ctx.fillStyle = '#a3a3a3';
          ctx.font = `${8 * scale}px sans-serif`;
          ctx.fillText(n.label.substring(0, 15) + (n.label.length > 15 ? '...' : ''), n.x + 8, n.y + 3);
       }
    });

  }, [savedArticles, scale]);

  return (
    <div className="relative w-full h-[400px] bg-black/40 border border-white/5 rounded-[32px] overflow-hidden mt-6 shadow-inner mask-linear">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
         <Network size={16} className="text-teal-400" />
         <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Knowledge Tree</span>
      </div>
      
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
         <button onClick={() => setScale(s => Math.min(s + 0.2, 3))} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"><ZoomIn size={16} /></button>
         <button onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"><ZoomOut size={16} /></button>
      </div>

      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
}
