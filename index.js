const LCDPLATE = require("adafruit-i2c-lcd").plate;
const lcd = new LCDPLATE(1, 0x20);
const fetch = require("node-fetch");

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

let screenData = { color: lcd.colors.GREEN, line1: "fetching data", line2: "" };

async function getData() {
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

async function getScreenData(data) {
  console.log(JSON.stringify(data));
  let percIncDec = ((data[0].cases - data[1].cases) / data[0].cases) * 100.0;
  let percRounded = Math.round(percIncDec * 100) / 100;

  let color;
  if (percRounded <= 0) {
    color = lcd.colors.GREEN;
  } else if (percRounded <= 10) {
    color = lcd.colors.YELLOW;
  } else {
    color = lcd.colors.RED;
  }

  let line1 = data[0].name;
  let line2 = "Cases: " + data[0].cases + "  ↓" + percRounded + "%";

  return { color, line1, line2 };
}

function setScreen(obj) {
  lcd.clear();
  lcd.backlight(obj.color);
  lcd.message(obj.line1 + "\n" + obj.line2);
}

async function main(dataType) {
  await setScreen(screenData);
  let latestData = await getData();
  screenData = await getScreenData(latestData[dataType]);
  await setScreen(screenData);

  //   console.log(latestData);
}

lcd.on("button_change", function (button) {
  // if(dat)
});

main(dataTypes.REGIONAL).catch(console.log);
