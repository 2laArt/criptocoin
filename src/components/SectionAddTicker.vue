<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            type="text"
            name="wallet"
            id="wallet"
            class="
              block
              w-full
              pr-10
              border-gray-300
              text-gray-900
              focus:outline-none focus:ring-gray-500 focus:border-gray-500
              sm:text-sm
              rounded-md
            "
            placeholder="Например DOGE"
            v-model="ticker"
            @keydown.enter="addCoin"
            @input="inputCoin()"
          />
        </div>
        <template v-if="ticker !== ''">
          <div
            class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
          >
            <span
              class="
                inline-flex
                items-center
                px-2
                m-1
                rounded-md
                text-xs
                font-medium
                bg-gray-300
                text-gray-800
                cursor-pointer
              "
              v-for="tick of currentValidList()"
              :key="tick"
              @click="ticker = tick"
            >
              {{ tick }}
            </span>
          </div>
          <div class="text-sm text-red-600" v-show="checkHaveCoin">
            Такой тикер уже добавлен
          </div>
        </template>
      </div>
    </div>
    <!--  -->
    <!-- button add -->
    <add-button @click="addCoin" />
    <!-- button add -->
    <!--  -->
  </section>
</template>
<script>
import AddButton from "./AddButton.vue";
import { getFullListCoins } from "../requestFullListCoin";

export default {
  components: {
    AddButton,
  },
  props: {
    tickerArr: {
      type: Array,
      required: false,
      default: [],
    },
  },
  data() {
    return {
      ticker: "",
      fullListCoin: [],
      helpListArr: [],
      checkHaveCoin: false,
    };
  },
  created() {
    getFullListCoins(this.fullListCoin);
  },
  watch: {
    ticker() {
      this.checkHaveCoin = false;
    },
  },
  methods: {
    addCoin() {
      this.tickerArr.find((i) => i.name === this.ticker.toUpperCase())
        ? (this.checkHaveCoin = true)
        : (this.checkHaveCoin = false);

      if (this.checkHaveCoin === false) {
        this.$emit("add-ticker", this.ticker);
        this.ticker = "";
      }
      this.helpListArr = [];
    },
    inputCoin() {
      let re = new RegExp(`^${this.ticker}`, "gi");
      this.helpListArr = this.fullListCoin
        .filter((i) => i.match(re))
        .sort((a, b) => a.length - b.length)
        .slice(0, 4);
    },
    currentValidList() {
      return this.checkHaveCoin
        ? this.tickerArr.map((i) => i.name)
        : this.helpListArr;
    },
  },
};
</script>
