import React, { useState, useMemo } from 'react';
import { possibleDates, todayMidnight } from './DatePicker'; 
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import StreakManager from '../util/StreakManager';

const getDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const CalendarModal = ({ isOpen, onClose, onDateSelect, currentDate, mode }) => {
  const [displayDate, setDisplayDate] = useState(currentDate || todayMidnight());

  const playableDatesSet = useMemo(() => {
    const dates = possibleDates();
    return new Set(dates.map(d => d.toDateString()));
  }, []);

  if (!isOpen) {
    return null;
  }

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = daysInMonth[0].getDay(); // 0 = Domingo, 1 = Segunda 

  // Gera células vazias para o início do mês
  const emptyCells = Array(firstDayOfMonth).fill(null);

  const handlePrevMonth = () => {
    setDisplayDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day) => {
    if (playableDatesSet.has(day.toDateString())) {
      onDateSelect(day);
    }
  };

  return (
    <div className="tutorial-modal-overlay" onClick={onClose}>
      <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
        <button className="tutorial-close" onClick={onClose}>
          X
        </button>
        
        <div className="calendar-header">
          <button onClick={handlePrevMonth} className="calendar-nav-btn">
            <FaChevronLeft />
          </button>
          <span className="calendar-month-year">
            {monthNames[month]} {year}
          </span>
          <button onClick={handleNextMonth} className="calendar-nav-btn">
            <FaChevronRight />
          </button>
        </div>

        <div className="calendar-grid">
          {/* Dias da semana */}
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dayLabel, i) => (
            <div key={i} className="calendar-day-header">{dayLabel}</div>
          ))}

          {/* Células vazias */}
          {emptyCells.map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty"></div>
          ))}

          {/* Dias do mês */}
          {daysInMonth.map((day) => {
            const isPlayable = playableDatesSet.has(day.toDateString());
            const isSelected = day.toDateString() === currentDate.toDateString();
            const alreadyWon = StreakManager.isDateWon(day, mode);
            
            let dayClass = 'calendar-day';
            if (isPlayable) dayClass += ' playable';
            if (isSelected) dayClass += ' selected';
            if (!isPlayable) dayClass += ' disabled';
            if (alreadyWon) dayClass += ' already-won';

            return (
              <div
                key={day.getDate()}
                className={dayClass}
                onClick={() => handleDateClick(day)}
              >
                {day.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;