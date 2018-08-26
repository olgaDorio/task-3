import { isArray } from 'lodash';

const invalidInput = input => (
  !isArray(input.devices) ||
    !isArray(input.rates) ||
    input.maxPower < 0 ||
    !Number(input.maxPower) ||
    !input.devices.length ||
    !input.rates.length
);

const invalidDevice = device => (
  !device.id || !device.power || !device.duration || device.duration > 24 || !['day', 'night', undefined].includes(device.mode)
);

const invalidRates = rates => (
  rates.some(rate => !rates.find(r => r.to === rate.from))
);

const validateInput = (input = {}) => {
  if (!input || invalidInput(input)) {
    return 'Input should match following schema: `devices: [], rates: [], maxPower`';
  }

  if (input.devices.some(invalidDevice)) {
    return 'Device object should match following schema: { id, power, duration, ?mode: [\'day\', \'night\'] }';
  }

  if (input.rates.some(rate => !Number(rate.value) || rate.value <= 0)) {
    return 'Each rate should have { value }';
  }

  if (invalidRates(input.rates)) {
    return 'Each { from } should have correspondint { to }';
  }

  return false;
};

const getHours = () => {
  const day = Array.from({ length: 14 }, (v, i) => i + 7);
  const beforeMidnight = Array.from({ length: 3 }, (v, i) => i + 21);
  const afterMidnight = Array.from({ length: 7 }, (v, i) => i);

  return {
    day,
    anyTime: day.concat(beforeMidnight).concat(afterMidnight),
    night: afterMidnight.concat(beforeMidnight),
  };
};

const getRates = rates => (
  Array.from({ length: 24 }, (v, hour) => (
    rates.find((object) => {
      if (object.from === hour) {
        return true;
      } else if (object.from > object.to) {
        return hour < object.to && hour >= object.from - 24;
      }
      return object.from <= hour && object.to > hour;
    }).value
  ))
);

const getDevices = devices => ({
  day: devices.filter(device => device.mode === 'day'),
  night: devices.filter(device => device.mode === 'night'),
  twentyFourHours: devices.filter(device => device.duration === 24),
  anyTime: devices.filter(device => (
    device.duration !== 24 && !['day', 'night'].includes(device.mode)
  )),
});

module.exports = {
  getHours,
  getRates,
  getDevices,
  validateInput,
};
