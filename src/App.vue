<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      class="
        fixed
        w-100
        h-100
        opacity-1
        bg-purple-800
        inset-0
        z-50
        flex
        items-center
        justify-center
      "
      v-if="loadPage"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <div class="container">
      <!-- ----------------------------------------------------------- -->
      <!-- add ticker -->
      <section-add-ticker :tickerArr="tickerArr" @add-ticker="addCoin" />
      <!-- add ticker -->
      <!--  ------------------------------------------------------------------>
      <hr class="w-full border-t border-gray-600 my-4" />
      <div class="filter">
        <button
          type="button"
          class="
            my-4
            mx-2
            inline-flex
            items-center
            py-2
            px-4
            border border-transparent
            shadow-sm
            text-sm
            leading-4
            font-medium
            rounded-full
            text-white
            bg-gray-600
            hover:bg-gray-700
            transition-colors
            duration-300
            focus:outline-none
            focus:ring-2
            focus:ring-offset-2
            focus:ring-gray-500
          "
          @click="page--"
          v-show="page > 0"
        >
          Pref
        </button>
        <button
          type="button"
          class="
            my-4
            mx-2
            inline-flex
            items-center
            py-2
            px-4
            border border-transparent
            shadow-sm
            text-sm
            leading-4
            font-medium
            rounded-full
            text-white
            bg-gray-600
            hover:bg-gray-700
            transition-colors
            duration-300
            focus:outline-none
            focus:ring-2
            focus:ring-offset-2
            focus:ring-gray-500
          "
          @click="page++"
          v-if="hasNextPage"
        >
          Next
        </button>
        <input
          type="input"
          class="
            block
            p-2
            border-gray-300
            text-gray-900
            focus:outline focus:ring-gray-500 focus:border-gray-500
            sm:text-sm
            rounded-md
          "
          placeholder="filter"
          v-model="filter"
        />
      </div>
      <hr class="w-full border-t border-gray-600 my-4" />
      <template v-if="tickerArr.length">
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <!-- coinSection -->
          <div
            class="
              bg-white
              overflow-hidden
              shadow
              rounded-lg
              border-purple-800 border-solid
              cursor-pointer
            "
            v-for="tick of paginatedTickers"
            :key="tick"
            @click="selected(tick)"
            :class="{
              'border-4': chartCoin == tick,
              'bg-red-100': tick.price == `N/A`,
            }"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ tick.name }} - {{ currentCurrency }}
              </dt>
              <dd
                class="mt-1 text-3xl font-semibold text-gray-900"
                :style="{ color: `#000` }"
              >
                {{ tick.price }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              class="
                flex
                items-center
                justify-center
                font-medium
                w-full
                bg-gray-100
                px-4
                py-4
                sm:px-6
                text-md text-gray-500
                hover:text-gray-600 hover:bg-gray-200 hover:opacity-20
                transition-all
                focus:outline-none
              "
              @click.stop="deletCoin(tick)"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
          <!-- coinSection -->
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <!-- chart -->
      <!--  --------------------------------------------------------->
      <chart-section
        :chartCoin="chartCoin"
        :currentCurrency="currentCurrency"
        :chartCoinArr="chartCoinArr"
        @hide-chart="chartCoin = {}"
      />
      <!-- chart -->
      <!-- ------------------------------------------------------- -->
    </div>
  </div>
</template>


<script>
import { subscribeToUpdata, unsubscribeToUpdata } from "./api";
import ChartSection from "./components/chartSection.vue";
import SectionAddTicker from "./components/SectionAddTicker.vue";

export default {
  name: "App",
  components: {
    SectionAddTicker,
    ChartSection,
  },
  data() {
    return {
      loadPage: true,
      currentCurrency: "USD",
      tickerArr: [],
      filter: "",
      chartCoin: {},
      chartCoinArr: [],
      page: 0,
    };
  },
  created: function () {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );
    if (windowData.filter) {
      this.filter = windowData.filter;
    }
    if (windowData.page) {
      this.page = windowData.page;
    }

    const tickersData = localStorage.getItem("tickersJson");
    if (tickersData) {
      this.tickerArr = JSON.parse(tickersData);
      this.tickerArr.forEach((ticker) => {
        subscribeToUpdata(ticker.name, (newPrice) =>
          this.updataTickers(ticker.name, newPrice)
        );
      });
    }
  },
  mounted() {
    setTimeout(() => (this.loadPage = false));
  },
  computed: {
    startIndex() {
      return this.page * 6;
    },
    endIndex() {
      return (this.page + 1) * 6;
    },
    filteredTickers() {
      return this.tickerArr.filter((i) =>
        i.name.includes(this.filter.toUpperCase())
      );
    },
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },
    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },
    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },
  watch: {
    filter() {
      this.page = 0;
    },
    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `?filter=${value.filter}&page=${value.page}`
      );
    },
    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 0) {
        this.page--;
      }
    },
    tickerArr() {
      localStorage.setItem("tickersJson", JSON.stringify(this.tickerArr));
    },
    chartCoin() {
      this.chartCoinArr = [];
      // this.selected();
    },
  },
  methods: {
    addCoin(ticker) {
      const newTicker = { name: ticker.toUpperCase(), price: "-" };

      this.tickerArr = [...this.tickerArr, newTicker];

      subscribeToUpdata(newTicker.name, (newPrice) =>
        this.updataTickers(newTicker.name, newPrice)
      );

      this.filter = "";
    },
    updataTickers(tickerName, newPrice) {
      const currentTicker = this.tickerArr.find(
        (item) => item.name === tickerName
      );
      if (currentTicker.name === this.chartCoin?.name) {
        this.chartCoinArr.push(newPrice);
      }
      if (currentTicker.price) {
        currentTicker.price = newPrice;
      }
    },
    selected(tick) {
      this.chartCoin = tick;
    },
    deletCoin(tick) {
      if (this.chartCoin === tick) {
        this.chartCoin = {};
      }
      this.tickerArr = this.tickerArr.filter((i) => i !== tick);
      unsubscribeToUpdata(tick.name);
    },
  },
};
</script>

<!-- <style src="./sources/app.css"></style>-->

