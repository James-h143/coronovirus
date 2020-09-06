const LCDPLATE = require("adafruit-i2c-lcd").plate;
const lcd = new LCDPLATE(1, 0x20);
const fetch = require("node-fetch");

// lcd.backlight(lcd.colors.RED);
// lcd.message("M'stone");

// lcd.on("button_change", function (button) {
//   lcd.clear();
//   lcd.message("Button changed:\n" + lcd.buttonName(button));
// });
let dataType = "national";

let screenData = [{ color: "GREEN", line1: "fetching data", line2: "" }];

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
  let line1 = data[0].name;
  let line2 = "Cases: " + data[0].cases;
  let percIncDec = ((data[0].cases - data[1].cases) / data[0].cases) * 100.0;
  let color;
  if (percIncDec <= 0) {
    color = lcd.colors.GREEN;
  } else if (percIncDec <= 10) {
    color = lcd.colors.YELLOW;
  } else {
    color = lcd.colors.RED;
  }

  return { color, line1, line2 };
}

function setScreen() {
  //
}

async function main() {
  let latestData = await getData();
  let screenData = await getScreenData(latestData[dataType]);
  console.log(latestData);
}

main().catch(console.log);
