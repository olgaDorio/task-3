<template lang="pug">
  .block__container
    .block
      h1 Input
      h2 Devices
      div(v-for = "device in input.devices") {{ device }}
      h2 Rates
      div(v-for = "rate in input.rates") {{ rate }}
      h2 maxPower
      div {{ input.maxPower }}
    .block
      h1 Temporary
      h2 Schedule
      div(v-for="(array, hour) in schedule") [{{ hour }}]: {{ array }}
      h2 Rates
      div(v-for = "(rate, hour) in rates") [{{ hour }}]: {{ rate }}
      h2 Devices
      template(v-for = "(object, key) in devices")
        h3 {{ key }}
        div {{ object }}
</template>

<script>
  import input from './../js/input';

  // 7-21 - day

  export default {
    data() {
      return {
        input,
        output: {
          schedule: [],
          consumedEnergy: {
            value: 0,
            devices: {},
          },
        },

        schedule: Array.from({ length: 24 }, () => ([])),
      };
    },

    mounted() {
      this.push24HoursPerDayDevices();
      this.pushDayDevices();
    },

    // first add all 24 devices
    // then all day (filtered from biggest to lowest)
    // then all night (filtered from biggest to lowest)
    // then all undefined :)

    methods: {
      push24HoursPerDayDevices() {
        this.schedule.forEach((subarray) => {
          subarray.push(...this.devices.dayAndNight.map(device => device.id));
        });
      },

      pushDayDevices() {
        this.devices.day.forEach((device) => {
          const { duration, power } = device;

          console.log(this.filterByPowerLeft(this.dayHours, power));
        });
      },

      filterByPowerLeft(indexes, power) {
        return this.powerLeft.map((powerLeft, index) => {
          return indexes.includes(index) && powerLeft - power >= 0 ? `${index}` : '';
        }).filter(v => v).map(v => Number(v));
      },
    },

    computed: {
      devices() {
        const { devices } = this.input;

        return {
          day: devices.filter(device => device.mode === 'day'),
          night: devices.filter(device => device.mode === 'night'),
          dayAndNight: devices.filter(device => device.duration === 24),
          anyTime: devices.filter(device => device.duration !== 24 && !device.mode),
        };
      },

      powerLeft() { // TODO
        return this.schedule.map((ids) => {
          const used = ids.map(id => (
            this.input.devices.find(device => device.id === id).power
          )).reduce((prev, next) => (
            prev + next
          ));

          return this.input.maxPower - used;
        });
      },

      dayHours() {
        return this.rates.map((rate, index) => {
          return index < 7 || index >= 21 ? '' : `${index}`;
        }).filter(v => v).map(v => Number(v));
      },

      nightHours() {
        return this.rates.map((rate, index) => {
          return index < 7 || index >= 21 ? `${index}` : '';
        }).filter(v => v).map(v => Number(v));
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
    width: 50%;

    &__container {
      display: flex;
    }
  }
</style>
