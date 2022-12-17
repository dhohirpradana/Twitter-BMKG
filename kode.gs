var listIndonesianProvince = [
  "Aceh",
  "Bali",
  "Banten",
  "Bengkulu",
  "DI Yogyakarta",
  "DKI Jakarta",
  "Gorontalo",
  "Jambi",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Kalimantan Barat",
  "Kalimantan Selatan",
  "Kalimantan Tengah",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Bangka Belitung",
  "Kepulauan Riau",
  "Lampung",
  "Maluku",
  "Maluku Utara",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Papua",
  "Papua Barat",
  "Riau",
  "Sulawesi Barat",
  "Sulawesi Selatan",
  "Sulawesi Tengah",
  "Sulawesi Tenggara",
  "Sulawesi Utara",
  "Sumatera Barat",
  "Sumatera Selatan",
  "Sumatera Utara",
];

var cuaca = {
  c1: "Cerah",
  c3: "Berawan",
  c60: "Hujan Ringan",
  c95: "Hujan Petir",
  c4: "Cerah Berawan",
};

var kecCuaca = [];

function postTweetBmkg() {
  async function getWeather(province) {
    var prov = province.replace(" ", "").replace(" ", "");
    var url = `https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-${prov}.xml`;
    var response = UrlFetchApp.fetch(url);
    var data = response.getContentText();

    let document = XmlService.parse(data);
    let root = document.getRootElement();

    let forecast = root.getChild("forecast");
    let areas = forecast.getChildren("area");
    areas.forEach((area) => {
      let domain = area.getAttribute("domain").getValue();
      let kecamatan = area.getAttribute("description").getValue();
      if (domain == province) {
        let parameters = area.getChildren("parameter");
        parameters.forEach((parameter) => {
          var description = parameter.getAttribute("description").getValue();
          if (description == "Weather") {
            var timerages = parameter.getChildren("timerange");
            timerages.forEach((timerange) => {
              var value = `c${parseInt(timerange.getValue())}`;
              let h = timerange.getAttribute("h").getValue();
              let date = new Date();
              var jakartaDate = Utilities.formatDate(
                date,
                "Asia/Jakarta",
                "yyyy-MM-dd HH:mm"
              );
              let result = jakartaDate.slice(11, 14);
              var currHours = parseInt(result);
              if (currHours >= h && currHours < h + 6) {
                return kecCuaca.push({
                  domain,
                  kecamatan,
                  cuaca: cuaca[value] ?? "Cerah",
                });
              }
            });
          }
        });
        return;
      }
    });
    var textToPostKecCuaca = "";
    var kab = "";

    kecCuaca.forEach((cuaca) => {
      kab = cuaca.domain;
      textToPostKecCuaca += `\n${cuaca.kecamatan} ${cuaca.cuaca}`;
    });

    var rand = kecCuaca[Math.floor(Math.random() * kecCuaca.length)];

    if (kecCuaca.length) {
      var textToPost = `PRAKIRAAN CUACA\n---------------------------\n${rand.kecamatan}, ${kab} ${rand.cuaca}`;
      if (!service.hasAccess()) {
        console.log("Authentication Failed");
      } else {
        var status = textToPost + "\n\n𝒷𝓎 " + "BMKG Indonesia";
        try {
          var response = service.sendTweet(status, params);
        } catch (e) {
          console.log(e);
        }
      }
    }
  }
  getWeather(
    listIndonesianProvince[
      Math.floor(Math.random() * listIndonesianProvince.length)
    ]
  );
}
