const getCurrentCommandCount = () => {
  const selector = document.querySelectorAll(".commands-command-count")[0];
  return !!selector && parseInt(selector.innerText.match(/\d+/g)[0]);
};

const getCurrentLightCavalryCount = () => {
  const selector = document.querySelectorAll(".all_unit [data-count=light]")[0];
  return !!selector && parseInt(selector.innerText);
};

const getCurrentSpyCount = () => {
  const selector = document.querySelectorAll(".all_unit [data-count=spy]")[0];
  return !!selector && parseInt(selector.innerText);
};


const getTiming = (multiplier = 2) => (multiplier * 1000) + (multiplier * 2000) * Math.random();

const sleep = ms => new Promise(res => setTimeout(res, ms));

const setSleep = async (callback, timing = 2) => {
  await sleep(getTiming(timing));
  callback();
}

const startFarm = () => {
  let _cmdCount = 0;
  let _incomingCount = 0;
  let intervalLock = false;
  console.log("Taming started");

  const homeQueryParam = "screen=overview";
  const farmQueryParam = "screen=am_farm";
  const incomingQueryParam = "mode=incomings";

  const intervalId = setInterval(async () => {
    if(!!document.querySelectorAll(".popup_box_close")[0]) {
      document.querySelectorAll(".popup_box_close")[0].click();
    }

    // Prevent police
    if (document.querySelectorAll("#bot_check").length > 0 ||
        document.querySelectorAll("#popup_box_bot_protection").length > 0 ||
        document.querySelectorAll("#botprotection_quest").length > 0) {
      clearInterval(intervalId);
      console.log("Stopped petting");
    }

    if(intervalLock) {
      return false;
    }

    if(document.querySelectorAll("#incomings_cell").length > 0
        && parseInt(document.querySelectorAll("#incomings_cell")[0].innerText) > _incomingCount) {
      console.log("Welcome customer");
      _incomingCount = parseInt(document.querySelectorAll("#incomings_cell")[0].innerText)
      await setSleep(() => document.querySelectorAll("#incomings_cell a")[0].click());
    }

    if(document.location.search.includes(incomingQueryParam)) {
      intervalLock = true;
      document.querySelectorAll("#select_all")[0].click();
      document.querySelectorAll("input[value='Label']")[0].click();
      console.log("Customer delivered");
      await setSleep(() => document.querySelectorAll("#menu_row2_village a")[0].click());

      intervalLock = false;
    }

    else if(document.location.search.includes(homeQueryParam)) {
      intervalLock = true;

      // 1. Grow the stable
      /*const farmLeft = parseInt(document.querySelectorAll("#header_info .box-item #pop_max_label")[0].innerText) - parseInt(document.querySelectorAll("#header_info .box-item #pop_current_label")[0].innerText);

      // 1.1. Make it grow
      if(farmLeft <= 50) {
        // No space, lets buy more
        console.log("Go to buy more land");
        const upgradeFarmCta = document.querySelectorAll("#upgrade_level_farm")[0];

        if(!!upgradeFarmCta) {
          await setSleep(() => upgradeFarmCta.click());
        }
      } else if (document.querySelectorAll("#l_stable .building_extra")[0].innerText === "") {
        // No horsies growing, lets buy more
      } else if (document.querySelectorAll("#l_barracks .building_extra")[0].innerText === "") {
        // No lumberjacks forming, lets educate more
      }*/

      const cmdCount = getCurrentCommandCount();
      const lcCount = getCurrentLightCavalryCount();
      const spyCount = getCurrentSpyCount();

      if (!cmdCount) {
        console.log("No stables");
        intervalLock = false;
        return false;
      }

      if (_cmdCount === 0) {
        _cmdCount = cmdCount;
        console.log("Starting stables");
        intervalLock = false;
        return false;
      }

      console.log("On stables");

      // 2. Less commands, check LC and verify if needs to resend
      if (_cmdCount > cmdCount || !!lcCount) {

        // 2.1. If enough LC, go to LA
        if (lcCount >= 4 && spyCount >= 1) {
          console.log("Going to tame the horses");
          await setSleep(() => document.querySelectorAll("#manager_icon_farm")[0].click());
        }
      }

      intervalLock = false;
    }

    else if (document.location.search.includes(farmQueryParam)) {
      intervalLock = true;

      let spyCount = parseInt(document.querySelectorAll(".unit-item.unit-item-spy")[0].innerText);
      let lightCount = parseInt(document.querySelectorAll(".unit-item.unit-item-light")[0].innerText);

      if(spyCount < 1 || lightCount < 4) {
        console.log("Back to stable door");
        await setSleep(() => document.querySelectorAll("#menu_row2_village a")[0].click());
        intervalLock = false;
        return false;
      }

      const prodOverall = 30;
      const lcCarry = 320;
      const lcSpeed = 10;
      const villageList = document.querySelectorAll("#plunder_list [id^='village_']");

      for(let i = 0; i < villageList.length; i++) {
        const _vil = villageList[i];
        const _atkElem = _vil.querySelectorAll("td")[3].querySelector("img");
        const _atkCount = !!_atkElem ? parseInt(_atkElem.getAttribute("data-title").match(/\d+/)[0]) : 0;
        const _dist = parseFloat(_vil.querySelectorAll("td")[7].innerText) * lcSpeed;
        let _res = 0;

        _vil.querySelectorAll("td")[5].querySelectorAll(".nowrap").forEach(r => _res += parseInt(r.innerText.replace(".", "")));
        _res += _dist * (prodOverall * 3) / 60;
        _res += -_atkCount * lcCarry;

        if(_res >= lcCarry && _atkCount < Math.ceil(_dist / 60) ) {
          spyCount = parseInt(document.querySelectorAll(".unit-item.unit-item-spy")[0].innerText);
          lightCount = parseInt(document.querySelectorAll(".unit-item.unit-item-light")[0].innerText);

          if(spyCount < 1 || lightCount < 4) {
            console.log("Back to stable door");
            await setSleep(() => document.querySelectorAll("#menu_row2_village a")[0].click());
            intervalLock = false;
            return false;
          }

          await setSleep(() => _vil.querySelector(".farm_icon.farm_icon_a").click(), 5);
        }
      }

      console.log("Back to stable door");
      await setSleep(() => document.querySelectorAll("#menu_row2_village a")[0].click());

      intervalLock = false;
    }
  }, 5000);
};

startFarm();
