import React from 'react';
import styles from '../pages/timeline.module.css';

interface ChecklistData {
  items: string[];
  done: boolean[];
}

interface DeletedItem {
  text: string;
  wasDone: boolean;
  index: number;
}

export default function ChecklistCard({
  items, storageKey, title = "This week's checklist", compact = false,
}: { items: string[]; storageKey: string; title?: string; compact?: boolean; }) {
  // Store original items for restoration - update when items prop changes
  const originalItems = React.useRef<string[]>(items);
  
  const [checklistData, setChecklistData] = React.useState<ChecklistData>(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Ensure we have both items and done arrays
        if (parsed.items && parsed.done) {
          // Check if stored items match current items (in case trimester changed)
          const itemsMatch = parsed.items.length === items.length && 
            parsed.items.every((item: string, i: number) => item === items[i]);
          if (itemsMatch) {
            return parsed;
          }
          // If items don't match, reset to new items
        }
      } catch (e) {
        // If parsing fails, fall through to default
      }
    }
    // Initialize with default items
    return {
      items: [...items],
      done: Array(items.length).fill(false)
    };
  });

  // Update originalItems and checklistData when items prop or storageKey changes
  React.useEffect(() => {
    originalItems.current = items;
    // Reload from localStorage with the new storageKey
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.items && parsed.done) {
          // Check if stored items match current items
          const itemsMatch = parsed.items.length === items.length && 
            parsed.items.every((item: string, i: number) => item === items[i]);
          if (itemsMatch) {
            // Items match, use stored data
            setChecklistData(parsed);
            setDeletedItems([]);
            return;
          }
        }
      } catch (e) {
        // If parsing fails, fall through to reset
      }
    }
    // No stored data or items don't match, reset to new items
    setChecklistData({
      items: [...items],
      done: Array(items.length).fill(false)
    });
    setDeletedItems([]);
  }, [items, storageKey]);

  const [newItemText, setNewItemText] = React.useState('');
  const [isAddingItem, setIsAddingItem] = React.useState(false);
  const [deletedItems, setDeletedItems] = React.useState<DeletedItem[]>([]);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Update originalItems when items prop changes (e.g., switching trimesters)
  React.useEffect(() => {
    originalItems.current = items;
    
    // Check if stored data matches the new items
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.items && parsed.done) {
          // Check if stored items match current items
          const itemsMatch = parsed.items.length === items.length && 
            parsed.items.every((item: string, i: number) => item === items[i]);
          if (!itemsMatch) {
            // Items changed (different trimester), reset to new items
            setChecklistData({
              items: [...items],
              done: Array(items.length).fill(false)
            });
            setDeletedItems([]);
            return;
          }
        }
      } catch (e) {
        // If parsing fails, reset to new items
        setChecklistData({
          items: [...items],
          done: Array(items.length).fill(false)
        });
        setDeletedItems([]);
        return;
      }
    } else {
      // No stored data, initialize with new items
      setChecklistData({
        items: [...items],
        done: Array(items.length).fill(false)
      });
      setDeletedItems([]);
    }
  }, [items, storageKey]);

  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checklistData));
  }, [checklistData, storageKey]);

  const toggle = (i: number) => {
    setChecklistData(prev => {
      const newDone = [...prev.done];
      newDone[i] = !newDone[i];
      return { ...prev, done: newDone };
    });
  };

  const addItem = () => {
    if (newItemText.trim()) {
      setChecklistData(prev => ({
        items: [...prev.items, newItemText.trim()],
        done: [...prev.done, false]
      }));
      setNewItemText('');
      setIsAddingItem(false);
    }
  };

  const removeItem = (i: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling when clicking remove
    const deletedItem: DeletedItem = {
      text: checklistData.items[i],
      wasDone: checklistData.done[i],
      index: i
    };
    setDeletedItems(prev => [deletedItem, ...prev]); // Add to history
    setChecklistData(prev => ({
      items: prev.items.filter((_, idx) => idx !== i),
      done: prev.done.filter((_, idx) => idx !== i)
    }));
  };

  const undoDelete = React.useCallback(() => {
    if (deletedItems.length === 0) return;
    
    const lastDeleted = deletedItems[0];
    setChecklistData(prev => {
      const newItems = [...prev.items];
      const newDone = [...prev.done];
      // Insert at original position, or at end if index is out of bounds
      const insertIndex = lastDeleted.index <= newItems.length ? lastDeleted.index : newItems.length;
      newItems.splice(insertIndex, 0, lastDeleted.text);
      newDone.splice(insertIndex, 0, lastDeleted.wasDone);
      return { items: newItems, done: newDone };
    });
    setDeletedItems(prev => prev.slice(1)); // Remove from history
  }, [deletedItems]);

  const restoreOriginal = () => {
    if (confirm('Restore original checklist? This will remove all custom items you\'ve added.')) {
      setChecklistData({
        items: [...originalItems.current],
        done: Array(originalItems.current.length).fill(false)
      });
      setDeletedItems([]); // Clear undo history
    }
  };

  // Listen for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        // Only undo if not typing in an input
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          undoDelete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoDelete]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    } else if (e.key === 'Escape') {
      setIsAddingItem(false);
      setNewItemText('');
    }
  };

  const hasCustomItems = checklistData.items.length !== originalItems.current.length ||
    checklistData.items.some((item, i) => item !== originalItems.current[i]);

  const completedCount = checklistData.done.filter(Boolean).length;
  const totalCount = checklistData.items.length;
  const progressText = `${completedCount} of ${totalCount} completed`;

  return (
    <section className={styles.checklistCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div className={styles.cardTitle}>{title}</div>
          <button
            className={styles.checklistToggle}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse checklist' : 'Expand checklist'}
          >
            <span className={styles.checklistProgress}>{progressText}</span>
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
        </div>
        {hasCustomItems && !compact && (
          <button
            className={styles.restoreButton}
            onClick={restoreOriginal}
            title="Restore original checklist"
          >
            ↶ Restore
          </button>
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        {checklistData.items.map((text, i) => {
          // Show first 5 items when collapsed (3 for compact), all items when expanded
          const maxItems = compact ? 3 : 5;
          if (!isExpanded && i >= maxItems) {
            return null;
          }
          const checked = !!checklistData.done[i];
          return (
            <div key={i} className={styles.checkItem}>
              <div 
                className={`${styles.checkBox} ${checked ? styles.checkBoxChecked : ''}`}
                onClick={() => toggle(i)}
              >
                {checked ? '✓' : ''}
              </div>
              <div 
                className={`${styles.checkText} ${checked ? styles.checkTextDone : ''}`}
                onClick={() => toggle(i)}
                style={{ flex: 1 }}
              >
                {text}
              </div>
              <button
                className={styles.removeButton}
                onClick={(e) => removeItem(i, e)}
                aria-label="Remove item"
                title="Remove item"
              >
                ×
              </button>
            </div>
          );
        })}
        
        {!compact && (
          <>
            {isAddingItem ? (
              <div className={styles.addItemContainer}>
                <input
                  type="text"
                  className={styles.addItemInput}
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter new checklist item..."
                  autoFocus
                />
                <div className={styles.addItemActions}>
                  <button
                    className={styles.addItemButton}
                    onClick={addItem}
                    disabled={!newItemText.trim()}
                  >
                    Add
                  </button>
                  <button
                    className={styles.cancelButton}
                    onClick={() => {
                      setIsAddingItem(false);
                      setNewItemText('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className={styles.addItemTrigger}
                onClick={() => setIsAddingItem(true)}
              >
                + Add item
              </button>
            )}
          </>
        )}
        {!isExpanded && totalCount > (compact ? 3 : 5) && (
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
            fontWeight: 500
          }}
          onClick={() => setIsExpanded(true)}
          >
            + Show {totalCount - (compact ? 3 : 5)} more items
          </div>
        )}
      </div>
    </section>
  );
}