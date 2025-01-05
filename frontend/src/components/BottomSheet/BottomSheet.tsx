import React from 'react';
import './BottomSheet.css';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children }) => {
    return (
        <div className={`bottom-sheet ${isOpen ? 'open' : ''}`}> 
            <div className="bottom-sheet-content">
                <button className="close-button" onClick={onClose}>✖</button>
                {children}
            </div>
        </div>
    );
};

export default BottomSheet;
