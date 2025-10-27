import { useState } from "react";

const initialDate = new Date(new Date("2025-10-01 00:00:00"));

const formatter = new Intl.DateTimeFormat('pt-BR', {timeZone: 'America/Sao_Paulo'});

export const possibleDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = [];
    let next;
    let index = 0;
    do {    
        next = new Date(initialDate.getTime());
        next.setDate(next.getDate() + index);
        dates.push(next);
        index++;
    } while (next.getTime() != today.getTime());
    return dates.reverse();
}

export const todayMidnight = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

const DatePicker = ({onClick}) => {
    const [current, setCurrent] = useState(todayMidnight())

    return (
        <div className="datePicker">
            {possibleDates().map(d => (
                <div onClick={() => { setCurrent(d); onClick(d); }} className={current.getTime() == d.getTime() ? 'selected' : ''}>
                    {formatter.format(d)}
                </div>
            ))}
        </div>
    )
}

export default DatePicker;