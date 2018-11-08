Component({
    properties: {
      modalHidden: {
        type: Boolean,
        value: true
      }, //这里定义了modalHidden属性，属性值可以在组件使用时指定.写法为modal-hidden
      modalMsg: {
        type: String,
        value: ' ',
      }
    },
    data: {
      text: "text",
    },
    methods: {
      cancel: function () {
        this.setData({
            modalHidden: true,
        })

        this.triggerEvent('getmodaldata', { isSumbit:false});

      },
      submit: function () {
        this.setData({
            modalHidden: true,
        })

        this.triggerEvent('getmodaldata', { isSumbit:true});
      }
    }
  })