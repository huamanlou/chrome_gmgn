const updateResult = async function (cache_name, type = "all") {
  // if (CHROME_CACHE_NAME == null) {
  //   CHROME_CACHE_NAME = getCacheName();
  // }
  console.log("hhhhyhh", cache_name);
  let gmgn_check_result = {};
  let res = await chrome.storage.local.get();
  console.log("local", res);
  if (res[cache_name]) {
    gmgn_check_result = res[cache_name];
  } else {
    console.log("local storage is empty");
    return;
  }
  if (type == "token_security_sol" || type == "all") {
    if (typeof gmgn_check_result.is_burn != "undefined") {
      let class_name = gmgn_check_result.is_burn.res ? "success" : "fail";
      document.querySelector("#is_burn").className = class_name;
      if (gmgn_check_result.is_burn.value != null) {
        document.querySelector("#is_burn .data").textContent =
          gmgn_check_result.is_burn.value;
      }
    }
    if (typeof gmgn_check_result.not_black_list != "undefined") {
      let class_name = gmgn_check_result.not_black_list.res
        ? "success"
        : "fail";
      document.querySelector("#not_black_list").className = class_name;
      if (gmgn_check_result.not_black_list.value != null) {
        document.querySelector("#not_black_list .data").textContent =
          gmgn_check_result.not_black_list.value;
      }
    }
    if (typeof gmgn_check_result.renounced_mint != "undefined") {
      let class_name = gmgn_check_result.renounced_mint.res
        ? "success"
        : "fail";
      document.querySelector("#renounced_mint").className = class_name;
      if (gmgn_check_result.renounced_mint.value != null) {
        document.querySelector("#renounced_mint .data").textContent =
          gmgn_check_result.renounced_mint.value;
      }
    }
    if (typeof gmgn_check_result.top_10_holder != "undefined") {
      let class_name = gmgn_check_result.top_10_holder.res ? "success" : "fail";
      document.querySelector("#top_10_holder").className = class_name;
      if (gmgn_check_result.top_10_holder.value != null) {
        document.querySelector("#top_10_holder .data").textContent =
          gmgn_check_result.top_10_holder.value;
      }
    }
  }
  if (type == "token_info" || type == "all") {
    if (typeof gmgn_check_result.holder_count != "undefined") {
      let class_name = gmgn_check_result.holder_count.res ? "success" : "fail";
      document.querySelector("#holder_count").className = class_name;
      if (gmgn_check_result.holder_count.value != null) {
        document.querySelector("#holder_count .data").textContent =
          gmgn_check_result.holder_count.value;
      }
    }
  }
  if (type == "token_pool_info_sol" || type == "all") {
    if (typeof gmgn_check_result.initial_quote_reserve != "undefined") {
      let class_name = gmgn_check_result.initial_quote_reserve.res
        ? "success"
        : "fail";
      document.querySelector("#initial_quote_reserve").className = class_name;
      if (gmgn_check_result.initial_quote_reserve.value != null) {
        document.querySelector("#initial_quote_reserve .data").textContent =
          gmgn_check_result.initial_quote_reserve.value;
      }
    }
    if (typeof gmgn_check_result.quote_reserve != "undefined") {
      let class_name = gmgn_check_result.quote_reserve.res ? "success" : "fail";
      document.querySelector("#quote_reserve").className = class_name;
      if (gmgn_check_result.quote_reserve.value != null) {
        document.querySelector("#quote_reserve .data").textContent =
          gmgn_check_result.quote_reserve.value;
      }
    }
  }
  if (type == "realtime_token_price" || type == "all") {
    if (typeof gmgn_check_result.market_value != "undefined") {
      let class_name = gmgn_check_result.market_value.res ? "success" : "fail";
      document.querySelector("#market_value").className = class_name;
      if (gmgn_check_result.market_value.value != null) {
        document.querySelector("#market_value .data").textContent =
          gmgn_check_result.market_value.value;
      }
    }
  }
  if (type == "top_holders" || type == "all") {
    if (typeof gmgn_check_result.profit_check != "undefined") {
      let class_name = gmgn_check_result.profit_check.res ? "success" : "fail";
      document.querySelector("#profit_check").className = class_name;
      if (gmgn_check_result.profit_check.value != null) {
        document.querySelector("#profit_check .data").textContent =
          gmgn_check_result.profit_check.value;
      }
    }
    if (typeof gmgn_check_result.bad_wallet_check != "undefined") {
      let class_name = gmgn_check_result.bad_wallet_check.res
        ? "success"
        : "fail";
      document.querySelector("#bad_wallet_check").className = class_name;
      if (gmgn_check_result.bad_wallet_check.value != null) {
        document.querySelector("#bad_wallet_check .data").textContent =
          gmgn_check_result.bad_wallet_check.value;
      }
    }
    if (typeof gmgn_check_result.flow_out_check != "undefined") {
      let class_name = gmgn_check_result.flow_out_check.res
        ? "success"
        : "fail";
      document.querySelector("#flow_out_check").className = class_name;
      if (gmgn_check_result.flow_out_check.value != null) {
        document.querySelector("#flow_out_check .data").textContent =
          gmgn_check_result.flow_out_check.value;
      }
    }
  }
};

document.addEventListener("DOMContentLoaded", async function () {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      let currentTab = tabs[0];
      let id = currentTab.url.split("/").pop();
      let cache_name = `gmgn_check_${id}`;
      document.querySelector("#gmgn_id").textContent = id;
      console.log("init cache_name", cache_name);
      updateResult(cache_name);
    }
  );
});

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  console.log("收到来自content-script的消息：", request);
  let type = request.type;
  let cache_name = request.cache_name;
  let id = request.id;
  document.querySelector("#gmgn_id").textContent = id;
  updateResult(cache_name, type);

  // console.log(request, sender, sendResponse);
  // sendResponse("我是后台，我已收到你的消息：" + JSON.stringify(request));
});
