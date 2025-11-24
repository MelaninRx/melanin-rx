import React from 'react';
import styles from '../pages/timeline.module.css';

interface QuestionsCardProps {
  items: string[];
  onQuestionClick?: (question: string) => void;
}

const QuestionsCard: React.FC<QuestionsCardProps> = ({ items, onQuestionClick }) => {
  const [showAll, setShowAll] = React.useState(false);
  const displayItems = showAll ? items : items.slice(0, 5);
  const hasMore = items.length > 5;

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Questions to Ask Your Doctor</h2>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '12px' }}>
        Click any question to discuss with the chatbot
      </p>
      <ul className={styles.list}>
        {displayItems.map((item, idx) => (
          <li 
            key={idx} 
            className={`${styles.listItem} ${onQuestionClick ? styles.clickable : ''}`}
            onClick={() => onQuestionClick?.(item)}
          >
            <span className={styles.bullet}>•</span>
            <span className={styles.text}>{item}</span>
            {onQuestionClick && (
              <span className={styles.chatIcon}>💬</span>
            )}
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid var(--color-mid)',
            borderRadius: '8px',
            color: 'var(--color-primary)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-light)';
            e.currentTarget.style.borderColor = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'var(--color-mid)';
          }}
        >
          {showAll ? 'Show Less' : `Show All ${items.length} Questions`}
        </button>
      )}
    </div>
  );
};

export default QuestionsCard;