// AvatarSelector.jsx
import { useState } from 'react';

const avatarOptions = {
  animals: ['🐱', '🐶', '🦊', '🐼', '🦁'],
  fantasy: ['🧙', '🧝', '🧛', '🧟', '🧚'],
  objects: ['🎩', '👓', '🍕', '⚽', '🎸']
};

export default function AvatarSelector({ onSelect }) {
  const [selectedType, setType] = useState('animals');
  const [colors, setColors] = useState({
    primary: '#FF5733',
    secondary: '#33FF57'
  });

  return (
    <div className="avatar-creator">
      <div className="avatar-types">
        {Object.keys(avatarOptions).map(type => (
          <button 
            key={type} 
            onClick={() => setType(type)}
            className={selectedType === type ? 'active' : ''}
          >
            {type}
          </button>
        ))}
      </div>
      
      <div className="avatar-grid">
        {avatarOptions[selectedType].map((avatar, i) => (
          <div 
            key={i}
            className="avatar-option"
            onClick={() => onSelect({
              icon: avatar,
              colors,
              type: selectedType
            })}
            style={{ 
              backgroundColor: colors.primary,
              color: colors.secondary
            }}
          >
            {avatar}
          </div>
        ))}
      </div>

      <div className="color-picker">
        <input 
          type="color" 
          value={colors.primary}
          onChange={(e) => setColors({...colors, primary: e.target.value})}
        />
        <input
          type="color"
          value={colors.secondary}
          onChange={(e) => setColors({...colors, secondary: e.target.value})}
        />
      </div>
    </div>
  );
}