import { expect } from 'chai';
import { validateInput } from 'js/helpers';
import inputs from 'js/inputs';
import { clone } from 'lodash';

const { devices, rates, maxPower } = inputs[0];

const messages = [
  'Input should match following schema: `devices: [], rates: [], maxPower`',
  'Device object should match following schema: { id, power, duration, ?mode: [\'day\', \'night\'] }',
  'Each rate should have { value }',
  'Each { from } should have correspondint { to }',
];

describe('validateInput()', () => {
  const invalidInput = [
    null,
    undefined,
    {},
    { devices: [], rates, maxPower },
    { devices, rates: [], maxPower },
    { devices, rates, maxPower: 0 },
    { devices, rates, maxPower: -1 },
    { devices, rates, maxPower: 'maxPower' },
    { devices, rares: rates, maxPower },
    { devises: devices, rates, maxPower },
  ];

  const validPower = 20;
  const validDuration = 20;
  const validId = 20;
  const validModes = ['day', 'night', undefined];

  const invalidDevices = [
    {},
    { power: validPower, duration: validDuration, mode: validModes[0] },
    { power: validPower, duration: validDuration, mode: validModes[1] },
    { power: validPower, duration: validDuration, mode: validModes[2] },
    { id: validId, duration: validDuration, mode: validModes[0] },
    { id: validId, duration: validDuration, mode: validModes[1] },
    { id: validId, duration: validDuration, mode: validModes[2] },
    { id: validId, power: validPower, mode: validModes[0] },
    { id: validId, power: validPower, mode: validModes[1] },
    { id: validId, power: validPower, mode: validModes[2] },
    { id: validId, power: validPower, mode: 'midnight' },
    { id: validId, power: validPower, mode: 'midnight' },
    { id: validId, power: validPower, mode: 'midnight' },
  ];

  const invalidRate = [
    Object.assign(clone(rates[0]), { from: 11, to: 12 }),
    Object.assign(clone(rates[0]), { from: 3, to: 2 }),
  ];

  const rateWithMissingValue = [
    Object.assign(clone(rates[0]), { value: 0 }),
    Object.assign(clone(rates[0]), { value: -10 }),
    Object.assign(clone(rates[0]), { value: 'value' }),
  ];

  invalidInput.forEach((object) => {
    it('Returns error on invalid input', () => {
      const errorMessage = validateInput(object);
      expect(errorMessage).to.equal(messages[0]);
    });
  });

  invalidDevices.forEach((device) => {
    it('Returns error on input with invalid device', () => {
      const object = { devices: devices.concat([device]), rates, maxPower };
      const errorMessage = validateInput(object);
      expect(errorMessage).to.equal(messages[1]);
    });
  });

  rateWithMissingValue.forEach((rate) => {
    it('Returns error on input containing rate with missing value', () => {
      const object = { rates: rates.concat([rate]), devices, maxPower };
      const errorMessage = validateInput(object);
      expect(errorMessage).to.equal(messages[2]);
    });
  });

  invalidRate.forEach((rate) => {
    it('Returns error on input with invalid rate', () => {
      const object = { rates: rates.concat([rate]), devices, maxPower };
      const errorMessage = validateInput(object);
      expect(errorMessage).to.equal(messages[3]);
    });
  });
});
