import React from 'react';
import './Popup.css';

interface PopupProps {
  content: string;
  onClose: () => void;
  position: { x: number; y: number };
}

const Popup: React.FC<PopupProps> = ({ content, onClose, position }) => {
  return (
    <div 
      className="popup"
      style={{ 
        left: position.x,
        top: position.y
      }}
    >
      <div className="popup-content">
        {content}
        <button className="popup-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default Popup;
