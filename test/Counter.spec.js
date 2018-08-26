import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import Counter from 'Counter';
import inputs from 'js/inputs';

describe('Counter.vue calls method returning valid `this.devices`', () => {
  let wrCounterer;

  beforeEach(() => {
    wrCounterer = mount(Counter, { propsData: { input: inputs[0] } });
  });

  it('Array \'this.devices.day\' contains devices in \'day\' mode', () => {
    const expected = wrCounterer.vm.input.devices.filter(device => device.mode === 'day');
    expect(wrCounterer.vm.devices.day).to.have.all.members(expected);
  });

  it('Array \'this.devices.night\' contains devices in \'night\' mode', () => {
    const expected = wrCounterer.vm.input.devices.filter(device => device.mode === 'night');
    expect(wrCounterer.vm.devices.night).to.have.all.members(expected);
  });

  it('Array \'this.devices.twentyFourHours\' contains devices with 24-hour duration', () => {
    const expected = wrCounterer.vm.input.devices.filter(device => device.duration === 24);
    expect(wrCounterer.vm.devices.twentyFourHours).to.have.all.members(expected);
  });

  it('Array \'this.devices.anyTime\' contains remaining devices', () => {
    const expected = wrCounterer.vm.input.devices.filter(device => device.duration !== 24 && !['day', 'night'].includes(device.mode));
    expect(wrCounterer.vm.devices.anyTime).to.have.all.members(expected);
  });
});

describe('Counter.vue calls method returning valid `this.hours`', () => {
  let wrCounterer;

  beforeEach(() => {
    wrCounterer = mount(Counter, { propsData: { input: inputs[0] } });
  });

  it('Array \'this.hours.day\' contains hours in range [7, 20]', () => {
    const expected = Array.from({ length: 14 }, (v, i) => i + 7);
    expect(wrCounterer.vm.hours.day).to.have.all.members(expected);
  });

  it('Array \'this.hours.night\' contains hours in range [21, 6]', () => {
    const expected = Array.from({ length: 7 }, (v, i) => i)
      .concat(Array.from({ length: 3 }, (v, i) => i + 21));

    expect(wrCounterer.vm.hours.night).to.have.all.members(expected);
  });

  it('Array \'this.hours.anyTime\' contains 24 hours', () => {
    const expected = Array.from({ length: 24 }, (v, i) => i);
    expect(wrCounterer.vm.hours.anyTime).to.have.all.members(expected);
  });
});

describe('Counter.vue calls method returning valid `this.rates`', () => {
  let wrCounterer;

  beforeEach(() => {
    wrCounterer = mount(Counter, { propsData: { input: inputs[0] } });
  });

  it('Method `this.getRates` returning `this.rates`', () => {
    const expected = [];
    const { rates } = wrCounterer.vm.input;

    for (let hour = 0; hour < 24; hour += 1) {
      const { value } = rates.find((object) => {
        if (object.from === hour) {
          return true;
        } else if (object.from > object.to) {
          return hour < object.to && hour >= object.from - 24;
        }
        return object.from <= hour && object.to > hour;
      });

      expected.push(value);
    }

    expect(wrCounterer.vm.rates).to.have.all.ordered.members(expected);
  });
});

describe('Counter.vue calculates schedule', () => {
  let wrCounterer;

  beforeEach(() => {
    wrCounterer = mount(Counter, { propsData: { input: inputs[0] } });
  });

  it('contains devices sufficient number of times', () => {
    const expected = {};
    const reseived = {};

    wrCounterer.vm.input.devices.forEach((device) => {
      reseived[device.id] = 0;
      expected[device.id] = device.duration;
    });

    wrCounterer.vm.schedule.forEach((hour) => {
      hour.forEach((id) => {
        reseived[id] += 1;
      });
    });

    expect(expected).to.deep.equal(reseived);
  });

  ['day', 'night'].forEach((partOfDay) => {
    it(`${partOfDay} devices work at day time`, () => {
      const devices = wrCounterer.vm.devices[partOfDay];
      const allowedHours = wrCounterer.vm.hours[partOfDay];
      const hours = {};

      devices.forEach((device) => {
        hours[device.id] = [];
      });

      devices.forEach((device) => {
        wrCounterer.vm.schedule.forEach((subarray, hour) => {
          if (subarray.includes(device.id)) {
            hours[device.id].push(hour);
          }
        });
      });

      const isValid = Object.values(hours).every(array => (
        array.every(hour => allowedHours.includes(hour))
      ));

      expect(isValid).to.be.true; // eslint-disable-line no-unused-expressions
    });
  });
});
