Component({
  properties: {
    type: {
      type: String,
      value: 'primary' // primary, secondary, ghost
    }
  },
  methods: {
    handleTap() {
      this.triggerEvent('tap');
    }
  }
})
