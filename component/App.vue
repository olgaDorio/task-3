<template lang="pug">
  div
    v-notify(ref="notify")

    .radio__group
      label.radio__label(v-for="object, n in inputs")
        input.radio(type="radio", name="select", :value="object", v-model="input")
        | input[{{ n }}]

    v-counter(@notify = "push", :input="input")
</template>

<script>
  import notify from 'Notify';
  import counter from 'Counter';
  import inputs from 'js/inputs';

  export default {
    components: {
      'v-notify': notify,
      'v-counter': counter,
    },

    data() {
      return {
        a: '5',
        b: '6',
        c: '7',
        inputs,
        input: inputs[0],
      };
    },

    methods: {
      push(message) {
        this.$refs.notify.push(message);
      },
    },
  };
</script>

<style lang="scss">
  $grey-light: #FAFAFA;

  body {
    background: $grey-light;
    box-sizing: border-box;
    font-family: sans-serif;
    height: 100vh;
    margin: 0;
    padding: 2%;
  }

  .radio__group {
    display: flex;
    font-size: 18px;
    justify-content: space-between;
  }
</style>
