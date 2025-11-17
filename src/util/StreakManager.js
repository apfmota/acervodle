const addToStorage = (key, dates) => {
    dates.sort((a, b) => b - a);
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
        localStorage.setItem(key, JSON.stringify(dates));
    }
};

const getDates = (key) => {
    let dates = [];
    if (localStorage.getItem(key) != null) {
        try {
            dates = JSON.parse(localStorage.getItem(key));
        } catch (e) {
            dates = [];
        }
    }
    return dates;
};

const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const getYesterday = (date) => {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
};

const STATS_KEY = 'acervodleGameStats';

const getStats = () => {
    let data = {};
    if (typeof localStorage !== 'undefined' && localStorage.getItem(STATS_KEY) != null) {
        try {
            data = JSON.parse(localStorage.getItem(STATS_KEY));
        } catch (e) {
            data = {};
        }
    }
    return data;
};

const saveStats = (data) => {
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
        localStorage.setItem(STATS_KEY, JSON.stringify(data));
    }
};

const toDateString = (date) => {
    return date.toISOString().split('T')[0];
};


const manager = {

    addDate(date, mode) {
        const key = `datesWon_${mode}`;
        const dates = getDates(key);
        const timestamp = date.getTime();
        if (!dates.includes(timestamp)) {
            dates.push(timestamp);
            addToStorage(key, dates); 
        }
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
    },

    addWin(date, mode, attempts) {
        if (!date || !mode || attempts == null) return;

        this.addDate(date, mode);

        const stats = getStats();
        const dateString = toDateString(date);

        if (!stats[mode]) {
            stats[mode] = {};
        }

        if (!stats[mode][dateString] || attempts < stats[mode][dateString].attempts) {
            stats[mode][dateString] = { attempts: attempts };
            saveStats(stats);
        }
    },

    getGamesPlayed: (mode) => {
        const stats = getStats();
        if (!stats[mode]) return 0;
        return Object.keys(stats[mode]).length;
    },

    getGuessDistribution: (mode) => {
        const stats = getStats();
        if (!stats[mode]) return {};

        const distribution = {};
        for (const dateString in stats[mode]) {
            const attempts = stats[mode][dateString].attempts;
            distribution[attempts] = (distribution[attempts] || 0) + 1;
        }
        return distribution;
    },

    getGuessDistributionData: (mode) => {
        const distributionObj = manager.getGuessDistribution(mode); 

        return Object.keys(distributionObj)
            .map(attempts => {
                return {
                    attempts: parseInt(attempts, 10), 
                    count: distributionObj[attempts]
                };
            })
            .sort((a, b) => a.attempts - b.attempts);
    },

    getAttemptsHistory: (mode) => {
        const stats = getStats();
        if (!stats[mode]) return []; 

        return Object.keys(stats[mode])
            .map(dateString => {
                return {
                    date: dateString,
                    attempts: stats[mode][dateString].attempts
                };
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    getAverageGuesses: (mode) => {
        const stats = getStats();
        if (!stats[mode]) return 0;
        
        const games = Object.values(stats[mode]);
        if (games.length === 0) return 0;

        const totalAttempts = games.reduce((sum, game) => sum + game.attempts, 0);
        const average = totalAttempts / games.length;
        
        return parseFloat(average.toFixed(1)); 
    },

    getWinsOnFirstTry: (mode) => {
        const stats = getStats();
        if (!stats[mode]) return 0;

        const games = Object.values(stats[mode]);
        let firstTryCount = 0;
        
        for (const game of games) {
            if (game.attempts === 1) {
                firstTryCount++;
            }
        }
        return firstTryCount;
    },
};

export default manager;