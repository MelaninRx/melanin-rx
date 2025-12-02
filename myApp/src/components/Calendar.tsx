import React from 'react';
import { Timestamp } from 'firebase/firestore';
import styles from '../pages/timeline.module.css';

interface CalendarProps {
  appointments?: any[];
}

export default function Calendar({ appointments = [] }: CalendarProps) {
  const today = new Date();
  const [month, setMonth] = React.useState(today.getMonth());
  const [year, setYear] = React.useState(today.getFullYear());

  const apptDates = appointments
    .map(appt => {
      let apptDate;
      if (appt.dateTime instanceof Timestamp) {
        apptDate = appt.dateTime.toDate();
      } else if (typeof appt.dateTime === 'string') {
        apptDate = new Date(appt.dateTime);
      } else if (appt.dateTime?.toDate) {
        apptDate = appt.dateTime.toDate();
      } else {
        return null;
      }
      return apptDate.getFullYear() === year && apptDate.getMonth() === month ? apptDate.getDate() : null;
    })
    .filter(Boolean);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weeks = [];
  let day = 1 - firstDay;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++, day++) {
      if (day > 0 && day <= daysInMonth) {
        week.push(day);
      } else {
        const nextMonthDay = day > daysInMonth ? day - daysInMonth : null;
        const prevMonthLastDay = day <= 0 ? new Date(year, month, 0).getDate() + day : null;
        week.push(prevMonthLastDay || nextMonthDay || '');
      }
    }
    weeks.push(week);
    if (day > daysInMonth + 7) break;
  }

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div className={styles.calendarWidget}>
      <div className={styles.calendarHeader}>
        <button onClick={handlePrevMonth} className={styles.calendarNavBtn} aria-label="Previous month">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className={styles.calendarMonth}>{monthNames[month]} {year}</div>
        <button onClick={handleNextMonth} className={styles.calendarNavBtn} aria-label="Next month">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className={styles.calendarDivider} />
      
      <div className={styles.calendarDaysHeader}>
        <div className={styles.calendarDay}>SUN</div>
        <div className={styles.calendarDay}>MON</div>
        <div className={styles.calendarDay}>TUE</div>
        <div className={styles.calendarDay}>WED</div>
        <div className={styles.calendarDay}>THU</div>
        <div className={styles.calendarDay}>FRI</div>
        <div className={styles.calendarDay}>SAT</div>
      </div>
      
      <div className={styles.calendarGrid}>
        {weeks.map((week, i) => (
          <div key={i} className={styles.calendarWeek}>
            {week.map((d, j) => {
              const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const hasAppt = apptDates.includes(d);
              return (
                <div key={j} className={styles.calendarDate}>
                  {d || ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
