const LCDPLATE = require("adafruit-i2c-lcd").plate;
const lcd = new LCDPLATE(1, 0x20);

lcd.backlight(lcd.colors.RED);
lcd.message("M'stone");

lcd.on("button_change", function (button) {
  lcd.clear();
  lcd.message("Button changed:\n" + lcd.buttonName(button));
});

async function main() {
  //
}

main().catch(console.log);
