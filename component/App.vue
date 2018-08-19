<template lang="pug">
  .block__container
    .block
      h2 Input
      pre {{ JSON.stringify(input, null, "\t") }}
    .block
      h2 Output
      pre {{ JSON.stringify(consumedEnergy, null, "\t") }}
      h2 Schedule
      pre {{ JSON.stringify(schedule, null, "\t") }}
</template>

<script>
  import input from './../js/input';

  export default {
    data() {
      return {
        input,
        schedule: Array.from({ length: 24 }, () => ([])),
        notifications: [],
      };
    },

    mounted() {
      this.push24HoursPerDayDevices();

      this.push('day');
      this.push('night');
      this.push('anyTime');
    },

    methods: {
      push24HoursPerDayDevices() {
        this.schedule.forEach((subarray) => {
          subarray.push(...this.devices.dayAndNight.map(device => device.id));
        });
      },

      push(type) {
        this.devices[type].forEach((device) => {
          const { duration, power, id } = device;
          const canStartAt = this.startHours(this.hours[type], power, duration);
          const willStartAt = this.whenItWillBeCheaperToStart(canStartAt, duration);

          if (!Number.isInteger(willStartAt)) {
            this.notifications.push(`Error processing ${device.id} ${device.name}`);
            return;
          }

          let index = 0;

          while (index < duration) {
            let scheduleIndex = willStartAt + index;
            if (scheduleIndex > 23) {
              scheduleIndex -= 24;
            }

            this.schedule[scheduleIndex].push(id);
            index += 1;
          }
        });
      },

      whenItWillBeCheaperToStart(hours, duration) {
        const mapped = hours.map((hour) => {
          let total = this.rates[hour];

          let i = 1;
          while (i < duration) {
            let index = hour + 1;

            if (index > 23) {
              index -= 24;
            }

            total += this.rates[index];

            i += 1;
          }

          return { hour, total };
        });

        const totalArray = mapped.map(item => item.total);

        const minPrice = Math.min(...totalArray);
        const minItem = mapped.find(item => item.total === minPrice);

        return minItem ? minItem.hour : null;
      },

      startHours(indexes, power, duration) {
        const havePowerLeft = this.powerLeft.map((powerLeft, index) => (
          indexes.includes(index) && powerLeft - power >= 0 ? `${index}` : ''
        )).filter(v => v).map(v => Number(v));

        const canStart = havePowerLeft.filter((hour, index, array) => {
          const indexOfEnd = index + duration;

          if (hour + duration >= 24) {
            return (hour + duration) - 24 === array[indexOfEnd - array.length];
          }

          return (hour + duration) - 1 === array[indexOfEnd - 1];
        });

        const nighty = canStart.filter(v => v >= 21 && v < 24);
        const dayly = canStart.filter(v => v < 21);
        const concatted = nighty.concat(dayly);

        return concatted;
      },
    },

    computed: {
      consumedEnergy() {
        const devices = {};

        this.schedule.forEach((ids, index) => {
          ids.forEach((id) => {
            const device = this.input.devices.find(item => item.id === id);
            const { power } = device;
            const rate = this.rates[index];
            const price = (power * rate) / 1000;
            devices[id] = devices[id] || 0;
            devices[id] += price;
          });
        });

        const values = Object.values(devices);

        return {
          devices,
          value: values.length ? values.reduce((a, b) => a + b) : 0,
        };
      },

      devices() {
        const { devices } = this.input;

        return {
          day: devices.filter(device => device.mode === 'day'),
          night: devices.filter(device => device.mode === 'night'),
          dayAndNight: devices.filter(device => device.duration === 24),
          anyTime: devices.filter(device => device.duration !== 24 && !['day', 'night'].includes(device.mode)),
        };
      },

      hours() {
        const isNight = index => index < 7 || index >= 21;
        const isDay = index => !isNight(index);
        const toInt = string => parseInt(string, 10);

        const day = Object.keys(this.rates).filter(isDay).map(toInt);
        const night = Object.keys(this.rates).filter(isNight).map(toInt);
        const anyTime = day.concat(night);

        return { day, night, anyTime };
      },

      powerLeft() {
        return this.schedule.map((ids) => {
          const used = ids.map(id => (
            this.input.devices.find(device => device.id === id).power
          )).reduce((prev, next) => (
            prev + next
          ));

          return this.input.maxPower - used;
        });
      },

      rates() {
        const { rates } = this.input;

        return Array.from({ length: 24 }, (v, hour) => (
          rates.find((object) => {
            if (object.from === hour) {
              return true;
            } else if (object.from > object.to) {
              return hour < object.to && hour >= object.from - 24;
            }
            return object.from <= hour && object.to > hour;
          }).value
        ));
      },
    },
  };
</script>

<style lang="scss">
  body {
    margin: 0;
  }

  .block {
    box-sizing: border-box;
    margin: 50px;
    width: 50%;

    &__container {
      display: flex;
    }
  }

  pre {
    background: grey;
    height: 100%;
    max-height: 200px;
    overflow: auto;
  }
</style>
