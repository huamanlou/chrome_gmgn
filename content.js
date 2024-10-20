chrome.storage.local.remove(["gmgn_check_result"], function () {
  var error = chrome.runtime.lastError;
  if (error) {
    console.error("remove error", error);
  }
});

const CACHE_DATA = {
  total_supply: 0,
  usd_price: 0,
};
const GMGN_CHECK_RESULT = {
  renounced_mint: false,
  top_10_holder: false,
  not_black_list: false,
  is_burn: false,
  holder_count: false,
  initial_quote_reserve: false,
  quote_reserve: false,
  market_value: false,
  profit_check: false,
  bad_wallet_check: false,
  flow_out_check: false,
};
const checkMarketValue = async function () {
  console.log(
    "mmmmmmm",
    CACHE_DATA.usd_price,
    CACHE_DATA.total_supply,
    CACHE_DATA.usd_price * CACHE_DATA.total_supply
  );
  if (CACHE_DATA.usd_price * CACHE_DATA.total_supply > 80000) {
    GMGN_CHECK_RESULT.market_value = true;
  } else {
    GMGN_CHECK_RESULT.market_value = false;
  }
  //   return res;
  await chrome.storage.local.set({
    gmgn_check_result: GMGN_CHECK_RESULT,
  });
};
const securityCheck = async function (data) {
  //   const res = {
  //     renounced_mint: false,
  //     top_10_holder: false,
  //     not_black_list: false,
  //     is_burn: false,
  //   };
  //放弃mint权限
  if (data?.renounced_mint == true) {
    GMGN_CHECK_RESULT.renounced_mint = true;
  }
  //前10持仓小于30%
  if (data?.top_10_holder_rate && data?.top_10_holder_rate < 0.3) {
    GMGN_CHECK_RESULT.top_10_holder = true;
  }
  //是否黑名单
  GMGN_CHECK_RESULT.not_black_list = !data.is_show_alert;
  //是否烧池子
  burn_ratio = parseInt(data.burn_ratio);
  GMGN_CHECK_RESULT.is_burn = burn_ratio >= 1 ? true : false;
  //   return res;
  await chrome.storage.local.set({
    gmgn_check_result: GMGN_CHECK_RESULT,
  });
};
const tokenInfoCheck = async function (data) {
  //   const res = {
  //     holder_count: false,
  //   };
  if (data.holder_count > 300) {
    GMGN_CHECK_RESULT.holder_count = true;
  }
  CACHE_DATA.total_supply = data.total_supply;
  checkMarketValue();
  //   return res;
  await chrome.storage.local.set({
    gmgn_check_result: GMGN_CHECK_RESULT,
  });
};
const tokenPoolInfoCheck = async function (data) {
  //   const res = {
  //     initial_quote_reserve: false,
  //     quote_reserve: false,
  //   };
  if (data.initial_quote_reserve > 79) {
    GMGN_CHECK_RESULT.initial_quote_reserve = true;
  }
  if (data.quote_reserve > 79) {
    GMGN_CHECK_RESULT.quote_reserve = true;
  }
  //   return res;
  await chrome.storage.local.set({
    gmgn_check_result: GMGN_CHECK_RESULT,
  });
};
const realtimeTokenPrice = async function (data) {
  let usd_price = data.usd_price;
  CACHE_DATA.usd_price = usd_price;
  checkMarketValue();
};

const topHoldersCheck = async function (data) {
  let top50 = data.slice(0, 50);
  //   let res = {
  //     profit_check: false,
  //     bad_wallet_check: false,
  //     flow_out_check: false,
  //   };
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
  if (profit_num > 25) {
    GMGN_CHECK_RESULT.profit_check = true;
  }
  if (bad_wallet_num < 5) {
    GMGN_CHECK_RESULT.bad_wallet_check = true;
  }
  if (flow_out_num < 5) {
    GMGN_CHECK_RESULT.flow_out_check = true;
  }
  //   return res;
  await chrome.storage.local.set({
    gmgn_check_result: GMGN_CHECK_RESULT,
  });
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
      chrome.runtime.sendMessage(
        { type: "token_security_sol" },
        function (response) {
          //   console.log("收到来自后台的回复：" + response);
        }
      );
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
      chrome.runtime.sendMessage({ type: "token_info" }, function (response) {
        //   console.log("收到来自后台的回复：" + response);
      });
    }
    //token pool info 接口
    if (url.startsWith("https://gmgn.ai/api/v1/token_pool_info_sol/sol")) {
      let response = JSON.parse(e.data.text);
      await tokenPoolInfoCheck(response.data);
      //   console.log("rrrrrrrr", res);
      console.log("cccccccc", GMGN_CHECK_RESULT);
      chrome.runtime.sendMessage(
        { type: "token_pool_info_sol" },
        function (response) {
          //   console.log("收到来自后台的回复：" + response);
        }
      );
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
      chrome.runtime.sendMessage(
        { type: "realtime_token_price" },
        function (response) {
          //   console.log("收到来自后台的回复：" + response);
        }
      );
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
      chrome.runtime.sendMessage({ type: "top_holders" }, function (response) {
        //   console.log("收到来自后台的回复：" + response);
      });
    }
  }
});
