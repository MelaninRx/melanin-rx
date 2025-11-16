import React from 'react';
import styles from '../pages/timeline.module.css';

interface QuestionsCardProps {
  items: string[];
  onQuestionClick?: (question: string) => void;
}

const QuestionsCard: React.FC<QuestionsCardProps> = ({ items, onQuestionClick }) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Questions to Ask Your Doctor</h2>
      <ul className={styles.list}>
        {items.map((item, idx) => (
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
    </div>
  );
};

export default QuestionsCard;