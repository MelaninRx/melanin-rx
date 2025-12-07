import React from 'react';
import styles from '../pages/timeline.module.css';

// Postpartum self-care focus by week (weeks 1-12)
const selfCareData: { [week: number]: { focus: string; tips: string[]; reminder: string } } = {
  1: { 
    focus: 'Rest & Recovery',
    tips: [
      'Rest as much as possible - sleep when baby sleeps',
      'Stay hydrated and eat nutritious meals',
      'Allow others to help with household tasks',
      'Monitor bleeding and call your provider if concerned'
    ],
    reminder: 'Your body just did something incredible. Give yourself grace.'
  },
  2: { 
    focus: 'Healing & Hydration',
    tips: [
      'Continue prioritizing rest and hydration',
      'Use warm water for perineal care',
      'Take pain medication as prescribed',
      'Start gentle walking when comfortable'
    ],
    reminder: 'Healing is not linear. Listen to your body.'
  },
  3: { 
    focus: 'Feeding & Bonding',
    tips: [
      'Establish your feeding routine',
      'Take care of your nipples if breastfeeding',
      'Bond with baby through skin-to-skin contact',
      'Accept help so you can focus on recovery'
    ],
    reminder: 'Every feeding journey is valid and unique.'
  },
  4: { 
    focus: 'Finding Your Rhythm',
    tips: [
      'Begin establishing a sleep routine',
      'Continue gentle movement and walks',
      'Schedule your 6-week postpartum checkup',
      'Connect with other new parents for support'
    ],
    reminder: 'It\'s okay if things feel overwhelming. This is normal.'
  },
  5: { 
    focus: 'Emotional Wellness',
    tips: [
      'Check in with your emotions regularly',
      'Talk about your feelings with someone you trust',
      'Be aware of baby blues vs postpartum depression',
      'Continue self-care practices that bring you joy'
    ],
    reminder: 'Your mental health matters. Seek support when needed.'
  },
  6: { 
    focus: 'Returning to Activity',
    tips: [
      'Attend your postpartum checkup',
      'Discuss birth control options with your provider',
      'Gradually increase physical activity',
      'Continue monitoring your emotional wellbeing'
    ],
    reminder: 'Your provider is there to support you. Ask questions.'
  },
  7: { 
    focus: 'Building Confidence',
    tips: [
      'Celebrate small wins in your parenting journey',
      'Trust your instincts - you know your baby best',
      'Join postpartum support groups or communities',
      'Take time for activities that restore your energy'
    ],
    reminder: 'You are learning and growing every day.'
  },
  8: { 
    focus: 'Routine & Balance',
    tips: [
      'Establish routines that work for your family',
      'Continue prioritizing your physical recovery',
      'Make time for yourself, even if brief',
      'Monitor your mental health and seek help if needed'
    ],
    reminder: 'Balance looks different for everyone. Find what works for you.'
  },
  9: { 
    focus: 'Community & Support',
    tips: [
      'Connect with other Black mothers in your community',
      'Share your experiences and learn from others',
      'Continue asking for help when you need it',
      'Prioritize relationships that nourish you'
    ],
    reminder: 'You don\'t have to do this alone. Community is powerful.'
  },
  10: { 
    focus: 'Self-Compassion',
    tips: [
      'Practice self-compassion daily',
      'Let go of unrealistic expectations',
      'Honor your body and what it has accomplished',
      'Celebrate your strength and resilience'
    ],
    reminder: 'You are enough, exactly as you are.'
  },
  11: { 
    focus: 'Looking Forward',
    tips: [
      'Reflect on how far you\'ve come',
      'Set gentle goals for the weeks ahead',
      'Continue monitoring your physical and mental health',
      'Maintain connections with your support network'
    ],
    reminder: 'Every day you are showing up for yourself and your baby.'
  },
  12: { 
    focus: 'Third Month Milestone',
    tips: [
      'Acknowledge this significant milestone',
      'Reflect on your postpartum journey',
      'Continue prioritizing your wellbeing',
      'Remember: you are doing an amazing job'
    ],
    reminder: 'You\'ve made it through the fourth trimester. You are powerful.'
  },
};

// Daily rotating reminders for beyond 3 months
const dailyReminders = [
  'Your body created and nurtured life. Honor its strength and resilience today.',
  'It\'s okay to ask for help. You don\'t have to do everything alone.',
  'Take a moment to breathe. You are doing better than you think.',
  'Self-care isn\'t selfish—it\'s necessary. You matter too.',
  'Your journey is unique. Don\'t compare yourself to others.',
  'Rest when you need it. Your body and mind will thank you.',
  'Celebrate the small wins. They add up to something beautiful.',
  'You are enough, exactly as you are, right now.',
  'It\'s normal to have hard days. Be gentle with yourself.',
  'Connect with your community. You don\'t have to navigate this alone.',
  'Your mental health matters. Prioritize it without guilt.',
  'Trust your instincts. You know yourself and your baby best.',
  'Progress isn\'t always linear. Every step forward counts.',
  'Make time for what brings you joy, even if it\'s just five minutes.',
  'You are stronger than you know. Look how far you\'ve come.',
  'Boundaries are healthy. It\'s okay to say no.',
  'Your needs matter. Don\'t forget to take care of yourself too.',
  'Every phase is temporary. This too shall pass.',
  'You are learning and growing every single day.',
  'Give yourself permission to rest. You\'ve earned it.',
  'Your journey as a mother is valid and beautiful, just as it is.',
  'It\'s okay to not have all the answers. You\'re figuring it out.',
  'Take one day at a time. You\'ve got this.',
  'Remember: you are loved, you are capable, and you are doing your best.',
  'Your wellbeing directly impacts your ability to care for your baby.',
  'There\'s no perfect way to do this. You\'re doing great.',
  'Find moments of peace wherever you can. They matter.',
  'You deserve compassion, especially from yourself.',
  'Your story is still being written. Be patient with yourself.',
  'Small acts of self-care create big changes over time.',
];

function getSelfCareData(weeksPostpartum: number) {
  // Clamp to available data (1-12 weeks postpartum)
  const clamped = Math.max(1, Math.min(12, weeksPostpartum));
  return selfCareData[clamped] || selfCareData[1];
}

// Get a daily reminder based on the date (consistent throughout the day)
function getDailyReminder(): string {
  const today = new Date();
  // Create a consistent seed based on the date (year, month, day)
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  // Use the seed to select a reminder (consistent for the same date)
  const index = seed % dailyReminders.length;
  return dailyReminders[index];
}

interface SelfCareFocusProps {
  weeksPostpartum: number;
  compact?: boolean;
}

export default function SelfCareFocus({ weeksPostpartum, compact = false }: SelfCareFocusProps) {
  // Use week-based data for first 12 weeks, then switch to daily reminders
  const useDailyReminder = weeksPostpartum > 12;
  const selfCare = useDailyReminder ? null : getSelfCareData(weeksPostpartum);
  const dailyReminder = useDailyReminder ? getDailyReminder() : null;
  
  return (
    <div className={styles.fetalCard} data-component="self-care-focus" data-compact={compact}>
      <div className={styles.fetalTitle} style={{ marginBottom: compact ? '8px' : undefined }}>Self-Care Focus</div>
      
      <div className={styles.fetalContent} style={{ gap: compact ? '6px' : undefined }}>
        {/* Heart icon for self-care */}
        <div style={{ 
          width: compact ? '60px' : '100px', 
          height: compact ? '60px' : '100px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: compact ? '0' : '8px'
        }}>
          <svg width={compact ? '50' : '80'} height={compact ? '50' : '80'} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="heartGradient" x1="40" y1="0" x2="40" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#642D56"/>
                <stop offset="1" stopColor="#B369A0"/>
              </linearGradient>
            </defs>
            <path 
              d="M40 66.6667C40 66.6667 16.6667 50 16.6667 33.3333C16.6667 25.8333 22.5 20 30 20C34.1667 20 37.5 22.0833 40 25C42.5 22.0833 45.8333 20 50 20C57.5 20 63.3333 25.8333 63.3333 33.3333C63.3333 50 40 66.6667 40 66.6667Z" 
              fill="url(#heartGradient)"
              filter="drop-shadow(0 4px 8px rgba(100, 45, 86, 0.3))"
            />
          </svg>
        </div>

        {useDailyReminder ? (
          // Daily reminder format (after 3 months)
          <>
            <div className={styles.fetalSizeLabel}>Today's reminder</div>
            <div style={{
              marginTop: compact ? '10px' : '16px',
              padding: compact ? '12px 16px' : '16px 20px',
              background: 'linear-gradient(135deg, #F8F0F5 0%, #F5E8ED 100%)',
              borderRadius: '8px',
              border: '1px solid rgba(100, 45, 86, 0.1)',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: compact ? '13px' : '15px',
                fontWeight: 500,
                color: 'var(--color-text-dark)',
                textAlign: 'center',
                lineHeight: '1.6'
              }}>
                {dailyReminder}
              </div>
            </div>
          </>
        ) : (
          // Week-based format (first 12 weeks)
          <>
            <div className={styles.fetalSizeLabel}>This week's focus</div>
            <div className={styles.fetalSize}>{selfCare?.focus}</div>
            
            <div style={{ 
              width: '100%', 
              marginTop: compact ? '8px' : '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: compact ? '8px' : '12px',
              textAlign: 'left'
            }}>
              {selfCare?.tips.slice(0, 3).map((tip, index) => (
                <div key={index} style={{
                  fontFamily: "'Plus Jakarta Sans', -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: '14px',
                  fontWeight: 400,
                  color: 'var(--color-text-dark)',
                  lineHeight: '1.5',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <span style={{ color: 'var(--color-primary)', fontSize: '16px', lineHeight: '1.2', flexShrink: 0 }}>•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: compact ? '10px' : '16px',
              padding: compact ? '10px 14px' : '12px 16px',
              background: 'linear-gradient(135deg, #F8F0F5 0%, #F5E8ED 100%)',
              borderRadius: '8px',
              border: '1px solid rgba(100, 45, 86, 0.1)',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: compact ? '12px' : '13px',
                fontWeight: 600,
                color: 'var(--color-primary)',
                fontStyle: 'italic',
                textAlign: 'center',
                lineHeight: '1.4'
              }}>
                {selfCare?.reminder}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

