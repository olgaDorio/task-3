<template lang="pug">
  .card
    .card__title
      slot(name="title")
      button(v-if="expand", @click="toggle") {{ Object.keys(style).length ? '▼' : '▲' }}
    pre.code(:style="expand ? style : {}")
      slot
</template>

<script>
  export default {
    props: {
      expand: Boolean,
    },

    methods: {
      toggle() {
        if (Object.keys(this.style).length) {
          this.style = {};
        } else {
          this.style = { height: '20vh' };
        }
      },
    },

    data() {
      return {
        style: { height: '20vh' },
      };
    },
  };
</script>

<style lang="scss" scoped>
  $material-shadow: 0 3px 1px -2px rgba(black, 0.2),
    0 2px 2px 0 rgba(black, 0.14),
    0 1px 5px 0 rgba(black, 0.12);
  $border-radius: 2px;

  $grey-dark: #757575;
  $grey-medium: #EDEDED;

  .card {
    border-radius: $border-radius;
    box-shadow: $material-shadow;
    display: flex;
    flex-direction: column;
    margin: 2% 0;
    padding: 16px;

    &__title {
      display: flex;
      font-size: 24px;
      justify-content: space-between;
      letter-spacing: 0;
      line-height: 32px;
    }
  }

  .code {
    background: $grey-medium;
    border-radius: $border-radius;
    color: $grey-dark;
    overflow: auto;
    padding: 20px;
  }
</style>
