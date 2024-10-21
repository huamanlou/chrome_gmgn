let CHROME_CACHE_ID = null;
let CHROME_CACHE_NAME = null;

const getCacheName = function () {
  CHROME_CACHE_ID = window.location.pathname.split("/").pop();
  let cache_name = `gmgn_check_${CHROME_CACHE_ID}`;
  return cache_name;
};

const removeCache = function () {
  CHROME_CACHE_NAME = getCacheName();
  chrome.storage.local.remove([CHROME_CACHE_NAME], function () {
    var error = chrome.runtime.lastError;
    if (error) {
      console.error("remove error", error);
    }
  });
};

//清空旧的缓存
removeCache();

const CACHE_DATA = {
  total_supply: 0,
  usd_price: 0,
};

const GMGN_CHECK_RESULT = {
  renounced_mint: {
    value: null,
    res: false,
  },
  top_10_holder: {
    value: null,
    res: false,
  },
  not_black_list: {
    value: null,
    res: false,
  },
  is_burn: {
    value: null,
    res: false,
  },
  holder_count: {
    value: null,
    res: false,
  },
  initial_quote_reserve: {
    value: null,
    res: false,
  },
  quote_reserve: {
    value: null,
    res: false,
  },
  market_value: {
    value: null,
    res: false,
  },
  profit_check: {
    value: null,
    res: false,
  },
  bad_wallet_check: {
    value: null,
    res: false,
  },
  flow_out_check: {
    value: null,
    res: false,
  },
};
const updateStorage = async function () {
  CHROME_CACHE_NAME = getCacheName();
  console.log("uuuuuu", CHROME_CACHE_NAME);
  await chrome.storage.local.set({
    [CHROME_CACHE_NAME]: GMGN_CHECK_RESULT,
  });
  return true;
};
const checkMarketValue = async function () {
  console.log(
    "mmmmmmm",
    CACHE_DATA.usd_price,
    CACHE_DATA.total_supply,
    CACHE_DATA.usd_price * CACHE_DATA.total_supply
  );
  const value = parseInt(CACHE_DATA.usd_price * CACHE_DATA.total_supply);
  GMGN_CHECK_RESULT.market_value.value = parseInt(value / 1000) + "k";
  if (value > 80000) {
    GMGN_CHECK_RESULT.market_value.res = true;
  } else {
    GMGN_CHECK_RESULT.market_value.res = false;
  }
  //   return res;
  await updateStorage();
};
const securityCheck = async function (data) {
  //放弃mint权限
  if (data?.renounced_mint == true) {
    GMGN_CHECK_RESULT.renounced_mint.res = true;
  }
  //前10持仓小于30%
  if (data?.top_10_holder_rate && data?.top_10_holder_rate < 0.3) {
    GMGN_CHECK_RESULT.top_10_holder.value =
      parseInt(data.top_10_holder_rate * 100) + "%";
    GMGN_CHECK_RESULT.top_10_holder.res = true;
  } else {
    GMGN_CHECK_RESULT.top_10_holder.res = false;
  }
  //是否黑名单
  GMGN_CHECK_RESULT.not_black_list.res = data.renounced_freeze_account;
  //是否烧池子
  //   burn_ratio = parseInt(data.burn_ratio);
  GMGN_CHECK_RESULT.is_burn.res = data.burn_status == "burn" ? true : false;
  await updateStorage();
};
const tokenInfoCheck = async function (data) {
  GMGN_CHECK_RESULT.holder_count.value = data.holder_count;
  if (data.holder_count > 300) {
    GMGN_CHECK_RESULT.holder_count.res = true;
  } else {
    GMGN_CHECK_RESULT.holder_count.res = true;
  }
  CACHE_DATA.total_supply = data.total_supply;
  checkMarketValue();
  //   return res;
  await updateStorage();
};
const tokenPoolInfoCheck = async function (data) {
  GMGN_CHECK_RESULT.initial_quote_reserve.value = parseInt(
    data.initial_quote_reserve
  );
  if (data.initial_quote_reserve > 79) {
    GMGN_CHECK_RESULT.initial_quote_reserve.res = true;
  } else {
    GMGN_CHECK_RESULT.initial_quote_reserve.res = false;
  }
  GMGN_CHECK_RESULT.quote_reserve.value = parseInt(data.quote_reserve);
  if (data.quote_reserve > 100) {
    GMGN_CHECK_RESULT.quote_reserve.res = true;
  } else {
    GMGN_CHECK_RESULT.quote_reserve.res = false;
  }
  await updateStorage();
};
const realtimeTokenPrice = async function (data) {
  let usd_price = data.usd_price;
  CACHE_DATA.usd_price = usd_price;
  checkMarketValue();
};

const topHoldersCheck = async function (data) {
  let top50 = data.slice(0, 50);
  profit_num = 0;
  bad_wallet_num = 0;
  flow_out_num = 0;
  for (let item of top50) {
    // console.log("aaaaaa", item);
    if (item["profit"] > 0) {
      profit_num += 1;
    }
    if (item["usd_value"] > (item["netflow_usd"] + item["profit"]) * 2) {
      bad_wallet_num += 1;
    }
    if (item["profit"] > 0 && -item["netflow_usd"] / item["profit"] > 0.5) {
      flow_out_num += 1;
    }
  }
  GMGN_CHECK_RESULT.profit_check.value = profit_num;
  if (profit_num > 25) {
    GMGN_CHECK_RESULT.profit_check.res = true;
  } else {
    GMGN_CHECK_RESULT.profit_check.res = false;
  }
  GMGN_CHECK_RESULT.bad_wallet_check.value = bad_wallet_num;
  if (bad_wallet_num < 5) {
    GMGN_CHECK_RESULT.bad_wallet_check.res = true;
  } else {
    GMGN_CHECK_RESULT.bad_wallet_check.res = false;
  }
  GMGN_CHECK_RESULT.flow_out_check.value = flow_out_num;
  if (flow_out_num < 5) {
    GMGN_CHECK_RESULT.flow_out_check.res = true;
  } else {
    GMGN_CHECK_RESULT.flow_out_check.res = false;
  }
  await updateStorage();
};
const sendMessage = function (type) {
  chrome.runtime.sendMessage(
    { type: type, id: CHROME_CACHE_ID, cache_name: CHROME_CACHE_NAME },
    function (response) {
      //   console.log("收到来自后台的回复：" + response);
    }
  );
};

window.addEventListener("message", async (e) => {
  //处理接口返回数据
  if (e.data?.type == "request_data") {
    let url = e.data?.url;
    //安全告警数据接口
    if (url.startsWith("https://gmgn.ai/api/v1/token_security_sol/sol")) {
      let response = JSON.parse(e.data.text);
      await securityCheck(response.data);
      //   console.log("rrrrrrrr", res);
      console.log("cccccccc", GMGN_CHECK_RESULT);
      //   chrome.runtime.sendMessage(
      //     { type: "token_security_sol", cache_name: CHROME_CACHE_NAME },
      //     function (response) {
      //       //   console.log("收到来自后台的回复：" + response);
      //     }
      //   );
      sendMessage("token_security_sol");
    }
    //狙击者数据接口
    // if (
    //   url.startsWith("https://gmgn.ai/defi/quotation/v1/tokens/top_buyers/sol")
    // ) {
    //   let response = JSON.parse(e.data.text);
    //   let res = securityCheck(response.data);
    //   console.log("rrrrrrrr", res);
    // }
    //token info接口
    if (url.startsWith("https://gmgn.ai/api/v1/token_info/sol")) {
      let response = JSON.parse(e.data.text);
      await tokenInfoCheck(response.data);
      //   console.log("rrrrrrrr", res);
      console.log("cccccccc", GMGN_CHECK_RESULT);
      //   chrome.runtime.sendMessage(
      //     { type: "token_info", cache_name: CHROME_CACHE_NAME },
      //     function (response) {
      //       //   console.log("收到来自后台的回复：" + response);
      //     }
      //   );
      sendMessage("token_info");
    }
    //token pool info 接口
    if (url.startsWith("https://gmgn.ai/api/v1/token_pool_info_sol/sol")) {
      let response = JSON.parse(e.data.text);
      await tokenPoolInfoCheck(response.data);
      //   console.log("rrrrrrrr", res);
      console.log("cccccccc", GMGN_CHECK_RESULT);
      //   chrome.runtime.sendMessage(
      //     { type: "token_pool_info_sol", cache_name: CHROME_CACHE_NAME },
      //     function (response) {
      //       //   console.log("收到来自后台的回复：" + response);
      //     }
      //   );
      sendMessage("token_pool_info_sol");
    }
    //实时价格接口
    if (
      url.startsWith(
        "https://gmgn.ai/defi/quotation/v1/sol/tokens/realtime_token_price"
      )
    ) {
      let response = JSON.parse(e.data.text);
      await realtimeTokenPrice(response.data);
      console.log("cccccccc", GMGN_CHECK_RESULT);
      //   chrome.runtime.sendMessage(
      //     { type: "realtime_token_price", cache_name: CHROME_CACHE_NAME },
      //     function (response) {
      //       //   console.log("收到来自后台的回复：" + response);
      //     }
      //   );
      sendMessage("realtime_token_price");
    }
    //持有者排名接口
    if (
      url.startsWith(
        "https://gmgn.ai/defi/quotation/v1/tokens/top_holders/sol/"
      )
    ) {
      let response = JSON.parse(e.data.text);
      await topHoldersCheck(response.data);
      //   console.log("rrrrrrrr", res);
      console.log("cccccccc", GMGN_CHECK_RESULT);
      //   chrome.runtime.sendMessage(
      //     { type: "top_holders", cache_name: CHROME_CACHE_NAME },
      //     function (response) {
      //       //   console.log("收到来自后台的回复：" + response);
      //     }
      //   );
      sendMessage("top_holders");
    }
  }
});
