const addToStorage = (key, dates) => {
    dates.sort((a, b) => b - a);
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
        localStorage.setItem(key, JSON.stringify(dates));
    }
}

const getDates = (key) => {
    let dates = [];
    if (localStorage.getItem(key) != null) {
        dates = JSON.parse(localStorage.getItem(key));
    }
    return dates;
}

const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

const getYesterday = (date) => {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
}

export default {
 
    addDate(date, mode) {
        const key = `datesWon_${mode}`;
        const dates = getDates(key);
        dates.push(date.getTime());
        addToStorage(key, dates); 
    },

    isDateWon(date, mode) {
        const key = `datesWon_${mode}`;
        const dates = getDates(key);
        return dates.includes(date.getTime());
    },

    currentStreak(mode) {
        let streak = 0;
        const dates = getDates(`datesWon_${mode}`);
        for (let checkDate = (this.isDateWon(getToday(), mode) ? getToday() : getYesterday(getToday())); this.isDateWon(checkDate, mode); checkDate = getYesterday(checkDate)) {
            streak++;
        }
        return streak;
    }
}