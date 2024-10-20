// document.getElementById("data_check").addEventListener("click", async () => {
//   chrome.runtime.sendMessage({ greeting: "data_check" }, function (response) {
//     alert("数据采集成功");
//   });
// });

const updateResult = async function () {
  let gmgn_check_result = {};
  let res = await chrome.storage.local.get();
  console.log("local", res);
  if (res["gmgn_check_result"]) {
    gmgn_check_result = {
      ...gmgn_check_result,
      ...res["gmgn_check_result"],
    };
  }
  if (typeof gmgn_check_result.is_burn != "undefined") {
    let text = gmgn_check_result.is_burn ? "通过" : "未通过";
    document.querySelector("#is_burn > span").innerHTML = text;
  }
  if (typeof gmgn_check_result.not_black_list != "undefined") {
    let text = gmgn_check_result.not_black_list ? "通过" : "未通过";
    document.querySelector("#not_black_list > span").innerHTML = text;
  }
  if (typeof gmgn_check_result.renounced_mint != "undefined") {
    let text = gmgn_check_result.renounced_mint ? "通过" : "未通过";
    document.querySelector("#renounced_mint > span").innerHTML = text;
  }
  if (typeof gmgn_check_result.top_10_holder != "undefined") {
    let text = gmgn_check_result.top_10_holder ? "通过" : "未通过";
    document.querySelector("#top_10_holder > span").innerHTML = text;
  }
  if (typeof gmgn_check_result.holder_count != "undefined") {
    let text = gmgn_check_result.holder_count ? "通过" : "未通过";
    document.querySelector("#holder_count > span").innerHTML = text;
  }
  if (typeof gmgn_check_result.initial_quote_reserve != "undefined") {
    let text = gmgn_check_result.initial_quote_reserve ? "通过" : "未通过";
    document.querySelector("#initial_quote_reserve > span").innerHTML = text;
  }
  if (typeof gmgn_check_result.quote_reserve != "undefined") {
    let text = gmgn_check_result.quote_reserve ? "通过" : "未通过";
    document.querySelector("#quote_reserve > span").innerHTML = text;
  }
  if (typeof gmgn_check_result.market_value != "undefined") {
    let text = gmgn_check_result.market_value ? "通过" : "未通过";
    document.querySelector("#market_value > span").innerHTML = text;
  }
  if (typeof gmgn_check_result.profit_check != "undefined") {
    let text = gmgn_check_result.profit_check ? "通过" : "未通过";
    document.querySelector("#profit_check > span").innerHTML = text;
  }
  if (typeof gmgn_check_result.bad_wallet_check != "undefined") {
    let text = gmgn_check_result.bad_wallet_check ? "通过" : "未通过";
    document.querySelector("#bad_wallet_check > span").innerHTML = text;
  }
  if (typeof gmgn_check_result.flow_out_check != "undefined") {
    let text = gmgn_check_result.flow_out_check ? "通过" : "未通过";
    document.querySelector("#flow_out_check > span").innerHTML = text;
  }
};

document.addEventListener("DOMContentLoaded", async function () {
  updateResult();
});

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  console.log("收到来自content-script的消息：", request);
  let gmgn_check_result = {};
  let res = await chrome.storage.local.get();
  console.log("local", res);
  if (res["gmgn_check_result"]) {
    gmgn_check_result = {
      ...gmgn_check_result,
      ...res["gmgn_check_result"],
    };
  }
  // let data = request.data;
  if (request.type == "token_security_sol") {
    if (typeof gmgn_check_result.is_burn != "undefined") {
      let text = gmgn_check_result.is_burn ? "通过" : "未通过";
      document.querySelector("#is_burn > span").innerHTML = text;
    }
    if (typeof gmgn_check_result.not_black_list != "undefined") {
      let text = gmgn_check_result.not_black_list ? "通过" : "未通过";
      document.querySelector("#not_black_list > span").innerHTML = text;
    }
    if (typeof gmgn_check_result.renounced_mint != "undefined") {
      let text = gmgn_check_result.renounced_mint ? "通过" : "未通过";
      document.querySelector("#renounced_mint > span").innerHTML = text;
    }
    if (typeof gmgn_check_result.top_10_holder != "undefined") {
      let text = gmgn_check_result.top_10_holder ? "通过" : "未通过";
      document.querySelector("#top_10_holder > span").innerHTML = text;
    }
  }
  if (request.type == "token_info") {
    if (typeof gmgn_check_result.holder_count != "undefined") {
      let text = gmgn_check_result.holder_count ? "通过" : "未通过";
      document.querySelector("#holder_count > span").innerHTML = text;
    }
  }
  if (request.type == "token_pool_info_sol") {
    if (typeof gmgn_check_result.initial_quote_reserve != "undefined") {
      let text = gmgn_check_result.initial_quote_reserve ? "通过" : "未通过";
      document.querySelector("#initial_quote_reserve > span").innerHTML = text;
    }
    if (typeof gmgn_check_result.quote_reserve != "undefined") {
      let text = gmgn_check_result.quote_reserve ? "通过" : "未通过";
      document.querySelector("#quote_reserve > span").innerHTML = text;
    }
  }
  if (request.type == "realtime_token_price") {
    if (typeof gmgn_check_result.market_value != "undefined") {
      let text = gmgn_check_result.market_value ? "通过" : "未通过";
      document.querySelector("#market_value > span").innerHTML = text;
    }
  }
  if (request.type == "top_holders") {
    if (typeof gmgn_check_result.profit_check != "undefined") {
      let text = gmgn_check_result.profit_check ? "通过" : "未通过";
      document.querySelector("#profit_check > span").innerHTML = text;
    }
    if (typeof gmgn_check_result.bad_wallet_check != "undefined") {
      let text = gmgn_check_result.bad_wallet_check ? "通过" : "未通过";
      document.querySelector("#bad_wallet_check > span").innerHTML = text;
    }
    if (typeof gmgn_check_result.flow_out_check != "undefined") {
      let text = gmgn_check_result.flow_out_check ? "通过" : "未通过";
      document.querySelector("#flow_out_check > span").innerHTML = text;
    }
  }
  // console.log(request, sender, sendResponse);
  // sendResponse("我是后台，我已收到你的消息：" + JSON.stringify(request));
});
