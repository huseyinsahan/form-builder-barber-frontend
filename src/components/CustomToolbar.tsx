import React from 'react';
import { ToolbarProps } from 'react-big-calendar';

const CustomToolbar: React.FC<ToolbarProps> = ({ label, onNavigate, onView }) => {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate('PREV')}>Önceki</button>
        <button type="button" onClick={() => onNavigate('TODAY')}>Bugün</button>
        <button type="button" onClick={() => onNavigate('NEXT')}>Sonraki</button>
      </span>
      <span className="rbc-toolbar-label">{label}</span>
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onView('day')}>Gün</button>
        <button type="button" onClick={() => onView('week')}>Hafta</button>
      </span>
    </div>
  );
};

export default CustomToolbar;