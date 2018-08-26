<template lang="pug">
  .container
    v-card(:expand="true")
      template(slot="title") Input
      template {{ JSON.stringify(input, null, "\t") }}
    v-card
      template(slot="title") Output
      template {{ JSON.stringify(consumedEnergy, null, "\t") }}
    v-card(:expand="true")
      template(slot="title") Schedule
      template {{ JSON.stringify(schedule, null, "\t") }}
</template>

<script>
  import { getHours, getRates, getDevices, validateInput } from 'js/helpers';
  import card from 'Card';

  const number = value => Number(value.toFixed(4));

  export default {
    components: {
      'v-card': card,
    },

    data() {
      return {
        hours: getHours(),
        rates: [],
        devices: {},
        schedule: [],
      };
    },

    props: {
      input: {
        type: Object,
        required: true,
      },
    },

    watch: {
      input: {
        handler() {
          this.schedule = Array.from({ length: 24 }, () => ([]));
          this.calculate();
        },
        immediate: true,
      },
    },

    methods: {
      notify(message) {
        this.$emit('notify', message);
      },

      calculate() {
        const errorMessage = validateInput(this.input);
        if (errorMessage) {
          this.notify(errorMessage);
          return;
        }

        this.rates = getRates(this.input.rates);
        this.devices = getDevices(this.input.devices);

        this.push24HoursPerDayDevices();

        this.push('day');
        this.push('night');
        this.push('anyTime');
      },

      push24HoursPerDayDevices() {
        this.schedule.forEach((subarray) => {
          subarray.push(...this.devices.twentyFourHours.map(device => device.id));
        });
      },

      push(type) {
        this.devices[type].forEach((device) => {
          const { duration, power, id } = device;
          const canStartAt = this.startHours(this.hours[type], power, duration);
          const willStartAt = this.whenItWillBeCheaperToStart(canStartAt, duration);

          if (!Number.isInteger(willStartAt)) {
            this.notify(`Can't push ${device.id} to schedule`);
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
            devices[id] = number(devices[id]);
          });
        });

        const values = Object.values(devices);

        return {
          devices,
          value: values.length ? number(values.reduce((a, b) => a + b)) : 0,
        };
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
    },
  };
</script>

<style lang="scss" scoped>
  .container {
    box-sizing: border-box;
    height: 100%;
    max-height: 100vh;
  }
</style>
