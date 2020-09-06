const LCDPLATE = require("adafruit-i2c-lcd").plate;
const lcd = new LCDPLATE(1, 0x20);
const fetch = require("node-fetch");

lcd.createChar(1, [0, 4, 14, 14, 14, 0, 0]);
const charUp = "\x01";
lcd.createChar(2, [0, 0, 14, 14, 14, 4, 0]);
const charDown = "\x02";

// lcd.backlight(lcd.colors.RED);
// lcd.message("M'stone");

// lcd.on("button_change", function (button) {
//   lcd.clear();
//   lcd.message("Button changed:\n" + lcd.buttonName(button));
// });
let dataTypes = {
  NATIONAL: "national",
  REGIONAL: "regional",
};
let currentSelected = "national";

let screenData = { color: lcd.colors.GREEN, line1: "fetching data", line2: "" };

async function getData() {
  setScreen({ color: lcd.colors.GREEN, line1: "fetching data", line2: "" });
  const national = await fetch(
    "https://api.coronavirus.data.gov.uk/v1/data?filters=areaType=nation;areaName=england&structure={%22name%22:%22areaName%22,%22cases%22:%22newCasesByPublishDate%22,%22date%22:%22date%22,%22admissions%22:%22newAdmissions%22}"
  );
  //   console.log(result);
  const regional = await fetch(
    "https://api.coronavirus.data.gov.uk/v1/data?filters=areaName=Kent&structure={%22name%22:%22areaName%22,%22cases%22:%22newCasesByPublishDate%22,%22date%22:%22date%22,%22admissions%22:%22newAdmissions%22}"
  );

  return {
    national: (await national.json()).data.slice(0, 2),
    regional: (await regional.json()).data.slice(0, 2),
  };
}

function percIncrease(a, b) {
  let percent;
  if (b !== 0) {
    if (a !== 0) {
      percent = ((b - a) / a) * 100;
    } else {
      percent = b * 100;
    }
  } else {
    percent = -a * 100;
  }
  return Math.floor(percent);
}

async function getScreenData(data) {
  console.log(JSON.stringify(data));
  //   data[0].cases = 100;
  //   data[1].cases = 98;
  let percIncDec = percIncrease(data[0].cases, data[1].cases);
  let percRounded = percIncDec.toFixed(2).replace("-", "");

  let char;
  if (data[0].cases >= data[1].cases) {
    char = charUp;
  } else {
    char = charDown;
  }

  let color;

  if (percIncDec >= 0) {
    color = lcd.colors.GREEN;
  } else if (percIncDec >= -10) {
    color = lcd.colors.YELLOW;
  } else {
    color = lcd.colors.RED;
  }

  // if(percRounded)

  let line1 = data[0].name + " " + char + percRounded + "%";
  let line2 = "Cases: " + data[0].cases;

  return { color, line1, line2 };
}

function setScreen(obj) {
  lcd.clear();
  lcd.backlight(obj.color);
  lcd.message(obj.line1 + "\n" + obj.line2);
}

async function main(dataType) {
  currentSelected = dataType;
  let latestData = await getData();
  screenData = await getScreenData(latestData[dataType]);
  await setScreen(screenData);

  //   console.log(latestData);
}

let lastButtonClick = new Date().getTime();

lcd.on("button_change", function (button) {
  //this is shit, do better
  let thisButtonClick = new Date().getTime();

  if (thisButtonClick - lastButtonClick > 500) {
    lastButtonClick = thisButtonClick;
    console.log("hello");
    if (currentSelected === dataTypes.NATIONAL) {
      main(dataTypes.REGIONAL);
    } else {
      main(dataTypes.NATIONAL);
    }
  }
});

main(dataTypes.NATIONAL).catch(console.log);
