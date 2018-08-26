<template lang="pug">
  transition-group.notify__container(name="fade", tag="div")
    .notify(v-for="notification in notifications",
      @click="filter(notification)",
      :key="notification.id"
      ) {{ notification.message }}
</template>

<script>
  import uuid from 'js/uuid';

  export default {
    data() {
      return {
        notifications: [],
      };
    },

    methods: {
      push(message) {
        this.notifications.unshift({
          message,
          id: uuid(),
        });
      },

      filter({ id }) {
        this.notifications = this.notifications.filter(notification => notification.id !== id);
      },
    },
  };
</script>

<style lang="scss" scoped>
  $red: #FF5777;
  $transition-duration: 0.2s;

  .notify {
    &__container {
      box-sizing: border-box;
      height: 100%;
      overflow: auto;
      pointer-events: none;
      position: fixed;
      right: 20px;
      top: 0;
      width: 400px;
    }

    background: $red;
    border-radius: 4px;
    box-sizing: border-box;
    color: white;
    cursor: pointer;
    display:flex;
    font-size: 18px;
    justify-content: space-between;
    margin-top: 20px;
    padding: 20px;
    pointer-events: auto;

    &::after {
      content: "✖";
      display: block;
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: all $transition-duration;
  }

  .fade-move {
    transition: transform $transition-duration;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
    transform: translateX(60px);
  }
</style>
