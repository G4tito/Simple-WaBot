const increment = 250;

function xpRange(level) {
    if (level < 1) {
        throw new TypeError('The level must be 1 or greater.');
    }
    level = Math.floor(level);

    const min = (level - 1) * increment;
    const max = level * increment;

    return {
        min,
        max,
        xp: max - min
    };
}

module.exports = {
    xpRange
};