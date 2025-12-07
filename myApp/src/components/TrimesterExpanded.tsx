import React from 'react';
import styles from '../pages/timeline.module.css';
import type { Trimester } from '../services/timelineService';
import ChecklistCard from './ChecklistCard';

export default function TrimesterExpanded({ 
  data, 
  onBack,
  onQuestionClick 
}: { 
  data: Trimester; 
  onBack: () => void;
  onQuestionClick?: (question: string) => void;
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const totalQuestions = data.doctorTips.length;
  const displayQuestions = isExpanded ? data.doctorTips : data.doctorTips.slice(0, 5);

  return (
    <section className={styles.expanded}>
      <div className={styles.expandedHeader}>
        <div>
          <h2 className={styles.expandedTitle}>{data.title}</h2>
          <div className={styles.badge}>{data.weeksRange}</div>
        </div>
        <button className={styles.backBtn} onClick={onBack}>Back</button>
      </div>

      <p className={styles.cardBody}>{data.summary}</p>

      <ChecklistCard
        items={data.checklist}
        storageKey={`trimester-${data.id}-checklist`}
        title="Checklist"
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', marginBottom: '16px' }}>
        <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Doctor Discussion Prompts</h3>
        {totalQuestions > 5 && (
          <button
            className={styles.checklistToggle}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse prompts' : 'Expand prompts'}
          >
            <span className={styles.checklistProgress}>{totalQuestions} questions</span>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ 
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            >
              <path d="M5 7.5L10 12.5L15 7.5" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      <ul className={styles.list}>
        {displayQuestions.map((tip, i) => (
          <li 
            key={i}
            className={onQuestionClick ? styles.listItemClickable : ''}
            onClick={() => onQuestionClick?.(tip)}
          >
            {tip}
          </li>
        ))}
      </ul>
      {!isExpanded && totalQuestions > 5 && (
        <div style={{ 
          marginTop: '12px', 
          padding: '12px', 
          background: '#F8F8F8', 
          borderRadius: '8px',
          fontFamily: "'Plus Jakarta Sans', -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: '14px',
          color: 'var(--color-primary)',
          textAlign: 'center',
          cursor: 'pointer',
          fontWeight: 500,
          transition: 'background-color 0.2s ease'
        }}
        onClick={() => setIsExpanded(true)}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F0F0'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F8F8F8'}
        >
          + Show {totalQuestions - 5} more questions
        </div>
      )}
    </section>
  );
}
