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
        <div className={styles.calendarDates}>
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className={`${styles.calendarDate} ${styles.calendarDateEmpty}`}></div>
          ))}
          
          {/* Days of the current month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const hasAppt = apptDates.includes(day);
            return (
              <div key={day} className={styles.calendarDate}>
                <span className={styles.calendarDateNumber}>{day}</span>
                {hasAppt && <span className={styles.calendarDateDot}></span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
